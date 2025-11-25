import { RequestHandler } from "express";
import { paymentIntentResponseBody, paymentIntentRequestBody, Success, Fail, Order, OrderStatus } from "c-lib";
import { PaymentRepository, PromoCodeRepository } from "./repositories/index.js";
import { OrderRepository, DogRepository, SubscriptionRepository, StripeCustomerRepository } from "@auth/repositories/index.js";
import Stripe from 'stripe';

interface ApplyPromoCodeRequestBody {
    promoCode: string;
}

interface ApplyPromoCodeResponseBody {
    discount?: number;
    err?: string;
}

export const paymentHandlerFactory = (
    paymentRepo: PaymentRepository, 
    promoCodeRepo: PromoCodeRepository, 
    stripeSecret: string,
    orderRepo: OrderRepository,
    dogRepo: DogRepository,
    subscriptionRepo: SubscriptionRepository,
    stripeCustomerRepo: StripeCustomerRepository
) => {
    const createPaymentIntent: RequestHandler<{}, paymentIntentResponseBody, paymentIntentRequestBody> = async (req, res) => {
        const { amount, currency } = req.body;
        try {
            const clientSecret = await paymentRepo.createPaymentIntent(amount, currency);
            res.json(Success({ clientSecret }));
        } catch (error) {
            console.error('Error creating payment intent:', error);
            res.status(500).json(Fail(new Error('Failed to create payment intent').toString()));
        }
    };

    const applyPromoCode: RequestHandler<{}, ApplyPromoCodeResponseBody, ApplyPromoCodeRequestBody> = async (req, res) => {
        const { promoCode } = req.body;
        try {
            const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

            if (promoCode) {
                const promo = await promoCodeRepo.findPromoCodeByCode(promoCode);
                if (promo) {
                    const stripePromotion = await stripe.promotionCodes.retrieve(promo.stripePromoCodeId);
                    if (stripePromotion.active) {
                        res.json({ "discount": stripePromotion.coupon.percent_off ?? undefined });
                    } else {
                        res.json({ 'err': 'Promo code is not active.' });
                    }
                } else {
                    res.json({ 'err': 'Promo code is not valid.' });
                }
            } else {
                res.json({ 'err': 'Promo code is required.' });
            }
        } catch (error) {
            console.error('Error applying promo code:', error);
            res.status(500).json({ 'err': 'Failed to apply promo code.' });
        }
    };

    const webhooks: RequestHandler<{}> = async (req, res) => {
        let event;
        const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
        try {
            const webhookSecret = process.env['STRIPE_WEBHOOK_KEY'];
            if (!webhookSecret) {
                console.log('⚠️  STRIPE_WEBHOOK_KEY not set');
                return res.sendStatus(400);
            }
            event = stripe.webhooks.constructEvent(
                req.body,
                req.header('Stripe-Signature') || '',
                webhookSecret
            );
        } catch (err) {
            console.log(err);
            console.log(`⚠️  Webhook signature verification failed.`);
            console.log(
                `⚠️  Check the env file and enter the correct webhook secret.`
            );
            return res.sendStatus(400);
        }
        // Extract the object from the event.
        const dataObject = event.data.object;

        // Handle the event
        // Review important events for Billing webhooks
        // https://stripe.com/docs/billing/webhooks
        // Remove comment to see the various objects sent for this sample
        let sc;
        switch (event.type) {
            case 'invoice.paid':
                // Used to provision services after the trial has ended.
                // The status of the invoice will show up as paid. Store the status in your
                // database to reference when a user accesses your service to avoid hitting rate limits.
                const invoicePaid = dataObject as Stripe.Invoice;
                console.log('invoice.paid:', JSON.stringify(invoicePaid, null, 2))
                if (invoicePaid.subtotal === 0 && invoicePaid.total === 0) {
                    return res.sendStatus(200);
                } else {
                    sc = await stripeCustomerRepo.findStripeCustomerByStripeCustomerId(invoicePaid.customer as string)
                    if (sc) {
                        let order = await orderRepo.findOrderByInvoiceNumber(sc.userId, invoicePaid.id)
                        if (order) {
                            console.log('old', sc.userId, invoicePaid.id)
                            await dogRepo.checkAndUpdateDogLifeStage(order.dog)
                            let dog = await dogRepo.findDogById(order.dog);
                            if (!dog || !dog.subscription) {
                                console.log('no Dog found or no subscription!', order.dog)
                                return res.sendStatus(400);
                            }
                            
                            if (!order.currentPeriodEnd || !order.shippingDate) {
                                console.log('Order missing required dates', order.id)
                                return res.sendStatus(400);
                            }
                            
                            await orderRepo.updateOrder(sc.userId, { invoiceNumber: invoicePaid.id }, { status: OrderStatus.aggregation, amountPaid: invoicePaid.amount_paid })
                            
                            const newOrder: Order = {
                                ...order,
                                id: undefined as any,
                                invoiceNumber: undefined as any,
                                createdAt: undefined as any,
                                updatedAt: undefined as any,
                                shipmentDate: undefined as any,
                                carrier: undefined as any,
                                deliveryProofPicture: undefined as any,
                                currentPeriodStart: new Date(order.currentPeriodEnd),
                                currentPeriodEnd: new Date(order.currentPeriodEnd.getTime() + dog.subscription.recurring * 24 * 3600 * 1000),
                                shippingDate: new Date(order.shippingDate.getTime() + order.detail.recurring * 24 * 3600 * 1000),
                                price: dog.subscription.dailyPrice * dog.subscription.recurring,
                                status: OrderStatus.active,
                                detail: {
                                    type: dog.subscription.type,
                                    selectedRecipes: dog.subscription.selectedRecipes,
                                    info: dog.subscription.info,
                                    dailyPrice: dog.subscription.dailyPrice,
                                    recurring: dog.subscription.recurring,
                                    promoCode: ""
                                }
                            };
                            await orderRepo.addOrder(newOrder);
                        } else {
                            console.log('new', sc.userId, invoicePaid.id)
                            const subscription = await stripe.subscriptions.retrieve(invoicePaid.subscription as string)
                            if (subscription.metadata && subscription.metadata.dog_id) {
                                let dog = await dogRepo.findDogById(subscription.metadata.dog_id)
                                if (dog && dog.subscription) {
                                    order = await orderRepo.findOrderByUserIdAndDogIdAndStatus(sc.userId, dog.id, ['trialing', 'active', 'tempPaymentFailed'])
                                    if (order && order.currentPeriodEnd && order.shippingDate) {
                                        await dogRepo.checkAndUpdateDogLifeStage(dog.id)
                                        await subscriptionRepo.updateSubscriptionStatus(sc.userId, dog.id, 'active')
                                        
                                        await orderRepo.updateOrder(sc.userId, { dog: dog.id }, { status: OrderStatus.aggregation, invoiceNumber: invoicePaid.id, amountPaid: invoicePaid.amount_paid })
                                        
                                        const newOrder: Order = {
                                            ...order,
                                            id: undefined as any,
                                            invoiceNumber: undefined as any,
                                            createdAt: undefined as any,
                                            updatedAt: undefined as any,
                                            shipmentDate: undefined as any,
                                            carrier: undefined as any,
                                            deliveryProofPicture: undefined as any,
                                            currentPeriodStart: new Date(order.currentPeriodEnd),
                                            currentPeriodEnd: new Date(order.currentPeriodEnd.getTime() + dog.subscription.recurring * 24 * 3600 * 1000),
                                            shippingDate: new Date(order.shippingDate.getTime() + dog.subscription.recurring * 24 * 3600 * 1000),
                                            price: dog.subscription.dailyPrice * dog.subscription.recurring,
                                            status: OrderStatus.active,
                                            detail: {
                                                type: dog.subscription.type,
                                                selectedRecipes: dog.subscription.selectedRecipes,
                                                info: dog.subscription.info,
                                                dailyPrice: dog.subscription.dailyPrice,
                                                recurring: dog.subscription.recurring,
                                                promoCode: ""
                                            }
                                        };

                                        await orderRepo.addOrder(newOrder);
                                    } else {
                                        console.log("No active order found for", sc.userId, dog.id)
                                    }
                                } else {
                                    console.log('no Dog found!', subscription.metadata.dog_id)
                                    return res.sendStatus(400);
                                }
                            } else {
                                console.log('no metadata !!!', invoicePaid.subscription)
                                return res.sendStatus(400);
                            }
                        }
                    } else {
                        console.log('no stripe customer find!!!', invoicePaid.customer)
                        return res.sendStatus(400);
                    }
                }

                //if the invoiceId is in order, it means we know the guys paid, if not we have to find the dog by subscriptionId metadata and then update the active subscription.
                break;
            case 'invoice.payment_failed':
                //TODO dont crete new order
                // If the payment fails or the customer does not have a valid payment method,
                //  an invoice.payment_failed event is sent, the subscription becomes past_due.
                // Use this webhook to notify your user that their payment has
                // failed and to retrieve new card details.
                const invoiceFailed = dataObject as Stripe.Invoice;
                console.log('invoice.payment_failed:', JSON.stringify(invoiceFailed, null, 2))
                sc = await stripeCustomerRepo.findStripeCustomerByStripeCustomerId(invoiceFailed.customer as string)
                if (sc) {
                    let order = await orderRepo.findOrderByInvoiceNumber(sc.userId, invoiceFailed.id)
                    if (order) {
                        // ???? may be do the same for subscription? (status paused?)
                    } else {
                        const subscription = await stripe.subscriptions.retrieve(invoiceFailed.subscription as string)
                        if (subscription.metadata && subscription.metadata.dog_id) {
                            let dog = await dogRepo.findDogById(subscription.metadata.dog_id)
                            if (dog) {
                                await orderRepo.updateOrder(sc.userId, { dog: dog.id }, { status: OrderStatus.tempPaymentFailed, invoiceNumber: invoiceFailed.id })
                            } else {
                                console.log('no Dog found!')
                                return res.sendStatus(400);
                            }
                        } else {
                            console.log('no metadata !!!')
                            return res.sendStatus(400);
                        }
                    }
                } else {
                    console.log('no stripe customer find!!!')
                    return res.sendStatus(400);
                }
                break;
            case 'invoice.finalized':
                // If you want to manually send out invoices to your customers
                // or store them locally to reference to avoid hitting Stripe rate limits.
                console.log('invoice.finalized:', JSON.stringify(dataObject, null, 2))
                break;
            case 'invoice.marked_uncollectible':
                const invoiceUncollectible = dataObject as Stripe.Invoice;
                sc = await stripeCustomerRepo.findStripeCustomerByStripeCustomerId(invoiceUncollectible.customer as string)
                if (sc) {
                    // let order = await Order.findOne({userId: sc.userId, invoiceNumber: dataObject.id})
                    // if(order){
                    //     order.status = 'paused';
                    //     await order.save();
                    //     // ???? may be do the same for subscription? (status paused?)
                    // }else{
                    const subscription = await stripe.subscriptions.retrieve(invoiceUncollectible.subscription as string)
                    if (subscription.metadata && subscription.metadata.dog_id) {
                        let dog = await dogRepo.findDogById(subscription.metadata.dog_id)
                        if (dog) {
                            // await Subscription.findOneAndUpdate({ userId: sc.userId, dog: dog._id, status: 'active' }, { $set: { status: "paused" } }, { new: true, runValidators: true, context: 'query' }).lean();
                            // await Order.findOneAndUpdate({ userId: sc.userId, dog: dog._id, status: 'active' }, { $set: { status: "paused", invoiceNumber: dataObject.id } }, { new: true, runValidators: true, context: 'query' }).lean();
                        } else {
                            console.log('no Dog found!')
                            return res.sendStatus(400);
                        }
                    } else {
                        console.log('no metadata !!!')
                        return res.sendStatus(400);
                    }
                    // }
                } else {
                    console.log('no stripe customer find!!!')
                    return res.sendStatus(400);
                }
                break;
            case 'invoice.upcoming':
                // If you want to manually send out invoices to your customers
                // or store them locally to reference to avoid hitting Stripe rate limits.
                const invoiceUpcoming = dataObject as Stripe.Invoice;
                // console.log('invoice.upcoming:', JSON.stringify(invoiceUpcoming, null, 2))
                sc = await stripeCustomerRepo.findStripeCustomerByStripeCustomerId(invoiceUpcoming.customer as string)
                if (sc) {
                    const subscription = await stripe.subscriptions.retrieve(invoiceUpcoming.subscription as string)
                    // let subscriptionItemId = subscription.items.data[0].id
                    if (subscription.metadata && subscription.metadata.dog_id) {
                        let dbSubscription = await subscriptionRepo.findSubscriptionByUserIdAndDogId(sc.userId, subscription.metadata.dog_id)
                        if (dbSubscription) {
                            // await this.sendUpcomingOrderEmail(subscription.metadata.dog_id, dbSubscription._id, res)
                            return res.sendStatus(200);
                        } else {
                            console.log('no Subscription found!')
                            return res.sendStatus(400);
                        }
                    } else {
                        console.log('no metadata !!!')
                        return res.sendStatus(400);
                    }
                } else {
                    console.log('no stripe customer find!!!')
                    return res.sendStatus(400);
                }
                break;
            case 'customer.subscription.deleted':
                if (event.request != null) {
                    // let sub = await Subscription.findOne({userId: req.user._id, dog: req.dog._id}).lean();
                    // if(sub){
                    //     try{
                    //         sub.status = 'canceled';
                    //         sub.canceledReason = {description: req.body.description, reason: req.body.reason};
                    //         await SubscriptionHistory.create(sub);
                    //         await Subscription.deleteOne({userId: req.user._id, dog: req.dog._id});
                    //         await Order.updateMany({userId: req.user._id, dog: req.dog._id, status:'active'},{status: 'canceled'})

                    //         await CanceledDog.create(req.dog);
                    //         await Dog.deleteOne({_id: req.dog._id});

                    //         await User.findOneAndUpdate({_id: req.user._id},{$pull:{dogs: req.dog._id}});

                    //         res.send({'status': 'success'})
                    //     }
                    //     catch(err){
                    //         console.log(err)
                    //     }
                    // }else{
                    //     res.status(500).send('No subscription found')
                    // }
                    console.log('customer.subscription.deleted:', JSON.stringify(dataObject, null, 2))
                    // handle a subscription cancelled by your request
                    // from above.
                } else {
                    // handle subscription cancelled automatically based
                    // upon your subscription settings.
                }
                break;
            case 'customer.subscription.trial_will_end':
                console.log("customer.subscription.trial_will_end", JSON.stringify(dataObject, null, 2))
                // Send notification to your user that the trial will end
                break;
            default:
            // Unexpected event type
                console.log(`Unhandled event type: ${event.type}`);
        }
        return res.sendStatus(200);
    }


    return {
        createPaymentIntent,
        applyPromoCode,
        webhooks
    };
};