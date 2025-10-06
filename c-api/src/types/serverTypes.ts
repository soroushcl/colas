import {DogRepository, RecipeRepository, UserRepository, SubscriptionRepository, OrderRepository} from '@auth/repositories/index';
import { StripeCustomerRepository } from '@auth/repositories/stripeCustomerRepository/index';
import {BreedRepository} from '../breeds/repositories/index.js';
import {PromoCodeRepository} from '../payment/repositories/index.js';
import {

} from "../sampleModule/index.js";
// import {SampleModuleRepository} from "../sampleModule/";

export type repoMode = 'inMemory' | 'mongo';

export type authMode = 'jwt' | 'google';

export interface Repositories {
  // sampleModuleRepo: SampleModuleRepository;
  userRepo: UserRepository;
  dogRepo: DogRepository;
  orderRepo: OrderRepository;
  recipeRepo: RecipeRepository;
  subscriptionRepo: SubscriptionRepository;
  breedRepo: BreedRepository;
  promoCodeRepo: PromoCodeRepository;
  stripeCustomerRepo: StripeCustomerRepository;
}
