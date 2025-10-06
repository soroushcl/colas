import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import FetchApi from '@/services/api';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeSubscriptionProduct = process.env.STRIPE_SUBSCRIPTION_PRODUCTION;
const stripeTaxRatesEnv = process.env.STRIPE_TAX_RATES; // JSON array, comma-separated, or single ID
const stripeTrialProduct = process.env.STRIPE_TRIAL_PRODUCT;

const getShippingDate = (date?: Date) => {
    let now = new Date();
    if (date) now = date;
    const t = now.getDay();
    let diff = 0;
    if (t <= 4 && t >= 2 || (t == 5 && now.getHours() <= 3)) { //from Tuesday to Friday the delivery Date will be next Tuesday
        diff = (7 + (2 - t)) % 7 || 7;
    } else {
        diff = ((7 + (2 - t)) % 7) + 7;
    }
    return new Date(new Date(now.setDate(now.getDate() + diff)).setHours(0, 0, 0));

}


export async function POST(request: Request) {
    if (!stripeSecretKey) {
        return NextResponse.json(
            { error: 'Missing STRIPE_SECRET_KEY server environment variable.' },
            { status: 500 }
        );
    }

    try {
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2025-08-27.basil',
        });

        const body = await request.json().catch(() => ({} as Record<string, unknown>));
        const paymentIntentId: string | undefined = body.paymentIntentId;
        const registeredDogs: Record<string, unknown>[] = Array.isArray(body.registeredDogs) ? body.registeredDogs : [];
        const emailFromBody: string | undefined = typeof body.email === 'string' ? body.email : undefined;

        if (!paymentIntentId) {
            return NextResponse.json({ error: 'paymentIntentId is required' }, { status: 400 });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'requires_capture') {
            return NextResponse.json(
                { error: `PaymentIntent not in a billable state: ${paymentIntent.status}` },
                { status: 400 }
            );
        }

        // Determine or create a customer
        let customerId: string | null = typeof paymentIntent.customer === 'string' ? paymentIntent.customer : paymentIntent.customer?.id || null;
        if (!customerId) {
            const email = emailFromBody || (paymentIntent.receipt_email as string | null) || undefined;
            const createdCustomer = await stripe.customers.create({ email });
            customerId = createdCustomer.id;
        }

        // Determine payment method to reuse for subscription
        const paymentMethodId =
            typeof paymentIntent.payment_method === 'string'
                ? paymentIntent.payment_method
                : paymentIntent.payment_method?.id;

        if (!paymentMethodId) {
            return NextResponse.json({ error: 'No payment method on PaymentIntent' }, { status: 400 });
        }

        // Attach payment method to customer and set as default for invoices
        try {
            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        } catch (attachError: unknown) {
            const message = (attachError as Error)?.message || 'Failed to attach payment method to customer';
            return NextResponse.json(
                { error: message },
                { status: 400 }
            );
        }
        await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });

        // Validate required envs for product IDs
        if (!stripeSubscriptionProduct || !stripeTrialProduct) {
            return NextResponse.json({ error: 'Missing Stripe product ids (STRIPE_SUBSCRIPTION_PRODUCTION or STRIPE_TRIAL_PRODUCT).' }, { status: 500 });
        }

        // Normalize tax rates to string[] | undefined supporting JSON array, CSV, or single ID
        const parseTaxRates = (input?: string): string[] | undefined => {
            if (!input) return undefined;
            const trimmed = input.trim();
            // JSON array case
            if (trimmed.startsWith('[')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        return parsed.map(String).map(s => s.trim()).filter(Boolean);
                    }
                } catch {
                    // fall through
                    // fall through
                }
            }
            // CSV case
            if (trimmed.includes(',')) {
                return trimmed.split(',').map(s => s.trim()).filter(Boolean);
            }
            // Single ID case
            return [trimmed];
        };

        const taxRateIds: string[] | undefined = parseTaxRates(stripeTaxRatesEnv);

        const trial_end = new Date(getShippingDate().getTime() + 9 * 24 * 60 * 60 * 1000).setHours(8, 0, 0);
        // Create subscription(s)
        if (!registeredDogs.length) {
            return NextResponse.json({ error: 'registeredDogs is required' }, { status: 400 });
        }
        const createdSubscriptions: { subscriptionId: string, dogId: string }[] = [];
        for (let i = 0; i < registeredDogs.length; i++) {
            const entry = registeredDogs[i] || {};
            const dog = entry.dog || {};
            const subInfo = entry.subscription || {};
            const recurringDays = Number((subInfo as Record<string, unknown>).recurring) || 14;
            const dailyPrice = Number((subInfo as Record<string, unknown>).dailyPrice) || 0;

            const stripeSubscription = {
                customer: customerId,
                metadata: { "dog_id": String((dog as Record<string, unknown>).id || (dog as Record<string, unknown>)._id || ''), "dog_name": String((dog as Record<string, unknown>).name || '') },
                items: [{
                    price_data: {
                        currency: "cad",
                        product: stripeSubscriptionProduct as string,
                        recurring: {
                            interval: 'week' as const,
                            interval_count: Math.max(1, Math.floor(recurringDays / 7)),
                        },
                        unit_amount: Math.floor(dailyPrice * recurringDays * 100)
                    },
                    ...(taxRateIds && taxRateIds.length ? { tax_rates: taxRateIds } : {}),
                }],
                expand: ['latest_invoice.payment_intent'],
                trial_end: parseInt((trial_end / 1000).toString()),
                add_invoice_items: [{
                    price_data: {
                        currency: "cad",
                        product: stripeTrialProduct as string,
                        unit_amount: Math.floor(dailyPrice * 14 * 100)
                    },
                    ...(taxRateIds && taxRateIds.length ? { tax_rates: taxRateIds } : {}),
                }],
                proration_behavior: 'none'
            }
            // if (promo) {
            //     console.log("stripe create sub if promo", promo)
            //     let stripeDiscounts = []
            //     if (promo.code === "FRESHSTART") {
            //         stripeDiscounts.push({ promotion_code: "promo_1QppuNDdRheeRVEywVuUEYMM" })
            //         stripeDiscounts.push({ promotion_code: "promo_1QkWk6DdRheeRVEyfSczBcoh" })
            //         stripeSubscription.discounts = stripeDiscounts
            //     } else {
            //         let stripePromotion = await stripe.promotionCodes.retrieve(promo.stripePromoCodeId);
            //         if (stripePromotion.active) {
            //             stripeSubscription.promotion_code = promo.stripePromoCodeId;
            //         } else {
            //             return res.status(500).send({ error: { message: "Promo code is not active." } })
            //         }
            //     }
            //     // stripeSubscription.coupon = pc.stripeCouponId;
            // }
            // console.log("debug first", stripeCustomer.subscriptions, dog._id)

            const created = await stripe.subscriptions.create(stripeSubscription as Stripe.SubscriptionCreateParams);
            const dogIdStr: string = String((dog as Record<string, unknown>).id || (dog as Record<string, unknown>)._id || "");
            createdSubscriptions.push({ subscriptionId: created.id, dogId: dogIdStr });

        }

        // Call backend API once to persist StripeCustomer with all subscriptions
        try {
            const api = new FetchApi(global.fetch.bind(global), process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");
            const email = emailFromBody || (paymentIntent.receipt_email as string | null) || undefined;
            await api.request(`${api.baseUrl}/authentication/stripe-customer/create`, {
                method: 'POST',
                body: {
                    email,
                    name: String((body.name as string) || ''),
                    stripeCustomerId: customerId,
                    billingAddress: body?.billingAddress || undefined,
                    userId: body?.userId || (body?.user?._id || body?.user?.id),
                    subscriptions: createdSubscriptions,
                }
            });
        } catch (persistErr) {
            console.error('Failed to persist StripeCustomer via backend', persistErr);
        }

        // Update user info in backend after successful payment
        try {
            const api = new FetchApi(global.fetch.bind(global), process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");
            const userPayload = {
                id: String(body?.user?.id || body?.user?._id || body?.userId || ''),
                name: String(body?.user?.name || body?.name || ''),
                firstName: String(body?.user?.firstName || body?.firstName || ''),
                lastName: typeof (body?.user?.lastName || body?.lastName) === 'string' ? (body?.user?.lastName || body?.lastName) : undefined,
                email: String(body?.user?.email || body?.email || ''),
                phoneNumber: typeof (body?.user?.phoneNumber || body?.phoneNumber) === 'string' ? (body?.user?.phoneNumber || body?.phoneNumber) : undefined,
                password: typeof body?.password === 'string' ? body.password : undefined,
            };
            if (userPayload.id) {
                await api.request(`${api.baseUrl}/authentication/update-user-by-id`, { method: 'POST', body: userPayload });
            }
           
        } catch (e) {
            console.error('User update after payment failed', e);
        }

        return NextResponse.json({ subscriptions: createdSubscriptions });

    } catch (e: unknown) {
        console.log(e);
        const message = (e as Error)?.message || 'Unexpected error';
        return NextResponse.json({ error: message }, { status: 500 });
    }

}
