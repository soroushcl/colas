// Load environment variables from .env file in non-production environments
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "development") {
  await import("dotenv/config");
}
import { Db, MongoClient } from "mongodb";
import { DogMongoRepository, RecipeMongoRepository, UserMongoRepository, SubscriptionMongoRepository, OrderMongoRepository } from "@auth/index.js";
import { StripeCustomerMongoRepository } from "@auth/repositories/stripeCustomerRepository/index.js";
import { BreedMongoRepository } from "./breeds/repositories/index.js";
import { PromoCodeMongoRepository } from "./payment/repositories/index.js";
import { repoMode, Repositories } from './types/serverTypes.js';
// import {
//   SampleModuleMongoRepository,
// } from "./sampleModule";

export const MongoDBCollectionNames = {
  USERS: "Users",
  DOGS: "Dogs",
  ORDERS: "Orders",
  RECIPES: "Recipes",
  SUBSCRIPTIONS: "Subscriptions",
  PRICEVERSIONS: "PriceVersion",
  CALORIERANGES: "CalorieRange",
  CALORIERANGEPRICES: "CalorieRangePrice",
  INGREDIENTS: "Ingredients",
  FORGOT_PASSWORD: "forgotPasswords",
  BREEDS: "Breeds",
  GROWTHPATTERN: "GrowthPatterns",
  PRICEMODEL: "PriceModel",
  PROMOCODES: "PromoCodes"
} as const;

const repositoryFactory = async (repoMode?: repoMode): Promise<Repositories> => {
  if (repoMode === "mongo") {
    const connectionString = (process.env["DB_URL"]) ? `mongodb+srv://${process.env['DB_USER']}:${process.env['DB_PASSWORD']}@${process.env['DB_URL']}/?retryWrites=true&w=majority` : "mongodb://localhost:27017/cola";
    console.log("repositoryFactory1 connectionString", connectionString)
    const client: MongoClient = new MongoClient(connectionString);
    await client.connect();

    const db: Db = client.db(process.env["DB_NAME"] || "cola");
    const userRepo = new UserMongoRepository(db, MongoDBCollectionNames.USERS, MongoDBCollectionNames.FORGOT_PASSWORD);
    const breedRepo = new BreedMongoRepository(db, MongoDBCollectionNames.BREEDS);
    const promoCodeRepo = new PromoCodeMongoRepository(db, MongoDBCollectionNames.PROMOCODES);
    const dogRepo = new DogMongoRepository(db, MongoDBCollectionNames.DOGS, MongoDBCollectionNames.PRICEMODEL, breedRepo);
    const recipeRepo = new RecipeMongoRepository(db, MongoDBCollectionNames.RECIPES, MongoDBCollectionNames.INGREDIENTS, dogRepo);
    const orderRepo = new OrderMongoRepository(db, MongoDBCollectionNames.ORDERS);
    const stripeCustomerRepo = new StripeCustomerMongoRepository(db, "StripeCustomers");
    const subscriptionRepo = new SubscriptionMongoRepository(
      db,
      MongoDBCollectionNames.SUBSCRIPTIONS,
      MongoDBCollectionNames.PRICEVERSIONS,
      MongoDBCollectionNames.CALORIERANGES,
      MongoDBCollectionNames.CALORIERANGEPRICES,
      MongoDBCollectionNames.GROWTHPATTERN,
      MongoDBCollectionNames.PRICEMODEL,
      breedRepo,
      recipeRepo,
      dogRepo,
      promoCodeRepo,
    );
    dogRepo.setSubscriptionRepository(subscriptionRepo);
    recipeRepo.setSubscriptionRepository(subscriptionRepo);

    return {
      // sampleModuleRepo: new SampleModuleMongoRepository(db, MongoDBCollectionNames.CLIMATE_ZONE),
      userRepo,
      dogRepo,
      orderRepo,
      recipeRepo,
      breedRepo,
      promoCodeRepo,
      subscriptionRepo,
      stripeCustomerRepo,
    }
  } else {
    const connectionString = (process.env["DB_URL"]) ? `mongodb+srv://${process.env['DB_USER']}:${process.env['DB_PASSWORD']}@${process.env['DB_URL']}/?retryWrites=true&w=majority` : "mongodb://localhost:27017/cola";
    console.log("repositoryFactory2 DB_URL", process.env['DB_URL'])
    console.log("repositoryFactory2 connectionString", connectionString)
    const client: MongoClient = new MongoClient(connectionString);
    await client.connect();

    const db: Db = client.db(process.env["DB_NAME"] || "cola");
    const userRepo = new UserMongoRepository(db, MongoDBCollectionNames.USERS, MongoDBCollectionNames.FORGOT_PASSWORD);
    const breedRepo = new BreedMongoRepository(db, MongoDBCollectionNames.BREEDS);
    const promoCodeRepo = new PromoCodeMongoRepository(db, MongoDBCollectionNames.PROMOCODES);
    const dogRepo = new DogMongoRepository(db, MongoDBCollectionNames.DOGS, MongoDBCollectionNames.PRICEMODEL, breedRepo);
    const recipeRepo = new RecipeMongoRepository(db, MongoDBCollectionNames.RECIPES, MongoDBCollectionNames.INGREDIENTS, dogRepo);
    const orderRepo = new OrderMongoRepository(db, MongoDBCollectionNames.ORDERS);
    const stripeCustomerRepo = new StripeCustomerMongoRepository(db, "StripeCustomers");
    const subscriptionRepo = new SubscriptionMongoRepository(
      db,
      MongoDBCollectionNames.SUBSCRIPTIONS,
      MongoDBCollectionNames.PRICEVERSIONS,
      MongoDBCollectionNames.CALORIERANGES,
      MongoDBCollectionNames.CALORIERANGEPRICES,
      MongoDBCollectionNames.GROWTHPATTERN,
      MongoDBCollectionNames.PRICEMODEL,
      breedRepo,
      recipeRepo,
      dogRepo,
      promoCodeRepo,
    );
    dogRepo.setSubscriptionRepository(subscriptionRepo);
    recipeRepo.setSubscriptionRepository(subscriptionRepo);

    return {
      // sampleModuleRepo: new SampleModuleMongoRepository(db, MongoDBCollectionNames.CLIMATE_ZONE),
      userRepo,
      dogRepo,
      orderRepo,
      recipeRepo,
      breedRepo,
      promoCodeRepo,
      subscriptionRepo,
      stripeCustomerRepo,
    }
  }
};

export default repositoryFactory;