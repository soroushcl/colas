import Stripe from 'stripe';
import { PaymentRepository } from './PaymentRepository.js';

export class StripePaymentRepository extends PaymentRepository {
  private stripe: Stripe;

  constructor(secretKey: string) {
    super();
    this.stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });
  }

  async createPaymentIntent(amount: number, currency: string): Promise<string> {
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount');
    if (!currency) throw new Error('Currency is required');

    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
    });

    if (!intent.client_secret) throw new Error('No client secret returned');
    return intent.client_secret;
  }
}


