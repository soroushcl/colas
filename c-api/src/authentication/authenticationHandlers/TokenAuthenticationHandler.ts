import { OAuth2Client } from 'google-auth-library';
import { UserRepository, DogRepository, RecipeRepository, SubscriptionRepository, StripeCustomerRepository } from '../repositories/index';
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
} from 'c-lib';
import cookieParser from 'cookie-parser';
import { colaURL, forgotPasswordExpirationTimer } from "@utils/constants";
import { mailHandlerFactory } from "@services/mailer/mailHandlerFactory";
// import {OrgUserInvitedParams} from "@services/mailer/templates/stringTemplates/orgUserInvited";
import { ForgotPasswordParams } from "@services/mailer/templates/stringTemplates/forgotPassword";
import { OrderRepository } from '@auth/repositories/orderRepository';

const googleLoginWithCode = async (code: string) => {
  const CLIENT_ID = process.env['OAUTH2_GOOGLE_CLIENT_ID'] || '698941654245-kqd42a2aqdi8ooet57fk8vfjbq6dlm4o.apps.googleusercontent.com';
  const CLIENT_SECRET = process.env['OAUTH2_GOOGLE_CLIENT_SECRET'] || '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';
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
          const emailValid = await compareFunction(password, user?.password || '');
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
          const subscriptions = await subscriptionRepo.findSubscriptionsByUserId(user.id);
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