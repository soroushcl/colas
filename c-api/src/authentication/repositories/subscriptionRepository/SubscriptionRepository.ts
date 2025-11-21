import { Dog, PriceVersion, Subscription, User} from 'c-lib';

export abstract class SubscriptionRepository {
  abstract addSubscription(subscription: Subscription): Promise<Subscription> | Promise<never>;
  abstract generateSubscription(subscription: Subscription): Promise<Subscription> | Promise<never>;
  abstract findSubscriptionsByUserId(userId: User['id']): Promise<Subscription[]> | Promise<never>;
  abstract findSubscriptionsById(id: Subscription['id']): Promise<Subscription> | Promise<never>;
  abstract subscriptionDiscountedPriceCalculator(subscription: Subscription): Promise<number>;
  abstract recurringCalculator(dog: Dog, subscription: Subscription): number;
  abstract createDogDailyPrice(dog: Dog, priceVersion: number): Promise<number | undefined>;
  abstract findPriceVersionById(id: PriceVersion['id']): Promise<PriceVersion | null> | Promise<never>;
  abstract subscriptionPriceCalculator(subscription: Subscription): number;
  abstract updateDogSubscriptions(dog: Dog['id'], dailyPrice: number): Promise<true> | Promise<never>;

}
