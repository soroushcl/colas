export interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName?: string;
    password?: string;
    phoneNumber?: string;
    status: userStatus;
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
}
export declare enum userStatus {
    new = "NEW",
    userInfo = "USERINFO",
    registered = "REGISTERED"
}
export declare function authenticatedUser(user: User): AuthenticatedUser;
