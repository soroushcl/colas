import { AuthenticatedUser, User, userStatus } from "c-lib";

export const authenticatedUser: AuthenticatedUser = {
  id: '1122334455667788',
  email: 'test00@t.com',
  firstName: 'Test',
  name: 'Test',
  state: 'Ontario',
  dogCount: 4,
  status: userStatus.new,
  // lastName: 'T',
} as const;

export const user: User = {
  ...authenticatedUser,
  password: '123'
} as const;
