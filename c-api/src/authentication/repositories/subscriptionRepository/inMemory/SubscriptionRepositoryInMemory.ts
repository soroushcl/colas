import { SubscriptionRepository } from '../SubscriptionRepository';
import { Address, Dog, PriceVersion, Subscription, User } from 'c-lib';

export class SubscriptionRepositoryInMemory extends SubscriptionRepository {
  updateUserShipping(userId: User['id'], shippingAddress: Address): Promise<true> | Promise<never> {
    throw new Error('Method not implemented.');
  }
  updateDogSubscriptions(dog: Dog['id'], dailyPrice: number): Promise<true> | Promise<never> {
    throw new Error('Method not implemented.');
  }
  subscriptionPriceCalculator(subscription: Subscription): number {
    throw new Error('Method not implemented.');
  }
  findPriceVersionById(id: PriceVersion['id']): Promise<PriceVersion | null> | Promise<never> {
    throw new Error('Method not implemented.');
  }
  createDogDailyPrice(dog: Dog, priceVersion: number): Promise<number | undefined> {
    throw new Error('Method not implemented.' + dog + priceVersion);
  }
  recurringCalculator(dog: Dog, subscription: Subscription): number {
    console.log(dog, subscription)
    throw new Error('Method not implemented.');
  }

  generateSubscription(subscription: Subscription): Promise<Subscription> | Promise<never> {
    console.log('In Memory generateSubscriptions dog', subscription.id)
    throw new Error('Method not implemented.3');
  }

  addSubscription(subscription: Subscription): Promise<Subscription> | Promise<never> {
    return new Promise((resolve, reject) => {
      this.db.push(subscription as Subscription);
      resolve(subscription as Subscription);
    });
  }

  private db: Subscription[];

  constructor(db: Subscription[]) {
    super();
    this.db = db;
  }

  findSubscriptionsByUserId(userId: User['id']): Promise<Subscription[]> | Promise<never> {
    return new Promise((resolve) => {
      resolve(this.db.filter(d => d.userId === userId));
    });
  }

  findSubscriptionsById(id: Subscription['id']): Promise<Subscription> | Promise<never> {
    return new Promise((resolve) => {
      resolve(this.db.filter(d => d.id === id)[0]);
    });
  }

  async subscriptionDiscountedPriceCalculator(subscription: Subscription): Promise<number> {
    // In-memory implementation: return the dailyPrice if available, otherwise return 0
    return subscription.dailyPrice || 0;
  }

}