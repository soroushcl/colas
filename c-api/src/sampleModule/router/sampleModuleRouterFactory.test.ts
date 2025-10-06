// import express, { Express, Router } from 'express';
// import { Db, MongoClient, ObjectId } from 'mongodb';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import request from 'supertest';
// import {  User } from 'c-lib';
// import { TokenAuthenticationHandler } from '@auth/authenticationHandlers';
// import { UserRepository, AuthenticationHandler, UserRepositoryInMemory, authenticationRouterFactory } from '@auth/index';
// import { generateUserEntries } from '@testHelpers/generators';
// import { createInMemoryMongoDB } from '@utils/mongoUtils';
// import {SampleModuleHandler} from '../sampleModuleTypes';
// // import {sampleModuleHandler} from '../sampleModuleHandler';
// import { SampleModuleMongoRepository, SampleModuleRepository } from '../repositories';
// import {sampleModuleRouterFactory} from './sampleModuleRouterFactory';

// const basePath = '/sampleModule'
// const appendToPath = (endPoint: string) => { return `${basePath}${endPoint}`; };

// const dbName = 'test';
// const collectionName = 'sampleModule';

// // const mockEntries = generateSampleModuleEntries().map((entry: any) => {
// //     return { ...entry, id: new ObjectId().toString() };
// // });

// describe(
//   'sampleModuleRouterFactory',
//   () => {
//     let userRepo: UserRepository,
//       authenticationHandler: AuthenticationHandler,
//       authenticationRouter: Router,
//       app: Express,
//       userDb: User[],
//       token: string;

//     beforeAll(async () => {
//       userDb = generateUserEntries();
//       userRepo = new UserRepositoryInMemory(userDb);
//       authenticationHandler = TokenAuthenticationHandler(userRepo);

//       const {
//         authViews,
//         authDependencies,
//         authMiddleware,
//       } = authenticationHandler;
//       authenticationRouter = authenticationRouterFactory(authViews);
//       app = express();
//       app.use(express.json());
//       authDependencies?.forEach(dep => app.use(dep));
//       app.use(authMiddleware);
//       app.use('/auth', authenticationRouter);
//       const user = userDb[0];
//       const res = await request(app)
//         .post('/auth/login')
//         .send({
//           email: user.email,
//           password: user.password
//         })
//         .set('Accept', 'application/json')
//         .expect('Content-Type', /json/);
//       token = res.body.payload.token;
//     });

//     describe('Using the authentication router', () => {
//       let handler: SampleModuleHandler,
//         router: Router,
//        db: Db,
//         mongoServer: MongoMemoryServer,
//         client: MongoClient,
//         repo: SampleModuleRepository,
//         // mockDocuments: SampleModuleConfig[],
//         authenticationToken: string,
//         authorizationToken: string

//       beforeAll(async () => {
//         // mockDocuments = mockEntries;
//         const dbMongo = await createInMemoryMongoDB(dbName, collectionName, mockEntries);
//         db = dbMongo.db;
//         mongoServer = dbMongo.mongoServer;
//         client = dbMongo.client;
//         repo = new SampleModuleMongoRepository(db, collectionName);
//         // handler = sampleModuleHandler(repo);
//         const {
//           sampleModuleViews
//         } = handler;
//         router = sampleModuleRouterFactory(sampleModuleViews);
//         app.use(basePath, router);
//         authorizationToken='Bearer COLA';
//         authenticationToken=`Bearer ${token}`;
//       });

//       afterAll(async () => {
//         client.close();
//         mongoServer.stop();
//       });

//       it('responds with a 404 it can not find a route that matches the url and http method',
//         async () => {
//           await request(app)
//             .post(appendToPath('/'))
//             .set('Accept', 'application/json')
//             .expect(404)
//             .expect(res => {
//               const { body: { success } } = res;
//               expect(success).toBeFalsy();
//             });
//         }
//       );

//       it('responds with a 401 if there is no authentication token',
//         async () => {
//           await request(app)
//             .get(appendToPath('/configs/all'))
//             .set('Accept', 'application/json')
//             .expect(401)
//             .expect(res => {
//               const { body: { success } } = res;
//               expect(success).toBeFalsy();
//             });
//         }
//       );


//       it('can get all the samples',
//         async () => {
//           await request(app)
//             .get(appendToPath('/configs/all'))
//             .set('Accept', 'application/json')
//             .set('Authorization', authorizationToken)
//             .expect(200)
//             .expect(res => {
//               const { body: { payload, success } } = res;
//               expect(success).toBeTruthy();
//               const configs = payload;
//               // expect(configs.length).toEqual(mockDocuments.length);
//               // expect(configs).toEqual(mockDocuments);
//             }
//           );
//         }
//       );

