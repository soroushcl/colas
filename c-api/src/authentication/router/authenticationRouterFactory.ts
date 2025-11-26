import express from "express";
import {AuthenticationRouterFactoryViews} from "../authenticationTypes";
// import {authorize} from "@utils/authorize";
// import {UserType} from "c-lib";

export const authenticationRouterFactory = (authViews: AuthenticationRouterFactoryViews) => {
  const router = express.Router();

  router.post('/login', authViews.login);
  router.post('/google-login', authViews.googleLogin);
  router.post('/google-reg', authViews.googleReg);
  router.post('/token-authorize', authViews.tokenAuthorize)
  router.post('/register', authViews.register);
  router.post('/register-dog', authViews.registerDog);
  router.post('/subscription/create', authViews.createSubscription);
  router.post('/stripe-customer/create', authViews.createStripeCustomer);
  router.post('/logout', authViews.logout);
  // router.post('/invite', authViews.register);
  // router.post('/update-user', authorize([UserType.cola_admin, UserType.cola_user ]), authViews.updateUser);
  router.post('/update-user', authViews.updateUser);
  router.post('/update-user-by-id', authViews.updateUserById);
  // router.post('/deactivate-user', authorize([UserType.cola_admin, UserType.cola_user ]), authViews.deactivateUser)
  // router.post('/reactivate-user', authorize([UserType.cola_admin, UserType.cola_user]), authViews.reactivateUser)
  router.post('/set-password/', authViews.setPassword);
  router.post('/forgot-password/', authViews.forgotPassword);
  router.post('/reset-password/', authViews.resetPassword);
  router.post('/update-dog-recurring', authViews.updateDogRecurring);
  router.post('/update-dog-subscription-foodType', authViews.updateDogSubscriptionFoodType);
  router.post('/reactivate-subscription', authViews.reactivateSubscription);
  router.post('/update-subscription-recurring', authViews.updateSubscriptionRecurring);
  router.post('/edit-pooch-recipes', authViews.editDogRecipes);
  router.post('/edit-dog', authViews.editDog);
  router.post('/change-shipping-address', authViews.changeShippingAddress);
  router.post('/change-billing-address', authViews.changeBillingAddress);
  router.post('/change-card', authViews.changeCard);
  
  return router;
};