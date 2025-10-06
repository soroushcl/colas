// import express, { Express, Router } from 'express';
// import request from 'supertest';
// import {
//   createDb,
//   UserRepositoryInMemory
// } from '../repositories';
// import {
//   TokenAuthenticationHandler
// } from '../authenticationHandlers';
// import { authenticationRouterFactory } from './authenticationRouterFactory';
// import { UserRepository } from '../repositories';
// import { AuthenticationHandler } from '../authenticationTypes';
// import { authenticatedUser, User } from 'c-lib';
// import { Success } from 'c-lib';

// describe(
//   'authentication router factory works properly',
//   () => {
//     let repo: UserRepository,
//       handler: AuthenticationHandler,
//       router: Router,
//       app: Express,
//       db: User[];

//     beforeEach(() => {
//       db = createDb();
//       repo = new UserRepositoryInMemory(db);
//       handler = TokenAuthenticationHandler(repo);

//       const {
//         authViews,
//         authDependencies,
//         authMiddleware,
//       } = handler;

//       router = authenticationRouterFactory(authViews);

//       app = express();
//       app.use(express.json());

//       authDependencies?.forEach(dep => app.use(dep));

//       app.use(authMiddleware);

//       const mockRouter = express.Router();

//       mockRouter.get('/greetings', authViews.authGuard, (req, res) => {
//         res.status(200).json(Success({ message: 'Hello world!' }));
//       });

//       app.use('/auth', router);
//       app.use('/mock', mockRouter);
//     });

//     test(
//       'successful login',
//       async () => {
//         const user = db[0];
//         const theAuthenticatedUser = authenticatedUser(user);

//         await request(app)
//           .post('/auth/login')
//           .send({
//             email: user.email,
//             password: user.password
//           })
//           .set('Accept', 'application/json')
//           .expect('Content-Type', /json/)
//           .expect(200)
//           .expect(res => {
//             const { body: { payload, success } } = res;
//             expect(success).toBeTruthy();
//             expect(payload.user).toEqual(theAuthenticatedUser);

//             const cookieValue = payload.token;
//             const parsedCookie = JSON.parse(decodeURIComponent(cookieValue));
//             expect(parsedCookie).toEqual(theAuthenticatedUser);
//           });
//       }
//     );

//     test(
//       'wrong password',
//       async () => {
//         const user = db[0];

//         await request(app)
//           .post('/auth/login')
//           .send({
//             email: user.email,
//             password: '1234'
//           })
//           .set('Accept', 'application/json')
//           .expect('Content-Type', /json/)
//           .expect(401)
//           .expect(res => {
//             const { body: { error, success }, header } = res;
//             expect(success).toBeFalsy();
//             expect(error).toContain('credentials not valid');
//             expect(header['set-cookie']).toBeUndefined(); // no cookie is set if login is not successful
//           });

//       }
//     );

//     test(
//       'wrong email',
//       async () => {
//         const user = db[0];

//         await request(app)
//           .post('/auth/login')
//           .send({
//             email: 'wrong.email@provider.com',
//             password: user.password
//           })
//           .set('Accept', 'application/json')
//           .expect('Content-Type', /json/)
//           .expect(401)
//           .expect(res => {
//             const { body: { error, success }, header } = res;
//             expect(success).toBeFalsy();
//             expect(error).toContain('credentials not valid');
//             expect(header['set-cookie']).toBeUndefined(); // no cookie is set if login is not successful
//           });

//       }
//     );

//     test(
//       'can not access protected routes without authentication',
//       async () => {
//         await request(app)
//           .get('/mock/greetings')
//           .set('Accept', 'application/json')
//           .expect('Content-Type', /json/)
//           .expect(401)
//           .expect(res => {
//             const { body: { error, success } } = res;
//             expect(success).toBeFalsy();
//             expect(error).toContain('not authenticated');
//           });
//       }
//     );

//     test(
//       'can access protected routes after authentication',
//       async () => {
//         const user = db[0];
//         const res = await request(app)
//           .post('/auth/login')
//           .send({
//             email: user.email,
//             password: user.password
//           })
//           .set('Accept', 'application/json')
//           .expect('Content-Type', /json/);
//         const token = res.body.payload.token;

