import { Dog, Recipe, Subscription, Order, EditDog, subscriptionInfo, Address } from 'src/registration';
import { AuthenticatedUser, ForgotPasswordUser, User } from '../../authentication';
import { Fail, Success } from '../responseTypes';

export interface loginRequestBody {
  email: User['email'];
  password: User['password'];
  rememberMe: boolean;
}

export type loginResponseBody = Success<{ user: AuthenticatedUser, token: string, dogs: Dog[], orders: Order[], subscriptions: Subscription[] }> | Fail;

export interface googleLoginRequestBody {
  code: string;
}

export type googleLoginResponseBody = Success<{ user: AuthenticatedUser, token: string }> | Fail;

export interface googleRegRequestBody {
  code: string;
}

export type googleRegResponseBody = Success<{ email: string }> | Fail;


export interface tokenAuthorizeRequestBody {
  token: string;
}

export type tokenAuthorizeResponseBody = Success<AuthenticatedUser> | Fail;

export interface registerRequestBody {
  email: User['email'];
  firstName: User['firstName'];
}

export type registerResponseBody = Success<{ user: AuthenticatedUser }> | Fail;

export interface registerDogRequestBody {
  dog: Dog;
}

export type registerDogResponseBody = Success<{ dog: Dog, recipes: Recipe[] }> | Fail;

export interface createSubscriptionRequestBody {
  subscription: Subscription;
}

export type createSubscriptionResponseBody = Success<{ subscription: Subscription }> | Fail;


// export interface updateCustomerRequestBody {
//   userId: User['id'];
//   state: User['state'];
//   dogCount: User['dogCount'];
// }

// export type updateCustomerResponseBody = Success<{ user: AuthenticatedUser }> | Fail;

export interface logoutRequestBody {
}

export interface setPasswordRequestBody {
  userId: User['id']
  password: string;
  repassword: string;
}

export type setPasswordResponseBody = Success<true> | Fail;

export type resetPasswordResponseBody = Success<{ user: AuthenticatedUser, token: string }> | Fail;

export type forgotPasswordResponseBody = Success<true> | Fail;


export interface resetPasswordRequestBody {
  forgotPasswordId: ForgotPasswordUser['id']
  password: string;
  repassword: string;
}

export interface forgotPasswordRequestBody {
  email: User['email'];
}

export interface updateUserRequestBody {
  updatedUser: AuthenticatedUser,
}

export type updateUserResponseBody = Success<AuthenticatedUser> | Fail;

// Update user by id after successful payment
export interface updateUserByIdRequestBody {
  id: User['id'];
  name: User['name'];
  firstName: User['firstName'];
  lastName?: User['lastName'];
  email: User['email'];
  phoneNumber?: User['phoneNumber'];
  password?: string; // default to "123" if not provided
}

export type updateUserByIdResponseBody = Success<AuthenticatedUser> | Fail;


export type deleteUserRequestBody = {
  userId: User['id'],
}

export type deleteUserResponseBody = Success<true> | Fail;

export type reactivateUserRequestBody = {
  userId: User['id'],
}

export type reactivateUserResponseBody = Success<true> | Fail;


export type logoutResponseBody = Success<true> | Fail;

export interface editDogRecipesRequestBody {
  newDog: Dog,
}

export type editDogRecipesResponseBody = Success<{dog: Dog, recipes: Recipe[]}> | Fail;

export interface editDogRequestBody {
  newDogId: EditDog['id'],
  subscription: subscriptionInfo[],
}

export type editDogResponseBody = Success<true> | Fail;


export interface editShippingRequestBody {
  shippingAddress: Address,
  
}

export type editShippingResponseBody = Success<true> | Fail;