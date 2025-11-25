import express from "express";
import { paymentHandlerFactory } from "./PaymentHandler.js";
import { PaymentRepository, PromoCodeRepository } from "./repositories/index.js";
import { OrderRepository, DogRepository, SubscriptionRepository, StripeCustomerRepository } from "@auth/repositories/index.js";

export const paymentRouterFactory = (
  paymentRepo: PaymentRepository, 
  promoCodeRepo: PromoCodeRepository, 
  stripeSecret: string,
  orderRepo: OrderRepository,
  dogRepo: DogRepository,
  subscriptionRepo: SubscriptionRepository,
  stripeCustomerRepo: StripeCustomerRepository
) => {
  const router = express.Router();
  const { createPaymentIntent, applyPromoCode, webhooks } = paymentHandlerFactory(
    paymentRepo, 
    promoCodeRepo, 
    stripeSecret,
    orderRepo,
    dogRepo,
    subscriptionRepo,
    stripeCustomerRepo
  );

  router.post('/createPaymentIntent', createPaymentIntent);
  router.post('/apply-promocode', applyPromoCode);
  router.post('/stripe/webhook-test', webhooks);

  return router;
}


