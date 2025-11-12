import { Subscription, User} from 'c-lib';

export abstract class SubscriptionRepository {
  abstract addSubscription(subscription: Subscription): Promise<Subscription> | Promise<never>;
  abstract generateSubscription(subscription: Subscription): Promise<Subscription> | Promise<never>;
  abstract findSubscriptionsByUserId(userId: User['id']): Promise<Subscription[]> | Promise<never>;
  abstract subscriptionDiscountedPriceCalculator(subscription: Subscription): Promise<number>;
}
