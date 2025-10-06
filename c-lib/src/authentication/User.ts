
export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName?: string;
  password?: string;
  phoneNumber?: string;
  status: userStatus;
  // disabled: boolean;
  state?: string;
  dogCount?: number;
}

export interface ForgotPasswordUser {
  id: string;
  user: User['id'];
  isDone: boolean;
  expiration: Date;
}

export interface AuthenticatedUser {
  id: User['id'];
  email: User['email'];
  name: User['name'];
  firstName: User['firstName'];
  lastName?: User['lastName'];
  state?: User['state'];
  dogCount?: User['dogCount'];
  status: User['status'];
  // disabled: User['disabled'];
}

export enum userStatus {
  new = "NEW",
  userInfo = "USERINFO",
  registered = "REGISTERED",
}


export function authenticatedUser(user: User): AuthenticatedUser {
  const {
    id,
    email,
    name,
    firstName,
    state,
    dogCount,
    lastName,
    status,
    // disabled
  } = user;
  return {
    id,
    email,
    name,
    firstName,
    state,
    dogCount,
    lastName,
    status,
    // disabled,
  };
}