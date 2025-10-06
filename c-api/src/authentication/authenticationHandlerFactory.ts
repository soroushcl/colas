import { AuthenticationHandler } from './authenticationTypes';
import { DogRepository, RecipeRepository, SubscriptionRepository, UserRepository, StripeCustomerRepository, OrderRepository } from './repositories/index';
import { authMode } from '../types/serverTypes';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { TokenAuthenticationHandler } from "./authenticationHandlers/index";
import { AuthenticatedUser } from "c-lib";

export const authenticationHandlerFactory = (userRepo: UserRepository, dogRepo: DogRepository, orderRepo: OrderRepository, recipeRepo: RecipeRepository, subscriptionRepo: SubscriptionRepository, stripeCustomerRepo?: StripeCustomerRepository, authMode: authMode = 'jwt'): AuthenticationHandler => {
  switch (authMode) {
    case 'google': {
      // return GoogleAuthenticationHandler(userRepo)
      return TokenAuthenticationHandler(userRepo, dogRepo, orderRepo, recipeRepo, subscriptionRepo, stripeCustomerRepo);
    }
    case 'jwt': {
      const jwtSecret = process.env['JWT_SECRET'] || 'AdApT!$g0ldF!$H123';
      const bcryptSalt: number = Number(process.env['BCRYPT_SALT']) || 10;
      const jwtVerifyFunction = (token: string, secret: string) => {
        try {
          return jwt.verify(token, secret) as AuthenticatedUser;
        } catch (e) {
          return null;
        }
      }
      const jwtSignFunction = (user: AuthenticatedUser, secret: string, options?: { expiresIn: string }) => jwt.sign(user, secret, options);
      const bcryptHash = async (raw: string) => bcrypt.hashSync(raw, bcrypt.genSaltSync(bcryptSalt));
      const bcryptCompare = async (raw: string, hashed: string) => bcrypt.compareSync(raw, hashed)
      return TokenAuthenticationHandler(userRepo, dogRepo, orderRepo, recipeRepo, subscriptionRepo, stripeCustomerRepo, jwtSecret, jwtVerifyFunction, jwtSignFunction, bcryptCompare, bcryptHash);
    }
    default:
      const jwtSecret = process.env['JWT_SECRET'] || 'g0ldF!$H123';
      const bcryptSalt: number = Number(process.env['BCRYPT_SALT']) || 10;
      const jwtVerifyFunction = (token: string, secret: string) => jwt.verify(token, secret) as AuthenticatedUser;
      const jwtSignFunction = (user: AuthenticatedUser, secret: string, options?: { expiresIn: string }) => jwt.sign(user, secret, options);
      const bcryptHash = async (raw: string) => bcrypt.hashSync(raw, bcryptSalt);
      const bcryptCompare = async (raw: string, hashed: string) => bcrypt.compareSync(raw, hashed)
      return TokenAuthenticationHandler(userRepo, dogRepo, orderRepo, recipeRepo, subscriptionRepo, stripeCustomerRepo, jwtSecret, jwtVerifyFunction, jwtSignFunction, bcryptCompare, bcryptHash);
  }
};
