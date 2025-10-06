import express from "express";
import { paymentHandlerFactory } from "./PaymentHandler.js";
import { PaymentRepository, PromoCodeRepository } from "./repositories/index.js";

export const paymentRouterFactory = (paymentRepo: PaymentRepository, promoCodeRepo: PromoCodeRepository, stripeSecret: string) => {
  const router = express.Router();
  const { createPaymentIntent, applyPromoCode } = paymentHandlerFactory(paymentRepo, promoCodeRepo, stripeSecret);

  router.post('/createPaymentIntent', createPaymentIntent);
  router.post('/apply-promocode', applyPromoCode);

  return router;
}


