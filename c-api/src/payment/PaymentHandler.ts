import { RequestHandler } from "express";
import { paymentIntentResponseBody, paymentIntentRequestBody, Success, Fail } from "c-lib";
import { PaymentRepository, PromoCodeRepository } from "./repositories/index.js";
import Stripe from 'stripe';

interface ApplyPromoCodeRequestBody {
    promoCode: string;
}

interface ApplyPromoCodeResponseBody {
    discount?: number;
    err?: string;
}

export const paymentHandlerFactory = (paymentRepo: PaymentRepository, promoCodeRepo: PromoCodeRepository, stripeSecret: string) => {
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

    return {
        createPaymentIntent,
        applyPromoCode
    };
};