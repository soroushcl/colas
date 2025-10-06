import {User} from 'c-lib';

export {}

declare global {
  namespace Express {
    export interface Request {
      user: User;
      logout?: () => void;
      isAuthenticated?: () => boolean;
    }
  }
}