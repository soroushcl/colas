import { RequestHandler } from 'express';
import { AuthenticatedUser } from 'c-lib';

export interface AuthenticationHandler {
  authMiddleware: RequestHandler;
  authDependencies?: RequestHandler[];
  authViews: {
    login: RequestHandler;
    googleLogin: RequestHandler;
    googleReg: RequestHandler;
    tokenAuthorize: RequestHandler;
    register: RequestHandler;
    registerDog: RequestHandler;
    createSubscription: RequestHandler;
    createStripeCustomer: RequestHandler;
    logout: RequestHandler;
    authGuard: RequestHandler;
    setPassword: RequestHandler;
    forgotPassword: RequestHandler;
    resetPassword: RequestHandler;
    updateUser: RequestHandler;
    updateUserById: RequestHandler;
    updateDogRecurring: RequestHandler;
    updateSubscriptionRecurring: RequestHandler;
    updateDogSubscriptionFoodType: RequestHandler;
    reactivateSubscription: RequestHandler;
    editDogRecipes: RequestHandler;
    editDog: RequestHandler;
    changeShippingAddress: RequestHandler;
    changeBillingAddress: RequestHandler;
    changeCard: RequestHandler;
    getInvoice: RequestHandler;
    // updateCustomer: RequestHandler;
    // deactivateUser: RequestHandler;
    // reactivateUser: RequestHandler;
  }
}

export interface AuthenticationRouterFactoryViews {
  login: RequestHandler;
  googleLogin: RequestHandler;
  googleReg: RequestHandler;
  tokenAuthorize: RequestHandler;
  logout: RequestHandler;
  register: RequestHandler;
  registerDog: RequestHandler;
  createSubscription: RequestHandler;
  createStripeCustomer: RequestHandler;
  setPassword: RequestHandler;
  forgotPassword: RequestHandler;
  resetPassword: RequestHandler;
  updateUser: RequestHandler;
  updateUserById: RequestHandler;
  updateDogRecurring: RequestHandler;
  updateDogSubscriptionFoodType: RequestHandler;
  reactivateSubscription: RequestHandler;
  updateSubscriptionRecurring: RequestHandler;
  editDogRecipes: RequestHandler;
  editDog: RequestHandler;
  getInvoice: RequestHandler;
  changeShippingAddress: RequestHandler;
  changeBillingAddress: RequestHandler;
  changeCard: RequestHandler;
  // updateCustomer: RequestHandler;
  // deactivateUser: RequestHandler;
  // reactivateUser: RequestHandler;
}

export type verifyFunction = (token: string, secret: string) => AuthenticatedUser | null;

export type signFunction = (user: AuthenticatedUser, secret: string, options?: { expiresIn: string }) => string;

export type compareFunction = (raw: string, hashed: string) => Promise<boolean> | boolean;

export type hashFunction = (raw: string) => Promise<string> | string;