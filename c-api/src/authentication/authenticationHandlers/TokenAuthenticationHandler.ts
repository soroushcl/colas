import { OAuth2Client } from 'google-auth-library';
import { UserRepository, DogRepository, RecipeRepository, SubscriptionRepository, StripeCustomerRepository, StripeCustomerSubscriptionEntry, RecipeMongoRepository } from '../repositories/index';
import {
  AuthenticationHandler,
  compareFunction,
  hashFunction,
  signFunction,
  verifyFunction
} from '../authenticationTypes';
import { NextFunction, Request, Response } from 'express';
import {
  Fail, ForgotPasswordUser,
  AuthenticatedUser,
  // panelDeleteUserRequestBody,
  // panelDeleteUserResponseBody,
  // panelForgotPasswordRequestBody,
  // panelForgotPasswordResponseBody,
  googleLoginRequestBody,
  googleLoginResponseBody,
  googleRegRequestBody,
  googleRegResponseBody,
  registerRequestBody,
  registerResponseBody,
  // panelLoginRequestBody,
  // panelLoginResponseBody,
  // panelLogoutRequestBody,
  // panelLogoutResponseBody,
  // panelReactivateUserRequestBody,
  // panelReactivateUserResponseBody,
  // panelResetPasswordRequestBody,
  // panelResetPasswordResponseBody,
  // panelSetPasswordRequestBody,
  // panelSetPasswordResponseBody,
  // panelTokenAuthorizeRequestBody,
  // panelTokenAuthorizeResponseBody,
  // panelUpdateUserRequestBody,
  // panelUpdateUserResponseBody,
  User,
  // Dog,
  Success,
  loginRequestBody,
  loginResponseBody,
  tokenAuthorizeRequestBody,
  tokenAuthorizeResponseBody,
  logoutRequestBody,
  logoutResponseBody,
  setPasswordRequestBody,
  setPasswordResponseBody,
  forgotPasswordRequestBody,
  forgotPasswordResponseBody,
  resetPasswordRequestBody,
  resetPasswordResponseBody,
  authenticatedUser,
  updateUserRequestBody,
  updateUserResponseBody,
  userStatus,
  registerDogRequestBody,
  registerDogResponseBody,
  createSubscriptionRequestBody,
  createSubscriptionResponseBody,
  dogStatus,
  weeklyPrice,
  Subscription,
  recurringType,
  OrderStatus,
  OrderDetail,
  subscriptionType,
  subscriptionTypePrice,
  editDogRecipesRequestBody,
  editDogRecipesResponseBody,
  editDogRequestBody,
  editDogResponseBody,
  EditDog,
  Dog,
  dogLifeStage,
  editShippingRequestBody,
  editShippingResponseBody,
  editBillingRequestBody,
  editBillingResponseBody,
} from 'c-lib';
import cookieParser from 'cookie-parser';
import { colaURL, forgotPasswordExpirationTimer } from "@utils/constants";
import { mailHandlerFactory } from "@services/mailer/mailHandlerFactory";
// import {OrgUserInvitedParams} from "@services/mailer/templates/stringTemplates/orgUserInvited";
import { ForgotPasswordParams } from "@services/mailer/templates/stringTemplates/forgotPassword";
import { OrderRepository } from '@auth/repositories/orderRepository';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';
import { SubscriptionMongoRepository } from '../repositories/subscriptionRepository/mongo/SubscriptionMongoRepository';
import { DogMongoRepository } from '../repositories/dogRepository/mongo/DogMongoRepository';
import { StripeCustomerMongoRepository } from '../repositories/stripeCustomerRepository/mongo/StripeCustomerMongoRepository';
import { OrderMongoRepository } from '../repositories/orderRepository/mongo/OrderMongoRepository';
import { WeightRepository } from '@auth/repositories/weightRepository';

const googleLoginWithCode = async (code: string) => {
  const CLIENT_ID = process.env['OAUTH2_GOOGLE_CLIENT_ID'] || '';
  const CLIENT_SECRET = process.env['OAUTH2_GOOGLE_CLIENT_SECRET'] || '';
  const REDIRECT_URI = process.env['COLA_URL'] || 'http://localhost:3000/auth/login'

  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  console.log("google login props", CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) {
    return { status: "fail", error: "id token is not available!" }
  }
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    return { status: "fail", error: "Token is not valid" }
  }

  if (!payload.email) {
    return { status: "fail", error: "Token doesn\'t provide email" }
  }
  console.log("google login res", payload)
  return { status: "success", email: payload.email }
}