//         await request(app)
//           .get('/mock/greetings')
//           .set('Accept', 'application/json')
//           .set('Authentication', `Bearer ${token}`)
//           .expect('Content-Type', /json/)
//           .expect(200)
//           .expect(res => {
//             const { body: { payload, success } } = res;
//             expect(success).toBeTruthy();
//             expect(payload).toEqual(expect.objectContaining({ message: 'Hello world!' }));
//           });
//       }
//     );

//     // test(
//     //   'successful registration',
//     //   async () => {
//     //     const initialDBLength = db.length;
//     //     const newUser = {
//     //       firstName: 'Tommy',
//     //       lastName: 'Cat',
//     //       email: 'tommythecat@gmail.com',
//     //       password: '139856'
//     //     };

//     //     await request(app)
//     //       .post('/auth/register')
//     //       .send(newUser)
//     //       .set('Accept', 'application/json')
//     //       .expect('Content-Type', /json/)
//     //       .expect(200)
//     //       .expect(res => {
//     //         const { body: { payload, success }, header } = res;
//     //         expect(success).toBeTruthy();

//     //         expect(payload.firstName).toBe(newUser.firstName);
//     //         expect(payload.lastName).toBe(newUser.lastName);
//     //         expect(payload.email).toBe(newUser.email);
//     //         expect(payload.id).toBeTruthy();

//     //         const cookieValue = header['set-cookie'][0].split('=')[1].split('; ')[0];
//     //         const parsedCookie = JSON.parse(decodeURIComponent(cookieValue));
//     //         expect(parsedCookie.firstName).toBe(newUser.firstName);
//     //         expect(parsedCookie.lastName).toBe(newUser.lastName);
//     //         expect(parsedCookie.email).toBe(newUser.email);
//     //         expect(parsedCookie.id).toBeTruthy();

//     //         expect(db).toHaveLength(initialDBLength + 1);
//     //       });
//     //   }
//     // );

//     // test(
//     //   'cannot register with existing email',
//     //   async () => {
//     //     const existingUser = db[0];

//     //     const newUser = {
//     //       firstName: 'Tommy',
//     //       lastName: 'Cat',
//     //       email: existingUser.email,
//     //       password: '139856'
//     //     };

//     //     await request(app)
//     //       .post('/auth/register')
//     //       .send(newUser)
//     //       .set('Accept', 'application/json')
//     //       .expect('Content-Type', /json/)
//     //       .expect(400)
//     //       .expect(res => {
//     //         const { body: { error, success } } = res;
//     //         expect(success).toBeFalsy();
//     //         expect(error).toContain("Email already taken");
//     //         expect(db).toHaveLength(1);
//     //       });
//     //   }
//     // );

//     // test(
//     //   'cannot register if user info missing (testing with lastName missing)',
//     //   async () => {
//     //     const newUser = {
//     //       firstName: 'Tommy',
//     //       email: 'tommythecat@gmail.com',
//     //       password: '139856'
//     //     };

//     //     await request(app)
//     //       .post('/auth/register')
//     //       .send(newUser)
//     //       .set('Accept', 'application/json')
//     //       .expect('Content-Type', /json/)
//     //       .expect(400)
//     //       .expect(res => {
//     //         const { body: { error, success } } = res;
//     //         expect(success).toBeFalsy();
//     //         expect(error).toContain('user info missing');
//     //         expect(db).toHaveLength(1);
//     //       });
//     //   }
//     // );

//     // test(
//     //   'cannot register if user info missing (testing with firstName missing)',
//     //   async () => {
//     //     const newUser = {
//     //       lastName: 'Cat',
//     //       email: 'tommythecat@gmail.com',
//     //       password: '139856'
//     //     };

//     //     await request(app)
//     //       .post('/auth/register')
//     //       .send(newUser)
//     //       .set('Accept', 'application/json')
//     //       .expect('Content-Type', /json/)
//     //       .expect(400)
//     //       .expect(res => {
//     //         const { body: { error, success } } = res;
//     //         expect(success).toBeFalsy();
//     //         expect(error).toContain('user info missing');
//     //         expect(db).toHaveLength(1);
//     //       });
//     //   }
//     // );
//   }
// );