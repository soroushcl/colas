import { SubscriptionRepository } from '../SubscriptionRepository';
import { Subscription, User } from 'c-lib';

export class SubscriptionRepositoryInMemory extends SubscriptionRepository {

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