//       it('can get the total number of samples',
//         async () => {
//           await request(app)
//             .get(appendToPath('/configs/count'))
//             .set('Accept', 'application/json')
//             .set('Authorization', authorizationToken)
//             .expect(200)
//             .expect(res => {
//               // const { body: { payload, success } } = res;
//               const { body: { success } } = res;
//               expect(success).toBeTruthy();
//               // const count = payload;
//               // expect(count).toEqual(mockDocuments.length);
//             }
//           );
//         }
//       );

//       // it('can get a config by id',
//         // async () => {
//           // const expectedConfig = mockDocuments[0];
//           // await request(app)
//             // .get(appendToPath(`/configs/${expectedConfig.id}`))
//             // .set('Accept', 'application/json')
//             // .set('Authorization', authorizationToken)
//             // .expect(200)
//             // .expect(res => {
//               // const { body: { payload, success } } = res;
//               // expect(success).toBeTruthy();
//               // const findResult = payload;
//               // expect(findResult).toEqual(expectedConfig);
//       //       }
//       //     );
//       //   }
//       // );

//       it('responds with an error if it cannot find the config',
//         async () => {
//           const badId = new ObjectId().toString();
//           await request(app)
//             .get(appendToPath(`/configs/${badId}`))
//             .set('Accept', 'application/json')
//             .set('Authorization', authorizationToken)
//             .expect(404)
//             .expect(res => {
//               const { body: { error, success } } = res;
//               expect(success).toBeFalsy();
//               expect(error).toBeDefined();
//             }
//           );
//         }
//       );


//       // it('can update a sample',
//       //   async () => {
//       //     const firstConfig = mockDocuments[0];
//       //     const newSampleModule = firstConfig.canadianSampleModule === "7A" ? "7B": "7A";
//       //     expect(firstConfig.canadianSampleModule).not.toEqual(newSampleModule);
//       //     const updatedConfig: SampleModuleConfig = {
//       //       ...firstConfig,
//       //       canadianSampleModule: newSampleModule,
//       //       updatedAt: Date.now()
//       //     } ;
//       //     const requestBody = { updatedConfig: updatedConfig };

//       //     await request(app)
//       //       .put(appendToPath('/configs'))
//       //       .send(requestBody)
//       //       .set('Accept', 'application/json')
//       //       .set('Authentication', authenticationToken)
//       //       .expect(200)
//       //       .expect(res => {
//       //         const { body: { payload, success } } = res;
//       //         expect(success).toBeTruthy();
//       //         const responseConfig = payload;
//       //         const resultUpdateTime = responseConfig.updatedAt;
//       //         const resultWithoutUpdateTime: Omit<SampleModuleConfig, 'updatedAt'> = updatedConfig;
//       //         expect(updatedConfig).toEqual(expect.objectContaining(resultWithoutUpdateTime));
//       //         expect(resultUpdateTime).toBeGreaterThanOrEqual(updatedConfig.updatedAt ?? 0);
//       //       });
//       //   }
//       // );

//       // it('responds with an error if unable to find config to update',
//       //   async () => {
//       //     const newConfig = {
//       //       ...mockDocuments[0],
//       //       id: repo.createId()
//       //     };
//       //     const requestBody = { updatedConfig: newConfig };

//       //     await request(app)
//       //       .put(appendToPath('/configs'))
//       //       .send(requestBody)
//       //       .set('Accept', 'application/json')
//       //       .set('Authentication', authenticationToken)
//       //       .expect(404)
//       //       .expect(res => {
//       //         const { body: { success, error } } = res;
//       //         expect(success).toBeFalsy();
//       //         expect(error).toEqual('Error: unable to find config to update');
//       //       });
//       //   }
//       // );

//       // it('can delete a sample',
//       //   async () => {
//       //     const configToDelete = mockDocuments[1];
//       //     const requestBody = { id: configToDelete.id };

//       //     await request(app)
//       //       .delete(appendToPath('/configs'))
//       //       .send(requestBody)
//       //       .set('Accept', 'application/json')
//       //       .set('Authentication', authenticationToken)
//       //       .expect(200)
//       //       .expect(res => {
//       //         const { body: { payload, success } } = res;
//       //         expect(success).toBeTruthy();
//       //         const results = payload;
//       //         expect(results).toEqual(true);
//       //       });
//       //   }
//       // );
  
//       // it('responds with an error if unable to find config to delete',
//       //   async () => {
//       //     const badId = repo.createId();
//       //     const requestBody = { id: badId };
//       //     await request(app)
//       //       .delete(appendToPath('/configs'))
//       //       .send(requestBody)
//       //       .set('Accept', 'application/json')
//       //       .set('Authentication', authenticationToken)
//       //       .expect(404)
//       //       .expect(res => {
//       //         const { body: { success, error } } = res;
//       //         expect(success).toBeFalsy();
//       //         expect(error).toEqual('Error: unable to find config to delete' )
//       //       });
//       //   }
//       // );
//     });
//   }
// );