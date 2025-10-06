
export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface StripeCustomerSubscriptionEntry {
  subscriptionId: string;
  dogId: string; // stored as ObjectId string
  createdAt: Date;
  updatedAt: Date;
}

export interface StripeCustomerDocument {
  id: string; // Mongo ObjectId string
  userId: string; // Mongo ObjectId string
  email: string;
  name: string;
  stripeCustomerId: string;
  billingAddress?: BillingAddress;
  subscriptions: StripeCustomerSubscriptionEntry[];
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

export abstract class StripeCustomerRepository {
  abstract upsertStripeCustomer(doc: StripeCustomerDocument): Promise<StripeCustomerDocument> | Promise<never>;
  abstract getPaymentMethod(uId: string): Promise<{ cards: any[]; billingAddress: any; }>;
}


