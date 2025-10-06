import {NextFunction, Request, Response} from "express";
import {
  Fail,
} from 'c-lib';

// export function authorize(allowedAccessLevels: User['type'][]): RequestHandler {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     if (req.isAuthenticated && req.isAuthenticated()) {
//       const isAuthorized = !allowedAccessLevels || allowedAccessLevels.includes((req.user as User).type);
//       if (isAuthorized) {
//         next();
//         return;
//       }
//       res.status(401).json(Fail(new Error('not authorized').toString()))
//     }
//     res.status(401).json(Fail(new Error('not authenticated').toString()))
//   }
// }

export function externalAuthorization (req: Request, res: Response, next: NextFunction) {
  if(!req.headers['authorization']) {
    res.status(401).json(Fail(new Error('not authorized').toString()))
    return;
  }
  //TODO API key management
  if(req.headers['authorization'] != 'Bearer COLA') {
    res.status(401).json(Fail(new Error('not authorized').toString()))
    return;
  }
  next();
  return;
}