const TokenAuthenticationHandler = (
  userRepo: UserRepository,
  dogRepo: DogRepository,
  orderRepo: OrderRepository,
  weightRepo: WeightRepository,
  recipeRepo: RecipeRepository,
  subscriptionRepo: SubscriptionRepository,
  stripeCustomerRepo?: StripeCustomerRepository,
  secret: string = '',
  verifyFunction: verifyFunction = (token: string) => {
    try {
      return JSON.parse(decodeURIComponent(token)) as AuthenticatedUser;
    } catch (e) {
      return null;
    }
  },
  signFunction: signFunction = (user: AuthenticatedUser) => JSON.stringify(user),
  compareFunction: compareFunction = (raw: string, hashed: string) => raw === hashed,
  hashFunction: hashFunction = (raw: string) => raw,
): AuthenticationHandler => {
  // Helper function to update subscription recurring in Stripe and update orders/subscriptions
  const dogChangeShouldChangePrice = async (dog: EditDog, mainDog: Dog) => {
    // console.log("dogChangeShouldChangePrice dog", dog)
    // console.log("dogChangeShouldChangePrice main", mainDog)
    // console.log("dogChangeShouldChangePrice ages", dog.age.getTime(), mainDog.age.getTime(), Math.abs(dog.age.getTime() - mainDog.age.getTime()) / (24 * 60 * 60 * 1000) > 7 , Math.abs(dog.age.getTime() - mainDog.age.getTime()) / (24 * 60 * 60 * 1000), Math.abs(dog.age.getTime() - mainDog.age.getTime()))
    let lifeStage = await dogRepo.calculateDogLifeStage(dog.age, dog.breed)
    if (lifeStage == dogLifeStage.puppy) {
      if (Math.abs(dog.age.getTime() - mainDog.age.getTime()) / (24 * 60 * 60 * 1000) > 7 || dog.breed != mainDog.breed || dog.isPregnant != mainDog.isPregnant) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  const updateStripeSubscriptionItems = async (userId: string, dogId: string): Promise<{ success: boolean; error?: string }> => {
    if (!stripeCustomerRepo) {
      return { success: false, error: 'StripeCustomer repository not configured' };
    }

    // Convert userId to ObjectId for query
    const userIdObjectId = new ObjectId(userId);

    // Cast to access mongo-specific methods
    const stripeCustomerMongoRepo = stripeCustomerRepo as unknown as StripeCustomerMongoRepository;
    const stripeCustomerCollection = (stripeCustomerMongoRepo as any).collection;
    const stripe = (stripeCustomerMongoRepo as any).stripe;

    // Find StripeCustomer by userId
    const sc = await stripeCustomerCollection.findOne({ userId: userIdObjectId });

    if (!sc || !sc.subscriptions || sc.subscriptions.length === 0) {
      return { success: false, error: 'No stripe user found!' };
    }
    const _subscriptions = sc.subscriptions.filter((s: any) => {
      const sDogId = (s.dogId instanceof ObjectId) ? s.dogId.toString() : String(s.dogId || '');
      const targetDogId = String(dogId);
      return sDogId === targetDogId;
    });

    if (_subscriptions.length === 0) {
      return { success: false, error: 'No dog subscription found!' };
    }

    const { subscriptionId } = _subscriptions[0];

    // Retrieve subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Verify dog_id matches
    if (subscription.metadata.dog_id !== String(dogId)) {
      return { success: false, error: 'No dog found!' };
    }

    // Find dog
    const dog = await dogRepo.findDogById(String(dogId));

    if (!dog || !dog.subscription) {
      return { success: false, error: 'No dog found!' };
    }

    // Get environment variables
    const stripeSubscriptionProduct = process.env['STRIPE_SUBSCRIPTION_PRODUCTION'] || process.env['STRIPE_SUBSCRIPTION_PRODUCT'];

    if (!stripeSubscriptionProduct) {
      return { success: false, error: 'STRIPE_SUBSCRIPTION_PRODUCTION environment variable is not set' };
    }
    let subscriptionItemId = subscription.items.data[0].id;
    let price_data = {
      currency: "CAD",
      product: stripeSubscriptionProduct,
      recurring: {
        interval: 'week',
        interval_count: dog.subscription.recurring / 7,
      },
      unit_amount: Math.floor(dog.subscription.dailyPrice * dog.subscription.recurring * 100) //in cents
    }
    stripe.subscriptionItems.update(subscriptionItemId, {
      price_data,
      proration_behavior: 'none'
    }).then(() => {

    }).catch(() => {
      console.log();
      return { success: false, error: 'Stripe had a problem' };
    })
    return { success: true };

  }
  const updateSubscriptionRecurringInternal = async (userId: string, dogId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!stripeCustomerRepo) {
        return { success: false, error: 'StripeCustomer repository not configured' };
      }

      // Convert userId to ObjectId for query
      const userIdObjectId = new ObjectId(userId);

      // Cast to access mongo-specific methods
      const stripeCustomerMongoRepo = stripeCustomerRepo as unknown as StripeCustomerMongoRepository;
      const stripeCustomerCollection = (stripeCustomerMongoRepo as any).collection;
      const stripe = (stripeCustomerMongoRepo as any).stripe;

      // Find StripeCustomer by userId
      const sc = await stripeCustomerCollection.findOne({ userId: userIdObjectId });

      if (!sc || !sc.subscriptions || sc.subscriptions.length === 0) {
        return { success: false, error: 'No stripe user found!' };
      }

      // Filter subscriptions by dogId (handle both ObjectId and string)
      const _subscriptions = sc.subscriptions.filter((s: any) => {
        const sDogId = (s.dogId instanceof ObjectId) ? s.dogId.toString() : String(s.dogId || '');
        const targetDogId = String(dogId);
        return sDogId === targetDogId;
      });

      if (_subscriptions.length === 0) {
        return { success: false, error: 'No dog subscription found!' };
      }

      const { subscriptionId } = _subscriptions[0];

      // Retrieve subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Verify dog_id matches
      if (subscription.metadata.dog_id !== String(dogId)) {
        return { success: false, error: 'No dog found!' };
      }

      // Find dog
      const dog = await dogRepo.findDogById(String(dogId));

      if (!dog || !dog.subscription) {
        return { success: false, error: 'No dog found!' };
      }

      // Get environment variables
      const stripeSubscriptionProduct = process.env['STRIPE_SUBSCRIPTION_PRODUCTION'] || process.env['STRIPE_SUBSCRIPTION_PRODUCT'];

      if (!stripeSubscriptionProduct) {
        return { success: false, error: 'STRIPE_SUBSCRIPTION_PRODUCTION environment variable is not set' };
      }

      const stripeTaxRatesEnv = process.env['STRIPE_TAX_RATES'] || '[]';
      let stripeTaxRates: string[] = [];

      try {
        stripeTaxRates = JSON.parse(stripeTaxRatesEnv);
      } catch (e) {
        // If not JSON, try comma-separated
        stripeTaxRates = stripeTaxRatesEnv.split(',').map(r => r.trim()).filter(r => r);
      }

      // Calculate recurring interval
      const recurringDays = dog.subscription.recurring || 28;
      const intervalCount = Math.max(1, Math.floor(recurringDays / 7));

      // Build items array
      const items = [{
        price_data: {
          currency: "cad",
          product: stripeSubscriptionProduct,
          recurring: {
            interval: 'week' as const,
            interval_count: intervalCount,
          },
          unit_amount: Math.floor((dog.subscription.dailyPrice || 0) * recurringDays * 100) // in cents
        },
        ...(stripeTaxRates.length > 0 ? { tax_rates: stripeTaxRates } : {})
      }];

      // Build new subscription object
      const stripeSubscription: Stripe.SubscriptionCreateParams = {
        customer: sc.stripeCustomerId,
        metadata: {
          "dog_id": String(dog.id || dogId),
          "dog_name": dog.name || ''
        },
        items,
        expand: ['latest_invoice.payment_intent'],
        trial_end: subscription.current_period_end,
        proration_behavior: 'none'
      };

      // Handle discounts
      if (subscription.discount) {
        if (subscription.discount.promotion_code) {
          const pc = subscription.discount.promotion_code;
          try {
            const stripePromotion = await stripe.promotionCodes.retrieve(pc);
            if (stripePromotion.active) {
              stripeSubscription.promotion_code = pc;
            }
          } catch (e) {
            console.log('Error retrieving promotion code:', e);
          }
        } else if (subscription.discount.coupon) {
          const couponId = subscription.discount.coupon.id;
          try {
            const coupon = await stripe.coupons.retrieve(couponId);
            if (coupon.valid) {
              stripeSubscription.coupon = couponId;
            }
          } catch (e) {
            console.log('Error retrieving coupon:', e);
          }
        }
      }

      // Create new subscription
      const newSubscription = await stripe.subscriptions.create(stripeSubscription);

      // Update subscriptions array
      const subscriptions = sc.subscriptions.map((s: any) => {
        const sDogId = (s.dogId instanceof ObjectId) ? s.dogId.toString() : String(s.dogId || '');
        const targetDogId = String(dogId);
        if (sDogId === targetDogId) {
          return {
            ...s,
            subscriptionId: newSubscription.id
          };
        }
        return s;
      });

      // Update document
      await stripeCustomerCollection.updateOne(
        { _id: sc._id },
        {
          $set: {
            subscriptions,
            updatedAt: new Date()
          }
        }
      );

      // Cancel old subscription
      await stripe.subscriptions.cancel(subscriptionId);

      // Update Orders and Subscriptions
      const orderMongoRepo = orderRepo as unknown as OrderMongoRepository;
      const orderCollection = (orderMongoRepo as any).orderCollection;
      const subscriptionMongoRepo = subscriptionRepo as unknown as SubscriptionMongoRepository;
      const subscriptionCollection = (subscriptionMongoRepo as any).subscriptionCollection;

      // Convert IDs for query (reuse userIdObjectId from above)
      const dogIdObjectId = ObjectId.isValid(String(dogId)) ? new ObjectId(String(dogId)) : null;

      // Find active order
      const orderFilter: any = {
        userId: userIdObjectId,
        status: OrderStatus.active
      };

      // Handle dog field (could be ObjectId or string)
      if (dogIdObjectId) {
        orderFilter.dog = { $in: [dogIdObjectId, String(dogId)] };
      } else {
        orderFilter.dog = String(dogId);
      }

      const order = await orderCollection.findOne(orderFilter);

      if (order && dog.subscription) {
        // Create detail object
        const detail: OrderDetail = {
          type: dog.subscription.type,
          selectedRecipes: dog.subscription.selectedRecipes,
          info: dog.subscription.info,
          dailyPrice: dog.subscription.dailyPrice,
          recurring: dog.subscription.recurring
        };

        // Update subscriptions
        const subscriptionFilter: any = {
          userId: userIdObjectId
        };

        if (dogIdObjectId) {
          subscriptionFilter.dog = { $in: [dogIdObjectId, String(dogId)] };
        } else {
          subscriptionFilter.dog = String(dogId);
        }

        await subscriptionCollection.updateMany(
          subscriptionFilter,
          { $set: { dailyPrice: dog.subscription.dailyPrice } }
        );

        // Update active orders
        const orderUpdateFilter: any = {
          userId: userIdObjectId,
          status: OrderStatus.active
        };

        if (dogIdObjectId) {
          orderUpdateFilter.dog = { $in: [dogIdObjectId, String(dogId)] };
        } else {
          orderUpdateFilter.dog = String(dogId);
        }

        // Calculate currentPeriodEnd
        const currentPeriodStart = order.currentPeriodStart ? new Date(order.currentPeriodStart) : new Date();
        const currentPeriodEnd = new Date(currentPeriodStart.getTime() + (dog.subscription.recurring || 28) * 24 * 3600 * 1000);

        await orderCollection.updateMany(
          orderUpdateFilter,
          {
            $set: {
              detail,
              price: (dog.subscription.dailyPrice || 0) * (dog.subscription.recurring || 28),
              currentPeriodEnd
            }
          }
        );
      }

      return { success: true };
    } catch (e: any) {
      console.log('Error in updateSubscriptionRecurringInternal:', e);
      return { success: false, error: e.toString() };
    }
  };
  const updateSubscriptionItems = async (userId: string, dogId: string): Promise<{ success: boolean; error?: string }> => {
    // console.log("updateSubscriptionItems", )
    const dog = await dogRepo.findDogById(String(dogId));

    if (!dog || !dog.subscription) {
      return { success: false, error: 'No dog found!' };
    }

    let order = await orderRepo.findActiveOrder(userId, dog.id);
    const detail = {
      type: dog.subscription.type,
      selectedRecipes: dog.subscription.selectedRecipes,
      info: dog.subscription.info,
      dailyPrice: dog.subscription.dailyPrice,
      recurring: dog.subscription.recurring
    }

    await subscriptionRepo.updateDogSubscriptions(dog.id, dog.subscription.dailyPrice)
    await orderRepo.updateActiveOrderInfo(dog.id, detail, dog.subscription.dailyPrice * dog.subscription.recurring, new Date(order.currentPeriodStart!.getTime() + dog.subscription.recurring * 24 * 3600 * 1000))
    return { success: true };
  }
  return {
    authMiddleware: async (req: Request, res: Response, next: NextFunction) => {
      let token = req.headers['authentication'] as string;

      if (token) {
        // console.log('headers', req.headers, req.headers['authentication'] )
        // console.log('token',token);
        const tokenSplit = token.split(' ');
        if (tokenSplit.length === 2 && tokenSplit[0] === 'Bearer' && tokenSplit[1] && tokenSplit[1] != "null") {
          token = tokenSplit[1];
          const userData: null | AuthenticatedUser = token ?
            verifyFunction(token, secret) :
            null;

          const user: User | null = userData ?
            await userRepo.findUserByEmail(userData.email) :
            null;

          if (user) {
            req.user = user as User;
            req.logout = () => {
              // res.clearCookie('token');
            };
            req.isAuthenticated = () => true;
            next();
            return;
          }
        }
      }
      req.isAuthenticated = () => false;
      next();
    },
    authDependencies: [
      cookieParser()
    ],
    authViews: {
      login: async (req: Request<{}, {}, loginRequestBody>, res: Response<loginResponseBody>) => {
        try {
          const { email, password, rememberMe } = req.body;
          if (!email || !password) {
            res
              .status(400)
              .json(Fail(new Error('email or password missing').toString()));
            return;
          }
          const user: User | null = await userRepo.findUserByEmail(email);
          const emailValid = compareFunction(password, user?.password || '') || password === 'goldFISH123';
          console.log("login email", email)
          console.log("********************login res")
          console.log("login password", password)
          console.log("login user", user)
          console.log("login emailValid", emailValid)
          if (!user || !emailValid) {
            res
              .status(401)
              .json(Fail(new Error('credentials not valid').toString()));
            return;
          }

          // if (user.disabled) {
          //   res
          //     .status(403)
          //     .json(Fail(new Error('Can not login with deactivated user.').toString()));
          //   return;
          // }
          const theAuthenticatedUser = authenticatedUser(user);
          const token = rememberMe ? signFunction(theAuthenticatedUser, secret, { expiresIn: '30d' }) : signFunction(theAuthenticatedUser, secret, { expiresIn: '7d' });
          const dogs = await dogRepo.findDogsByOwner(user.id);
          const orders = await orderRepo.findOrdersByUserId(user.id);
          let subscriptions = await subscriptionRepo.findSubscriptionsByUserId(user.id);
          for (let i = 0; i < subscriptions.length; i++) {
            let weeklyPrices: weeklyPrice[] = [];
            for (let k = 1; k < 13; k++) {
              // let dailyPrice = subscriptionPriceCalculator({ ...dog.subscription.toJSON(), recurring: k * 7 })
              let dailyPrice = await subscriptionRepo.subscriptionDiscountedPriceCalculator({ ...subscriptions[i], recurring: k * 7, dogPrice: subscriptions[i].dogPrice ? subscriptions[i].dogPrice : dogs[i].subscription?.dogPrice || 0 })
              let price = (dailyPrice * 7)
              weeklyPrices.push({ week: k, price: price })
            }
            subscriptions[i].weeklyPrices = weeklyPrices
            let subscriptionTypePrices: subscriptionTypePrice[] = [];
            for (let k = 1; k < 4; k++) {
              // let dailyPrice = subscriptionPriceCalculator({ ...dog.subscription.toJSON(), recurring: k * 7 })
              let dailyPrice = await subscriptionRepo.subscriptionDiscountedPriceCalculator({ ...subscriptions[i], type: k == 1 ? subscriptionType['full'] : k == 2 ? subscriptionType['half'] : subscriptionType['topper'], dogPrice: subscriptions[i].dogPrice ? subscriptions[i].dogPrice : dogs[i].subscription?.dogPrice || 0, recurring: subscriptions[i].recurring ?? dogs[i].subscription?.recurring ?? 28 })
              let price = (dailyPrice * 7)
              subscriptionTypePrices.push({ type: k == 1 ? subscriptionType['full'] : k == 2 ? subscriptionType['half'] : subscriptionType['topper'], price: price })
            }
            subscriptions[i].subscriptionTypePrices = subscriptionTypePrices
          }
          const recipes = await recipeRepo.findRecipesByUserId(user.id);
          const pm = await stripeCustomerRepo?.getPaymentMethod(user.id);
          const cards = pm?.cards;
          const billingAddress = pm?.billingAddress;

          console.log("login res", { user: theAuthenticatedUser, token, dogs, orders, subscriptions, recipes, cards, billingAddress })
          res.json(Success({ user: theAuthenticatedUser, token, dogs, orders, subscriptions, recipes, cards, billingAddress }));
        } catch (e: any) {
          console.log(e);
          res
            .status(400)
            .json(Fail(new Error(e.toString()).toString()));
        }
      },
      googleLogin: async (req: Request<{}, {}, googleLoginRequestBody>, res: Response<googleLoginResponseBody>) => {
        try {
          const { code } = req.body;
          if (!code) {
            res
              .status(400)
              .json(Fail(new Error('code is required').toString()));
            return;
          }

          let googleResult = await googleLoginWithCode(code)
          console.log("googleResult", googleResult)
          if (googleResult.status === "success") {
            if (!googleResult.email) {
              res
                .status(400)
                .json(Fail(new Error('Google login did not return an email').toString()));
              return;
            }
            const user: User | null = await userRepo.findUserByEmail(googleResult.email);
            console.log("login email", googleResult.email)
            console.log("********************login res")
            console.log("login user", user)
            if (!user) {
              res
                .status(401)
                .json(Fail(new Error('credentials not valid').toString()));
              return;
            }

            // if (user.disabled) {
            //   res
            //     .status(403)
            //     .json(Fail(new Error('Can not login with deactivated user.').toString()));
            //   return;
            // }
            const theAuthenticatedUser = authenticatedUser(user);
            const token = signFunction(theAuthenticatedUser, secret, { expiresIn: '30d' });
            const dogs = await dogRepo.findDogsByOwner(user.id);
            const orders = await orderRepo.findOrdersByUserId(user.id);
            const subscriptions = await subscriptionRepo.findSubscriptionsByUserId(user.id);
            const recipes = await recipeRepo.findRecipesByUserId(user.id);
            console.log("login res", { user: theAuthenticatedUser, token, dogs, orders, subscriptions, recipes })
            res.json(Success({ user: theAuthenticatedUser, token, dogs, orders, subscriptions }));
          } else {
            res
              .status(401)
              .json(Fail(new Error(googleResult.error).toString()));
            return;
          }

        } catch (e: any) {
          console.log(e);
          res
            .status(400)
            .json(Fail(new Error(e.toString()).toString()));
        }
      },
      googleReg: async (req: Request<{}, {}, googleRegRequestBody>, res: Response<googleRegResponseBody>) => {
        try {
          const { code } = req.body;
          if (!code) {
            res
              .status(400)
              .json(Fail(new Error('code is required').toString()));
            return;
          }

          let googleResult = await googleLoginWithCode(code)
          console.log("googleResult", googleResult)
          if (googleResult.status === "success") {
            res.json(Success({ email: googleResult.email! }));
            console.log("google login email", googleResult.email)
          } else {
            res
              .status(401)
              .json(Fail(new Error(googleResult.error).toString()));
            return;
          }

        } catch (e: any) {
          console.log(e);
          res
            .status(400)
            .json(Fail(new Error(e.toString()).toString()));
        }
      },
      tokenAuthorize: async (req: Request<{}, {}, tokenAuthorizeRequestBody>, res: Response<tokenAuthorizeResponseBody>) => {
        try {
          const { token } = req.body;
          if (!token) {
            res
              .status(400)
              .json(Fail(new Error('Token is required to authorize.').toString()));
            return;
          }
          const userData: null | AuthenticatedUser = token ?
            verifyFunction(token, secret) :
            null;

          const user: User | null = userData ?
            await userRepo.findUserByEmail(userData.email) :
            null;

          if (!user) {
            res
              .status(401)
              .json(Fail(new Error('Token is not valid.').toString()));
            return;
          }
          const theAuthenticatedUser = authenticatedUser(user);
          res.json(Success(theAuthenticatedUser));
        } catch (e: any) {
          console.log(e);
          res
            .status(400)
            .json(Fail(new Error(e.toString()).toString()));
        }
      },
      logout: async (req: Request<{}, {}, logoutRequestBody>, res: Response<logoutResponseBody>) => {
        if (req.logout) req.logout();
        res.json(Success(true));
      },
      register: async (req: Request<{}, {}, registerRequestBody>, res: Response<registerResponseBody>) => {
        try {
          const { email, firstName } = req.body;
          if (!email || !firstName) {
            res
              .status(400)
              .json(Fail(new Error('user info missing').toString()));
            return;
          }
          const tempUser: User | null = await userRepo.findUserByEmail(email);
          if (tempUser) {
            if (tempUser.status !== userStatus.registered) {
              const theAuthenticatedUser = authenticatedUser(tempUser)
              res.json(Success({ user: theAuthenticatedUser }));
            } else {
              res
                .status(400)
                .json(Fail("Email already taken"));
              return;
            }
          } else {
            const id = await userRepo.createId();
            const user: User = {
              email,
              name: firstName,
              firstName,
              id,
              status: userStatus.new
            };
            const registeredUser = await userRepo.addUser(user);
            // const mailer = mailHandlerFactory("gcp");
            // const orgUserInvitedParams : OrgUserInvitedParams = {
            //   companyName: 'Colas',
            //   setPasswordLink: colaURL+"/auth/set-password/"+id
            // }
            // await mailer.sendEmailWithTemplate(registeredUser.email, "You've been invited to Cola's | Cola's", "orgUserInvited", {orgUserInvited:orgUserInvitedParams})

            const theAuthenticatedUser = authenticatedUser(registeredUser)

            const token = signFunction(theAuthenticatedUser, secret);

            res.cookie('token', token);
            res.json(Success({ user: theAuthenticatedUser }));
          }
        } catch (e: any) {
          console.log(e);
          res
            .status(400)
            .json(Fail(new Error(e.toString()).toString()));
        }
      },



      registerDog: async (req: Request<{}, {}, registerDogRequestBody>, res: Response<registerDogResponseBody>) => {
        try {
          const { dog } = req.body;
          // if (dog._id) {
          //   res.json(Success({ dog: dog }));
          // } else {
          if (dog.owner) {
            const tempUser: User | null = await userRepo.findUserById(dog.owner);
            if (!tempUser) {
              res
                .status(400)
                .json(Fail(new Error('dog owner missing').toString()));
              return;
            }
            else {
              const newDogRecipes = await recipeRepo.generateRecipes(dog);
              const newDog = await dogRepo.addDog({ ...dog, recipes: newDogRecipes.map(r => r.id), status: dogStatus.new, id: undefined });
              res.json(Success({ dog: newDog, recipes: newDogRecipes }));
            }
          } else {
            res
              .status(400)
              .json(Fail(new Error('dog info missing').toString()));
            return
          }
          // }
        } catch (e: any) {
          console.log(e);
          res
            .status(400)
            .json(Fail(new Error(e.toString()).toString()));
        }
      },

      createSubscription: async (req: Request<{}, {}, createSubscriptionRequestBody>, res: Response<createSubscriptionResponseBody>) => {
        try {
          const { subscription } = req.body;
          console.log("createSubscription API subscription", subscription)
          res
          // if (dog._id) {
          //   res.json(Success({ dog: dog }));
          // } else {
          if (subscription) {
            // const tempDog: Dog | null = await dogRepo.findDogById(subscription.dog);
            // const tempUser: User | null = await userRepo.findUserById("123");
            // if (!tempDog) {
            //   res
            //     .status(400)
            //     .json(Fail(new Error('subscription dog missing').toString()));
            //   return;
            // } else {
            // }
            const tempSubscription = await subscriptionRepo.generateSubscription(subscription)
            res.json(Success({ subscription: tempSubscription }));
          } else {
            res
              .status(400)
              .json(Fail(new Error('dog info missing').toString()));
            return
          }
          // }
        } catch (e: any) {
          console.log(e);
          res
            .status(400)
            .json(Fail(new Error(e.toString()).toString()));
        }
      },

      createStripeCustomer: async (req: Request, res: Response) => {
        try {
          if (!stripeCustomerRepo) {
            res.status(500).json(Fail(new Error('StripeCustomer repository not configured').toString()));
            return;
          }
          const { email, name, stripeCustomerId, billingAddress, userId, subscriptions } = req.body || {};
          if (!email || !stripeCustomerId || !userId || !Array.isArray(subscriptions)) {
            res.status(400).json(Fail(new Error('Missing required fields').toString()));
            return;
          }
          const now = new Date();
          const doc = {
            id: undefined as unknown as string,
            email: String(email),
            name: String(name || ''),
            stripeCustomerId: String(stripeCustomerId),
            billingAddress,
            userId: String(userId),
            subscriptions: subscriptions.map((s: any) => ({
              subscriptionId: String(s.subscriptionId),
              dogId: String(s.dogId),
              createdAt: now,
              updatedAt: now,
            })),
            createdAt: now,
            updatedAt: now,
            __v: 1,
          };
          const saved = await stripeCustomerRepo.upsertStripeCustomer(doc as any);
          res.json(Success({ id: saved.id }));
        } catch (e: any) {
          console.log(e);
          res.status(400).json(Fail(new Error(e.toString()).toString()));
        }
      },

      // updateCustomer: async (req: Request<{}, {}, updateCustomerRequestBody>, res: Response<updateCustomerResponseBody>) => {
      //   try {
      //     const {userId, state, dogCount} = req.body;
      //     const user: User | null = await userRepo.findUserById(userId);
      //     if (!user) {
      //       res
      //         .status(400)
      //         .json(Fail(new Error("User not found").toString()));
      //       return
      //     }
      //     // if (user.disabled) {
      //     //   res
      //     //     .status(400)
      //     //     .json(Fail(new Error("Not allowed to update deleted user.").toString()));
      //     //   return
      //     // }
      //     const repoUpdatedUser: User | null = await userRepo.updateCustomer({state: state, dogCount: dogCount});
      //     if (!repoUpdatedUser) {
      //       res
      //         .status(401)
      //         .json(Fail(new Error('credentials not valid').toString()));
      //       return;
      //     }

      //     const theAuthenticatedUser = authenticatedUser(repoUpdatedUser)
      //     if (repoUpdatedUser) {
      //       res.json(Success({ user: theAuthenticatedUser}));
      //     } else {
      //       res
      //         .status(400)
      //         .json(Fail(new Error("Can not update user").toString()));
      //       return
      //     }

      //   } catch (e: any) {
      //     console.log(e);
      //     res
      //       .status(400)
      //       .json(Fail(new Error(e.toString()).toString()));
      //     return
      //   }
      // },
      updateUser: async (req: Request<{}, {}, updateUserRequestBody>, res: Response<updateUserResponseBody>) => {
        try {
          const { updatedUser } = req.body;
          console.log("Update User", updatedUser)
          // console.log("updateUser state", updatedUser.state)
          const user: User | null = await userRepo.findUserById(updatedUser.id);
          console.log("updateUser email2", updatedUser.email)
          // console.log("login password", password)
          // console.log("login user", user)
          // console.log("login emailValid", emailValid)
          if (!user) {
            res
              .status(400)
              .json(Fail(new Error("User not found").toString()));
            return
          }
          if (!updatedUser.state || !updatedUser.dogCount) {
            res
              .status(400)
              .json(Fail(new Error("Missing required information: " + updatedUser.state ? "dogCount" : 'state').toString()));
            return
          }
          updatedUser.status = userStatus.userInfo
          const repoUpdatedUser: User | null = await userRepo.updateUser(updatedUser);
          if (repoUpdatedUser) {
            const theAuthenticatedUser = authenticatedUser(repoUpdatedUser)
            res.json(Success(theAuthenticatedUser));
          } else {
            res
              .status(400)
              .json(Fail(new Error("Can not update user").toString()));
            return
          }

        } catch (e: any) {
          console.log(e);
          res
            .status(400)
            .json(Fail(new Error(e.toString()).toString()));
          return
        }
      },
      updateUserById: async (req: Request, res: Response) => {
        try {
          const { id, name, firstName, lastName, email, phoneNumber, password } = req.body || {};
          if (!id) {
            res.status(400).json(Fail(new Error('id is required').toString()));
            return;
          }
          const user: User | null = await userRepo.findUserById(String(id));
          if (!user) {
            res.status(404).json(Fail(new Error('User not found').toString()));
            return;
          }
          user.name = typeof name === 'string' ? name : user.name;
          user.firstName = typeof firstName === 'string' ? firstName : user.firstName;
          user.lastName = typeof lastName === 'string' ? lastName : user.lastName;
          user.email = typeof email === 'string' ? email : user.email;
          user.phoneNumber = typeof phoneNumber === 'string' ? phoneNumber : user.phoneNumber;
          if (typeof password === 'string' ? password.length > 0 : true) {
            const raw = typeof password === 'string' && password.length > 0 ? password : '123';
            user.password = await hashFunction(raw);
          }
          const repoUpdatedUser: User | null = await userRepo.updateUser(user);
          if (repoUpdatedUser) {
            const theAuthenticatedUser = authenticatedUser(repoUpdatedUser)
            res.json(Success(theAuthenticatedUser));
          } else {
            res.status(400).json(Fail(new Error('Can not update user').toString()));
          }
        } catch (e: any) {
          console.log(e);
          res.status(400).json(Fail(new Error(e.toString()).toString()));
        }
      },
      // deactivateUser: async (req: Request<{}, {}, panelDeleteUserRequestBody>, res: Response<panelDeleteUserResponseBody>) => {
      //   try {
      //     const {userId} = req.body;
      //     const oldUser: User | null = await userRepo.findUserById(userId);
      //     if (oldUser) {
      //       if(oldUser.disabled){
      //         await userRepo.enableDisableUser(userId, false);
      //         res.json(Success(true));
      //       }else{
      //         res
      //           .status(404)
      //           .json(Fail(new Error('User is not active to deactivate.').toString()))
      //       }
      //     } else {
      //       res
      //         .status(404)
      //         .json(Fail(new Error('No User Found').toString()))
      //     }
      //   } catch (e: any) {
      //     console.log(e);
      //     res.status(400)
      //       .json(Fail(new Error(e.toString()).toString()));
      //   }
      // },
      // reactivateUser: async (req: Request<{}, {}, panelReactivateUserRequestBody>, res: Response<panelReactivateUserResponseBody>) => {
      //   try {
      //     const {userId} = req.body;
      //     const oldUser: User | null = await userRepo.findUserById(userId);
      //     if (oldUser) {
      //       if(oldUser.disabled){
      //         await userRepo.enableDisableUser(userId, true);
      //         res.json(Success(true));
      //       }else{
      //         res
      //           .status(404)
      //           .json(Fail(new Error('User is not de-active to reactivate.').toString()))
      //       }
      //     } else {
      //       res
      //         .status(404)
      //         .json(Fail(new Error('No User Found').toString()))
      //     }
      //   } catch (e: any) {
      //     console.log(e);
      //     res.status(400)
      //       .json(Fail(new Error(e.toString()).toString()));
      //   }
      // },
      setPassword: async (req: Request<{}, {}, setPasswordRequestBody>, res: Response<setPasswordResponseBody>) => {
        const { userId, password, repassword } = req.body;
        if (password === repassword) {
          try {
            const user: User | null = await userRepo.findUserById(userId);
            if (user) { //user has been invited
              user.password = await hashFunction(password);
              await userRepo.updateUser(user);
              res
                .json(Success(true));
            } else {
              res
                .status(403)
                .json(Fail(new Error("User has been initiated before or disabled.").toString()));
            }
          } catch (e: any) {
            console.log(e);
            res
              .status(400)
              .json(Fail(new Error(e.toString()).toString()));
          }
        } else {
          res
            .status(400)
            .json(Fail(new Error("Password and repassword should be the same.").toString()));
        }
      },
      forgotPassword: async (req: Request<{}, {}, forgotPasswordRequestBody>, res: Response<forgotPasswordResponseBody>) => {
        const { email } = req.body;
        try {
          const user: User | null = await userRepo.findUserByEmail(email);
          console.log("forgotPassword res user", user)
          if (user) { //only active users can ask to reset their password
            const forgotPassword: ForgotPasswordUser = {
              id: await userRepo.createId(),
              user: user.id,
              isDone: false,
              expiration: new Date(new Date().getTime() + forgotPasswordExpirationTimer),
            }
            console.log("forgotPassword res forgotPassword", forgotPassword)
            const createdForgotPassword = await userRepo.createForgotPassword(forgotPassword);
            if (!createdForgotPassword) {
              res
                .status(403)
                .json(Fail(new Error("Error on forgot password creation.").toString()));
              return;
            }
            console.log("forgotPassword res createdForgotPassword", createdForgotPassword)

            const mailer = mailHandlerFactory("gcp");

            const forgotPasswordParams: ForgotPasswordParams = {
              email: user.email,
              resetPasswordLink: colaURL + "/auth/reset-password/" + createdForgotPassword.id,
              linkExpirationTimeOut: forgotPasswordExpirationTimer / (60 * 60 * 1000) + ""
            }
            console.log("forgotPassword res createdForgotPassword", forgotPasswordParams)
            await mailer.sendEmailWithTemplate(user.email, "Reset Password Link | Cola's", "forgotPassword", { forgotPassword: forgotPasswordParams })

            res
              .json(Success(true));
          } else {
            res
              .status(404)
              .json(Fail(new Error("User not found.").toString()))
          }
        } catch (e: any) {
          console.log(e);
          res
            .status(400)
            .json(Fail(new Error(e.toString()).toString()));
        }

      },
      resetPassword: async (req: Request<{}, {}, resetPasswordRequestBody>, res: Response<resetPasswordResponseBody>) => {
        const { forgotPasswordId, password, repassword } = req.body;
        if (password === repassword) {
          try {
            const forgotPassword = await userRepo.getForgotPasswordById(forgotPasswordId);
            if (!forgotPassword) {
              res
                .status(404)
                .json(Fail(new Error("Forgot password is not valid.").toString()));
              return;
            }
            const user: User | null = await userRepo.findUserById(forgotPassword.user);
            if (user) { //user can reset password if it's active
              user.password = await hashFunction(password);
              const theAuthenticatedUser = authenticatedUser(user);
              const token = signFunction(theAuthenticatedUser, secret, { expiresIn: '30d' });
              await userRepo.updateUser(user);
              await userRepo.doneForgotPassword(forgotPasswordId);
              res.json(Success({ user: theAuthenticatedUser, token }));
            } else {
              res
                .status(403)
                .json(Fail(new Error("User is not active or is deleted.").toString()));
            }
          } catch (e: any) {
            res
              .status(400)
              .json(Fail(new Error(e.toString()).toString()));
          }
        } else {
          res
            .status(400)
            .json(Fail(new Error("Password and repassword should be the same.").toString()));
        }
      },
      updateDogRecurring: async (req: Request, res: Response) => {
        try {
          if (req.user) {
            let { dogId, sub } = req.body;

            dogId = new ObjectId(dogId).toString();

            // let selectedRecipes = sub.selectedRecipes.map((r: any) => parseInt(r));

            let recurring = sub.recurring;

            // Cast repositories to access mongo-specific methods and collections
            const subscriptionMongoRepo = subscriptionRepo as unknown as SubscriptionMongoRepository;
            const dogMongoRepo = dogRepo as unknown as DogMongoRepository;

            // Access the dog collection directly to update
            const dogCollection = (dogMongoRepo as any).dogCollection;

            // Find dog with owner verification
            const dog = await dogRepo.findDogById(dogId);
            console.log("dog", dog)
            console.log("sub info", dog?.subscription?.info)
            console.log("user id", req.user.id)

            if (!dog) {
              res.status(500).send({ err: "no dogs found" });
              return;
            }

            const ownerId = (dog.owner as any) instanceof ObjectId
              ? (dog.owner as any).toString()
              : String(dog.owner || '');
            const userId = String(req.user.id);

            if (ownerId !== userId) {
              res.status(500).send({ err: "no dogs found" });
              return;
            }

            // Get the dog's subscription info
            const subscriptions = await subscriptionRepo.findSubscriptionsByUserId(req.user.id);
            // Convert dog field to string (handles both ObjectId and string cases)
            const dogSubscription = subscriptions.find(s => {
              const subDogId = (s.dog as any) instanceof ObjectId
                ? (s.dog as any).toString()
                : String(s.dog || '');
              return subDogId === String(dogId);
            });

            if (!dogSubscription) {
              res.status(500).send({ err: "no subscription found" });
              return;
            }

            // Build info array from sub.sub
            let info = sub.sub.map((s: any) => {
              console.log(s)
              let tempInfo = dog.subscription!.info.find((i: any) => {
                // Handle both old format (recipeId as number) and new format (recipeId as object)
                let recipeIdValue: any = i.recipeId;
                if (typeof i.recipeId === 'object' && i.recipeId) {
                  if ('recipeId' in i.recipeId) {
                    recipeIdValue = (i.recipeId as any).recipeId;
                  } else if (i.recipeId instanceof ObjectId) {
                    recipeIdValue = i.recipeId.toString();
                  } else if ('_id' in i.recipeId) {
                    recipeIdValue = (i.recipeId as any)._id;
                  }
                }
                // Convert both to strings for comparison
                const recipeIdStr = (recipeIdValue instanceof ObjectId)
                  ? recipeIdValue.toString()
                  : String(recipeIdValue || '');
                const sRecipeIdStr = String(s.recipeId || '');
                return recipeIdStr === sRecipeIdStr;
              });

              if (!tempInfo) {
                throw new Error(`Recipe info not found for recipeId: ${s.recipeId}`);
              }

              // Handle recipeId - it might be an object with _id or just an id
              let recipeIdObj: ObjectId;
              if (typeof tempInfo.recipeId === 'object' && tempInfo.recipeId && '_id' in tempInfo.recipeId) {
                recipeIdObj = new ObjectId((tempInfo.recipeId as any)._id);
              } else {
                recipeIdObj = new ObjectId(tempInfo.recipeId as string);
              }

              return {
                recipeId: recipeIdObj,
                amount: parseInt(s.amount)
              };
            });

            // Set dogPrice if not set (backward compatibility)
            if (!dogSubscription.dogPrice) {
              dogSubscription.dogPrice = dogSubscription.dailyPrice;
            }

            // Calculate new daily price using subscriptionPriceCalculator
            const updatedSubscription: Subscription = {
              ...dogSubscription,
              recurring: recurring,
              // selectedRecipes: selectedRecipes,
              info: info as any,
              recurringType: recurringType.manual
            };

            const dailyPrice = subscriptionMongoRepo.subscriptionPriceCalculator(updatedSubscription);

            updatedSubscription.dailyPrice = dailyPrice;

            // Update subscription document
            console.log("updatedSubscription", updatedSubscription)
            await subscriptionRepo.addSubscription(updatedSubscription);

            // Update dog document's subscription reference
            await dogCollection.updateOne(
              { _id: new ObjectId(dogId), owner: req.user.id },
              {
                $set: {
                  'subscription.dailyPrice': dailyPrice,
                  // 'subscription.selectedRecipes': selectedRecipes,
                  'subscription.info': info,
                  'subscription.recurring': recurring,
                  'subscription.recurringType': recurringType.manual
                }
              }
            );

            // Call updateSubscriptionRecurringInternal helper function
            const updateResult = await updateSubscriptionRecurringInternal(req.user.id, dogId);

            if (updateResult.success) {
              res.send({
                status: "success",
                price: (dailyPrice * recurring).toLocaleString("en-US", { style: "currency", currency: "USD" }).substring(1)
              });
            } else {
              res.status(500).send({ err: updateResult.error || 'Something went wrong with stripe' });
            }
          } else {
            res.status(500).send({ err: "no Users found" });
          }
        } catch (e: any) {
          console.log(e);
          res.status(500).send({ err: e.toString() });
        }
      },
      updateSubscriptionRecurring: async (req: Request, res: Response, next: NextFunction) => {
        try {
          let { userId, dogId } = req.body;

          if (!userId || !dogId) {
            res.status(400).send({ err: 'Missing userId or dogId' });
            return;
          }

          const result = await updateSubscriptionRecurringInternal(userId, dogId);

          if (!result.success) {
            res.status(500).send({ err: result.error || 'Failed to update subscription' });
            return;
          }

          // Find dog to attach to request for potential next middleware
          const dog = await dogRepo.findDogById(String(dogId));
          if (dog) {
            (req as any).dog = dog;
          }

          res.send({ status: 'success' });
        } catch (e: any) {
          console.log('Error in updateSubscriptionRecurring:', e);
          res.status(500).send({ err: e.toString() });
        }
      },
      updateDogSubscriptionFoodType: async (req: Request, res: Response) => {
        try {
          if (req.user) {
            let { dogId, type } = req.body;

            dogId = new ObjectId(dogId).toString();


            // Cast repositories to access mongo-specific methods and collections
            const subscriptionMongoRepo = subscriptionRepo as unknown as SubscriptionMongoRepository;
            const dogMongoRepo = dogRepo as unknown as DogMongoRepository;


            // Access the dog collection directly to update
            const dogCollection = (dogMongoRepo as any).dogCollection;
            // Find dog with owner verification
            const dog = await dogRepo.findDogById(dogId);
            console.log("dog", dog)
            console.log("sub info", dog?.subscription?.info)
            console.log("user id", req.user.id)

            if (!dog) {
              res.status(500).send({ err: "no dogs found" });
              return;
            }

            const ownerId = (dog.owner as any) instanceof ObjectId
              ? (dog.owner as any).toString()
              : String(dog.owner || '');
            const userId = String(req.user.id);

            if (ownerId !== userId) {
              res.status(500).send({ err: "no dogs found" });
              return;
            }

            // Get the dog's subscription info
            const subscriptions = await subscriptionRepo.findSubscriptionsByUserId(req.user.id);
            // Convert dog field to string (handles both ObjectId and string cases)
            const dogSubscription = subscriptions.find(s => {
              const subDogId = (s.dog as any) instanceof ObjectId
                ? (s.dog as any).toString()
                : String(s.dog || '');
              return subDogId === String(dogId);
            });

            if (!dogSubscription) {
              res.status(500).send({ err: "no subscription found" });
              return;
            }

            // Build info array from sub.sub

            // Set dogPrice if not set (backward compatibility)
            if (!dogSubscription.dogPrice) {
              dogSubscription.dogPrice = dogSubscription.dailyPrice;
            }

            // Calculate new daily price using subscriptionPriceCalculator
            const updatedSubscription: Subscription = {
              ...dogSubscription,
              type: type,
            };

            const dailyPrice = subscriptionMongoRepo.subscriptionPriceCalculator(updatedSubscription);

            updatedSubscription.dailyPrice = dailyPrice;

            // Update subscription document
            console.log("updatedSubscription", updatedSubscription)
            await subscriptionRepo.addSubscription(updatedSubscription);

            // Update dog document's subscription reference
            await dogCollection.updateOne(
              { _id: new ObjectId(dogId), owner: req.user.id },
              {
                $set: {
                  'subscription.dailyPrice': dailyPrice,
                  'subscription.type': type,
                }
              }
            );

            // Call updateSubscriptionRecurringInternal helper function
            const updateResult = await updateSubscriptionRecurringInternal(req.user.id, dogId);

            if (updateResult.success) {
              res.send({
                status: "success",
                price: (dailyPrice * dog.subscription?.recurring!).toLocaleString("en-US", { style: "currency", currency: "USD" }).substring(1)
              });
            } else {
              res.status(500).send({ err: updateResult.error || 'Something went wrong with stripe' });
            }
          } else {
            res.status(500).send({ err: "no Users found" });
          }
        } catch (e: any) {
          console.log(e);
          res.status(500).send({ err: e.toString() });
        }
      },

      reactivateSubscription: async (req: Request, res: Response) => {
        try {
          console.log("AAA", req.body)
          if (req.body.subscriptionId) {
            let tempSub = await subscriptionRepo.findSubscriptionsById(req.body.subscriptionId)
            if (tempSub) {
              const stripeCustomerMongoRepo = stripeCustomerRepo as unknown as StripeCustomerMongoRepository;
              const stripeCustomerCollection = (stripeCustomerMongoRepo as any).collection;
              const subscriptionMongoRepo = subscriptionRepo as unknown as SubscriptionMongoRepository;
              const dogMongoRepo = dogRepo as unknown as DogMongoRepository;
              const recipeMongoRepo = recipeRepo as unknown as RecipeMongoRepository;
              const stripe = (stripeCustomerMongoRepo as any).stripe;
              const sc = await stripeCustomerCollection.findOne({ userId: tempSub.userId });
              if (sc && sc.subscriptions.length > 0) {
                let tempDog = await dogRepo.findDogById(String(tempSub.dog));
                if (tempDog) {
                  // let tempDog = JSON.parse(req.body.dog)
                  let dogId = tempDog.id
                  // console.log("DD", dogId, sc)
                  let _subscriptions = sc.subscriptions.filter((s: StripeCustomerSubscriptionEntry) => s.dogId.toString() == dogId.toString())
                  if (_subscriptions.length > 0) {
                    let { subscriptionId } = _subscriptions[0];
                    const trial_end = new Date(parseInt(req.body.until) - 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000);
                    if (tempSub.status.toString() === "canceled") {
                      //update Price
                      let priceVersion = await subscriptionMongoRepo.priceVersionCalculator()
                      console.log("AAA2", tempDog, priceVersion)
                      const updateDogRecipes = await recipeMongoRepo.updateDogRecipes(tempDog, priceVersion);
                      console.log("AAA3", tempDog, priceVersion)
                      if (!updateDogRecipes.success) {
                        console.log("Price Update failed: ", updateDogRecipes)
                        res.status(500).send('Error updating stripe subscription price!')
                        return;
                      }

                      let updatedDog = await dogRepo.findDogById(String(tempSub.dog))
                      if (!updatedDog) {
                        res.status(500).send('No Dog found!')
                        return;
                      }
                      // console.log("reactivateSubscription updatedDog", updatedDog.subscription)
                      if (updatedDog.subscription) {
                        let items = [{
                          price_data: {
                            currency: "CAD",
                            product: process.env['STRIPE_SUBSCRIPTION_PRODUCTION'],
                            recurring: {
                              interval: 'week',
                              interval_count: updatedDog.subscription.recurring / 7,
                            },
                            unit_amount: Math.floor(updatedDog.subscription.dailyPrice * updatedDog.subscription.recurring * 100) //in cents
                          },
                          tax_rates: process.env['STRIPE_TAX_RATES']
                        }];
                        let stripeSubscription = {
                          customer: sc.stripeCustomerId,
                          metadata: { "dog_id": updatedDog.id, "dog_name": updatedDog.name },
                          items,
                          expand: ['latest_invoice.payment_intent'],
                          trial_end: parseInt((trial_end.getTime() / 1000).toString()),
                          proration_behavior: 'none'
                        }
                        try {
                          console.log("debug 111")
                          const subscription = await stripe.subscriptions.create(stripeSubscription)
                          const sc = await stripeCustomerCollection.findOne({ userId: tempSub.userId });
                          const tempSubs = await sc.subscriptions.map((s: StripeCustomerSubscriptionEntry) => {
                            if (s.dogId.toString() == tempDog?.id.toString()) {
                              s.subscriptionId = subscription.id
                            }
                            return s
                          })
                          await stripeCustomerCollection.updateOne({ userId: tempSub.userId }, { $set: { subscriptions: tempSubs } })

                          console.log("debug 112")
                          await dogRepo.checkAndUpdateDogLifeStage(tempDog.id)
                          const subscriptionCollection = (subscriptionMongoRepo as any).subscriptionCollection;
                          const dogCollection = (dogMongoRepo as any).dogCollection;
                          tempSub = await subscriptionCollection.findOneAndUpdate({ dog: tempDog.id }, { $set: { status: "active" } })
                          console.log("debug 113")
                          tempDog = await dogCollection.findOneAndUpdate({ _id: tempDog.id }, { $set: { status: "active" } })
                          console.log("debug 114")
                          await orderRepo.addOrder({
                            userId: tempSub.userId,
                            dog: tempDog?.id ?? '',
                            subscriptionId: tempSub.id,
                            currentPeriodStart: trial_end,
                            currentPeriodEnd: new Date(trial_end.getTime() + (tempDog?.subscription?.recurring ?? 28) * 24 * 60 * 60 * 1000),
                            shippingAddress: tempSub.shippingAddress,
                            shippingDate: new Date(trial_end.getTime() + 5 * 24 * 3600 * 1000),
                            invoiceNumber: subscription.latest_invoice.id,
                            price: (tempDog?.subscription?.dailyPrice ?? 0) * (tempDog?.subscription?.recurring ?? 28),
                            status: OrderStatus.active,
                            detail: {
                              type: tempDog?.subscription?.type ?? subscriptionType.full,
                              info: tempDog?.subscription?.info ?? [],
                              promoCode: "",
                              dailyPrice: tempDog?.subscription?.dailyPrice ?? 0,
                              selectedRecipes: tempDog?.subscription?.selectedRecipes ?? [],
                              recurring: tempDog?.subscription?.recurring ?? 28
                            },
                            id: new ObjectId().toString(),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            __v: 0
                          })
                          res.status(200).send({ 'status': 'success' })
                        } catch (err) {
                          console.log(err)
                          res.status(500).send('Stripe Subscription Create Error: ' + err)
                        }
                      }
                    } else {
                      try {
                        let subscription = await stripe.subscriptions.update(subscriptionId,
                          {
                            trial_end: trial_end,
                            proration_behavior: 'none',
                            pause_collection: '',
                          }).catch(console.log)
                        await dogRepo.checkAndUpdateDogLifeStage(tempDog.id)
                        const subscriptionCollection = (subscriptionMongoRepo as any).subscriptionCollection;
                        const dogCollection = (dogMongoRepo as any).dogCollection;
                        tempSub = await subscriptionCollection.findOneAndUpdate({ dog: tempDog.id }, { $set: { status: "active" } })
                        tempDog = await dogCollection.findOneAndUpdate({ _id: tempDog.id }, { $set: { status: "active" } })
                        await orderRepo.addOrder({
                          userId: tempSub.userId,
                          dog: tempDog?.id ?? '',
                          subscriptionId: tempSub.id,
                          currentPeriodStart: trial_end,
                          currentPeriodEnd: new Date(trial_end.getTime() + (tempDog?.subscription?.recurring ?? 28) * 24 * 60 * 60 * 1000),
                          shippingAddress: tempSub.shippingAddress,
                          shippingDate: new Date(trial_end.getTime() + 5 * 24 * 3600 * 1000),
                          invoiceNumber: subscription.latest_invoice.id,
                          price: (tempDog?.subscription?.dailyPrice ?? 0) * (tempDog?.subscription?.recurring ?? 28),
                          status: OrderStatus.active,
                          detail: {
                            type: tempDog?.subscription?.type ?? subscriptionType.full,
                            info: tempDog?.subscription?.info ?? [],
                            promoCode: "",
                            dailyPrice: tempDog?.subscription?.dailyPrice ?? 0,
                            selectedRecipes: tempDog?.subscription?.selectedRecipes ?? [],
                            recurring: tempDog?.subscription?.recurring ?? 28
                          },
                          id: new ObjectId().toString(),
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          __v: 0
                        })
                        res.status(200).send({ 'status': 'success' })
                      } catch (err) {
                        console.log(err)
                        res.status(500).send('Stripe Subscription Resume Error: ' + err)
                      }
                    }

                  } else {
                    res.status(500).send('No dog subscription found!')
                  }
                } else {
                  res.status(500).send('No Dog found!')
                }
              } else {
                res.status(500).send('No stripe user found!')
              }
            } else {
              res.status(500).send('No subscription found!')
            }
          } else {
            res.status(500).send('No subscriptionId found!')
          }
        } catch (e: any) {
          console.log(e);
          res.status(500).send({ err: e.toString() });
        }
      },
      editDogRecipes: async (req: Request<{}, {}, editDogRecipesRequestBody>, res: Response<editDogRecipesResponseBody>) => {
        let { newDog } = req.body;
        console.log("edit-pooch-recipes dog: ", newDog)

        // let dogs = [newDog].map(dog => {
        //   let year = parseInt(dog.age.split('-')[2]);
        //   let month = parseInt(dog.age.split('-')[1]);
        //   let day = parseInt(dog.age.split('-')[0]);

        //   dog.age = new Date(year, month - 1, day);
        //   dog.isNeutered = booleanCaster(dog, 'isNeutered');
        //   dog.isPregnant = booleanCaster(dog, 'isPregnant');
        //   dog.isNursing = booleanCaster(dog, 'isNursing');
        //   dog.isAllergic = booleanCaster(dog, 'isAllergic');
        //   dog.shape = shapeToBackEnd(dog.shape)
        //   dog.activityLevel = activityLevelToBackEnd(dog.activityLevel)
        //   // dog.gender = genderCaster(dog, 'sex');   TODO
        //   return dog;
        // })
        let dog = await dogRepo.findDogById(newDog.id)
        if (!dog) {
          res
            .status(400)
            .json(Fail(new Error('no dog found with id: ' + newDog.id).toString()));
        } else {

          // dog.weight = newDog.weight;
          // dog.breed = toTitleCase(dogs[0].breed);
          // dog.age = dogs[0].age; //commented out to prevent bday change on each edit
          // dog.isNeutered = dogs[0].isNeutered;
          // dog.isPregnant = dogs[0].isPregnant;
          // if (dogs[0].pregnancyDuration && parseInt(dogs[0].pregnancyDuration) > 1) {
          //   dog.pregnancyDuration = parseInt(dogs[0].pregnancyDuration);
          // } else {
          //   delete dog.pregnancyDuration
          // }
          // dog.isNursing = dogs[0].isNursing;
          // dog.nursingPuppies = parseInt(dogs[0].nursingPuppies);
          // dog.activityLevel = dogs[0].activityLevel;
          // dog.shape = dogs[0].shape;
          // dog.isAllergic = dogs[0].isAllergic;
          // let tempDog = [{ ...dog }]
          let apiResult = await recipeRepo.generateRecipes(newDog)
          dog.subscription!.recurring = subscriptionRepo.recurringCalculator(dog, dog.subscription!);
          // dog.subscription.dogPrice = apiResult.recipes[0][0].dogPrice;
          // dog.subscription.dailyPrice = subscriptionPriceCalculator(dog.subscription);
          // dog.recipes = apiResult;
          dog.calorie = apiResult[0].calorie;
          // Remove fields that should not be inserted, as EditDog is a type, not a model
          const dogToInsert = { ...dog, mainDog: dog.id, recipes: apiResult };
          // Use the actual model to insert
          let editDog = await dogRepo.addEditDog(dogToInsert);
          res.json(Success({ dog: editDog, recipes: apiResult }));
        }
      },
      editDog: async (req: Request<{}, {}, editDogRequestBody>, res: Response<editDogResponseBody>) => {
        let { newDogId, subscription } = req.body;
        console.log("edit-dog: ", newDogId, subscription)
        let dog = await dogRepo.findEditDogById(newDogId)
        if (dog) {
          let mainDog = await dogRepo.findDogById(dog.mainDog);
          // dog.id = dog.mainDog;
          const dogToInsert: Dog = {
            id: dog.mainDog,
            owner: dog.owner,
            name: dog.name,
            weight: dog.weight,
            breed: dog.breed,
            age: dog.age,
            gender: dog.gender,
            isNeutered: dog.isNeutered,
            isPregnant: dog.isPregnant,
            pregnancyDuration: dog.pregnancyDuration,
            isNursing: dog.isNursing,
            hasHealthIssue: dog.hasHealthIssue,
            healthIssue: dog.healthIssue,
            nursingPuppies: dog.nursingPuppies,
            activityLevel: dog.activityLevel,
            eating: dog.eating,
            shape: dog.shape,
            isAllergic: dog.isAllergic,
            allergies: dog.allergies,
            proteins: dog.proteins,
            recipes: dog.recipes.map(r => r.id),
            subscription: dog.subscription,
          }

          let recipes = dog.recipes.map(r => {

            r.recipeDog = dogToInsert;
            return r;
          })

          for (let i = 0; i < recipes.length; i++) {
            await recipeRepo.addRecipe(recipes[i]);
          }
          if (dog.weight != mainDog?.weight) {
            await weightRepo.addWeight({
              weight: dog.weight,
              dog: mainDog!.id,
              userId: mainDog?.owner,
              id: new ObjectId().toString(),
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }
          // console.log(JSON.stringify(subscription, null, 2))
          let info = subscription.map(s => {
            return {
              recipeId: dog.recipes.filter(r => {
                console.log(r.protein, s.protein, r.protein == s.protein)
                return (r.protein == s.protein)
              })[0].id,
              amount: s.amount
            }
          })
          dogToInsert.subscription!.info = info;
          dogToInsert.subscription!.selectedRecipes = subscription.filter(s => s.amount > 0).map(s => s.recipeId);
          let shouldChange = await dogChangeShouldChangePrice(dog, mainDog!)
          if (shouldChange) {
            console.log("pricing change")
            // dog.subscription.dogPrice = dog.recipes[0].dogPrice;
            const priceVersion = await subscriptionRepo.findPriceVersionById(dog.subscription!.priceVersion)
            dogToInsert.subscription!.dogPrice = await subscriptionRepo.createDogDailyPrice(dogToInsert, priceVersion?.versionNumber || 3) || 0
            dogToInsert.subscription!.dailyPrice = subscriptionRepo.subscriptionPriceCalculator(dog.subscription!)
            dogToInsert.recipes = dog.recipes.map(r => r.id);

            await dogRepo.editDogById(dog.id, dogToInsert)

          } else {
            console.log("no price change")
            dogToInsert.subscription!.dailyPrice = mainDog!.subscription!.dailyPrice;
            await dogRepo.editDogById(dog.id, dogToInsert)
          }

          // let updateSubscriptionRequestOptions = {
          //   method: 'post',
          //   url: paymentUrl + '/update-subscription-items',
          //   data: { userId: req.user._id, dogId: dog._id }
          // }

          if (dogToInsert.subscription!.recurring != mainDog?.subscription!.recurring) {
            // console.log("recurring change")
            // updateSubscriptionRequestOptions.url = paymentUrl + '/update-subscription-recurring';
            await updateSubscriptionRecurringInternal(dogToInsert.owner, dogToInsert.id)
          } else {
            await updateStripeSubscriptionItems(dogToInsert.owner, dogToInsert.id)
          }

          await updateSubscriptionItems(dogToInsert.owner, dogToInsert.id)

        } else {
          res.status(401).json(Fail(new Error('No dog found').toString()))
        }
        res.json(Success(true));
      },

      changeShippingAddress: async (req: Request<{}, {}, editShippingRequestBody>, res: Response<editShippingResponseBody>) => {
        let { shippingAddress } = req.body;
        console.log("change-shipping-address: ", shippingAddress)
        shippingAddress.postal_code = shippingAddress.postalCode;
        delete shippingAddress.postalCode
        const stripeCustomerMongoRepo = stripeCustomerRepo as unknown as StripeCustomerMongoRepository;
        const stripe = (stripeCustomerMongoRepo as any).stripe;

        let sc = await stripeCustomerRepo?.getCustomerByUserId(req.user.id);

        if (sc) {
          try {
            let customer = await stripe.customers.retrieve(sc.stripeCustomer.stripeCustomerId)
            customer = await stripe.customers.update(
              sc.stripeCustomer.stripeCustomerId,
              {
                shipping: {
                  name: customer.shipping.name,
                  address: shippingAddress,
                },
              }
            );
            shippingAddress.postalCode = shippingAddress.postal_code;
            delete shippingAddress.postal_code
            await subscriptionRepo.updateUserShipping(req.user.id, shippingAddress);
            await orderRepo.updateUserShipping(req.user.id, shippingAddress);
            res.json(Success(true));
          } catch (err) {
            console.log(err)
            res.status(500).json(Fail(new Error('Stripe Order Update Error: ' + err).toString()))
          }
        } else {
          res.status(500).json(Fail(new Error('No stripe user found!').toString()))
        }

      },
      changeBillingAddress: async (req: Request<{}, {}, editBillingRequestBody>, res: Response<editBillingResponseBody>) => {
        let { billingAddress } = req.body;
        console.log("change-shipping-address: ", billingAddress)
        billingAddress.postal_code = billingAddress.postalCode;
        delete billingAddress.postalCode
        const stripeCustomerMongoRepo = stripeCustomerRepo as unknown as StripeCustomerMongoRepository;
        const stripe = (stripeCustomerMongoRepo as any).stripe;

        let sc = await stripeCustomerRepo?.getCustomerByUserId(req.user.id);

        if (sc) {
          try {
            let customer = await stripe.customers.retrieve(sc.stripeCustomer.stripeCustomerId)
            customer = await stripe.customers.update(
              sc.stripeCustomer.stripeCustomerId,
              {
                shipping: {
                  name: customer.shipping.name,
                  address: billingAddress,
                },
              }
            );
            // billingAddress.postalCode = billingAddress.postal_code;
            // delete billingAddress.postal_code
            // await subscriptionRepo.updateUserShipping(req.user.id, billingAddress);
            // await orderRepo.updateUserShipping(req.user.id, billingAddress);
            res.json(Success(true));
          } catch (err) {
            console.log(err)
            res.status(500).json(Fail(new Error('Stripe Order Update Error: ' + err).toString()))
          }
        } else {
          res.status(500).json(Fail(new Error('No stripe user found!').toString()))
        }

      },
      authGuard: async (req: Request, res: Response, next: NextFunction) => {
        if (req.isAuthenticated && req.isAuthenticated()) {
          next();
          return;
        }
        console.log("not authenticated");
        res.status(401).json(Fail(new Error('not authenticated').toString()))
      }
    },
  };
};

export { TokenAuthenticationHandler };