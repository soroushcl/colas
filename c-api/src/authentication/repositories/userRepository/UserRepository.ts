import {ForgotPasswordUser, User} from 'c-lib';

export abstract class UserRepository {
  abstract findUserByEmail(email: User['email']): Promise<User | null> | Promise<never>;

  abstract findUserById(id: User['id']): Promise<User | null> | Promise<never>;

  abstract addUser(user: User): Promise<User> | Promise<never>;

  abstract updateUser(user: User): Promise<User | null> | Promise<never>;

  // abstract updateCustomer(state: User['state'], dogCount: User['dogCount']): Promise<User | null> | Promise<never>;

  // abstract enableDisableUser(userId: User['id'], activate: boolean): Promise<boolean>;

  abstract createForgotPassword(newForgotPasswordUser: ForgotPasswordUser): Promise<ForgotPasswordUser | null>;

  abstract doneForgotPassword(forgotPasswordId: ForgotPasswordUser['id']): Promise<ForgotPasswordUser | null>;

  abstract getForgotPasswordById(forgotPasswordId: ForgotPasswordUser['id']): Promise<ForgotPasswordUser | null>;

  abstract createId(): Promise<User['id']>;
}
