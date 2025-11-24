import { Collection, Db, ObjectId } from 'mongodb';
import { StripeCustomerDocument, StripeCustomerRepository } from '../StripeCustomerRepository.js';
import Stripe from 'stripe';

type MongoDoc = Omit<StripeCustomerDocument, 'id' | 'userId'> & { _id: ObjectId; userId: ObjectId };

export class StripeCustomerMongoRepository extends StripeCustomerRepository {
  private collection: Collection<MongoDoc>;
  stripe: Stripe;

  constructor(db: Db, collectionName: string) {
    super();
    this.collection = db.collection(collectionName);
    this.stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', { apiVersion: '2024-06-20' });
  }

  async getPaymentMethod(uId: string): Promise<{ cards: any[]; billingAddress: any; }> {
    if (uId) {
      let userId = new ObjectId(uId);
      const doc = await this.collection.findOne({ userId })
      if (doc) {
        const { stripeCustomerId, billingAddress } = doc;
        const pm = await this.stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: 'card',
        }).catch((err: any) => console.log(err))
        if (pm) {
          return { cards: pm.data, billingAddress }
        }
      }
      return { cards: [], billingAddress: null }
    }
    return { cards: [], billingAddress: null }
  }

  async getCustomerByUserId(id: string): Promise<{ stripeCustomer: StripeCustomerDocument }> {
    if (!id) {
      throw new Error('Stripe customer not found for user');
    }

    const userId = new ObjectId(id);
    const doc = await this.collection.findOne({ userId });

    if (!doc) {
      throw new Error('Stripe customer not found for user');
    }

    const { _id, userId: mongoUserId, ...rest } = doc;

    return {
      stripeCustomer: {
        ...rest,
        id: _id.toHexString(),
        userId: mongoUserId.toHexString(),
      },
    };
  }




  async upsertStripeCustomer(doc: StripeCustomerDocument): Promise<StripeCustomerDocument> {
    const now = new Date();
    const userId = new ObjectId(doc.userId);

    const subscriptions = (doc.subscriptions || []).map(s => ({
      subscriptionId: s.subscriptionId,
      dogId: s.dogId,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));

    const update: any = {
      $setOnInsert: {
        _id: new ObjectId(),
        userId,
        email: doc.email,
        name: doc.name,
        stripeCustomerId: doc.stripeCustomerId,
        billingAddress: doc.billingAddress,
        createdAt: doc.createdAt ?? now,
        __v: typeof doc.__v === 'number' ? doc.__v : 1,
      },
      $set: { updatedAt: now },
    };
    if (subscriptions.length) {
      update.$addToSet = { subscriptions: { $each: subscriptions } };
    }

    await this.collection.updateOne(
      { stripeCustomerId: doc.stripeCustomerId },
      update,
      { upsert: true }
    );

    return {
      ...doc,
      id: (doc.id as string) || '',
      userId: userId.toString(),
      createdAt: doc.createdAt ?? now,
      updatedAt: now,
      __v: typeof doc.__v === 'number' ? doc.__v : 1,
    };
  }
}


