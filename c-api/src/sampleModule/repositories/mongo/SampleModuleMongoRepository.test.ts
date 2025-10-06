// import { ObjectId, Db, MongoClient, MongoServerSelectionError, MongoNotConnectedError } from "mongodb";
// import { MongoMemoryServer } from "mongodb-memory-server";
// import { generateSampleModuleEntries, generateMockSampleModuleConfig } from "@testHelpers/generators";
// import { createInMemoryMongoDB, toMongo } from "@utils/mongoUtils";
// import { SampleModuleMongoRepository } from "./SampleModuleMongoRepository";

// const dbName = 'test';
// const collectionName = 'SampleModuleConfigs';

// const mockEntries = generateSampleModuleEntries().map((entry) => {
//   return { ...entry, id: new ObjectId().toString() };
// });

// const convertToMongo = (documents: any[]) => {
//   if (documents.length < 0) {
//     return [];
//   }
//   const firstDoc = documents[0];
//   if ('id' in firstDoc) {
//     return documents.map((entry) => { return toMongo(entry) });
//   }
//   return documents;
// }

// const documentsToInsert = convertToMongo(JSON.parse(JSON.stringify(mockEntries)));
// describe('SampleModuleMongoRepository', () => {
//   test('can be instantiated', async () => {
//     const { db, mongoServer, client } = await createInMemoryMongoDB(dbName, collectionName, documentsToInsert);
//     const repo = new SampleModuleMongoRepository(db, collectionName);
//     expect(repo).toBeInstanceOf(SampleModuleMongoRepository);
//     await client.close();
//     await mongoServer.stop();
//   });
// });
// describe('When SampleModuleMongoRepository is running', () => {
//   test('throws an error if the server is stopped.', async () => {
//     const { db, mongoServer, client } = await createInMemoryMongoDB(dbName, collectionName, documentsToInsert);
//     const repo = new SampleModuleMongoRepository(db, collectionName);
//     expect(mongoServer.state).toBe('running');
//     await mongoServer.stop({ force: true })
//     expect(mongoServer.state).toBe('stopped');
//     await expect(repo.getNumberOfSampleModuleConfigs()).rejects.toBeInstanceOf(MongoServerSelectionError);
//     await client.close();
//   });
//   test('throws an error if the connection is closed.', async () => {
//     const { db, mongoServer, client } = await createInMemoryMongoDB(dbName, collectionName, documentsToInsert);
//     const repo = new SampleModuleMongoRepository(db, collectionName);
//     await client.close(true);
//     await expect(repo.getNumberOfSampleModuleConfigs()).rejects.toBeInstanceOf(MongoNotConnectedError);
//     mongoServer.stop();
//   });
// });

// describe('MongoRepository',
//   () => {
//     let db: Db;
//     let mongoServer: MongoMemoryServer;
//     let client: MongoClient;
//     let repo: SampleModuleMongoRepository;

//     beforeEach(async () => {
//       const dbMongo = await createInMemoryMongoDB(dbName, collectionName, documentsToInsert);
//       db = dbMongo.db;
//       mongoServer = dbMongo.mongoServer;
//       client = dbMongo.client;
//       repo = new SampleModuleMongoRepository(db, collectionName);
//     });

//     afterEach(async () => {
//       await client.close();
//       await mongoServer.stop();
//     });

//     it(
//       'can get the number of configs',
//       async () => {
//         const count = await repo.getNumberOfSampleModuleConfigs();
//         expect(count).toEqual(mockEntries.length);

//         const allConfigs = await repo.findAllSampleModuleConfigs();
//         expect(count).toEqual(allConfigs.length);
//       }
//     );

//     it(
//       'can find all configs',
//       async () => {
//         const expectedResults = mockEntries;
//         const allConfigs = await repo.findAllSampleModuleConfigs();
//         expect(allConfigs.length).toEqual(expectedResults.length);
//       }
//     );

//     it(
//       'can find a config by id',
//       async () => {
//         const expectedConfig = mockEntries[0];
//         const foundConfig = await repo.findSampleModuleConfigById(expectedConfig.id);
//         expect(foundConfig).toEqual(expectedConfig);
//       }
//     );

//     it(
//       'returns null if unable to find config',
//       async () => {
//         const badId = new ObjectId().toString();
//         const testDecarbAssessment = await repo.findSampleModuleConfigById(badId);
//         expect(testDecarbAssessment).toBeNull();
//       }
//     );

//     it(
//       'throws if the id does not match the format mongo expects',
//       async () => {
//         const badId = new ObjectId().toString();
//         expect(async () => await repo.findSampleModuleConfigById(badId)).rejects.toThrow();
//       }
//     );

//     it(
//       'creates a new config that can be searched for after creation',
//       async () => {
//         const newConfig = generateMockSampleModuleConfig({ id: repo.createId() });

//         const createResponse = await repo.createSampleModuleConfig(newConfig);
//         expect(createResponse).toEqual(newConfig);

//         const findResponse = await repo.findSampleModuleConfigById(newConfig.id);
//         expect(findResponse).not.toBeNull();
//         expect(findResponse).toEqual(newConfig);

//         const finalCount = await repo.getNumberOfSampleModuleConfigs();
//         expect(finalCount).toEqual(mockEntries.length + 1);
//       }
//     );

//     it(
//       'updates a config',
//       async () => {
//         const initialConfig = mockEntries[1];
//         let findResponse = await repo.findSampleModuleConfigById(initialConfig.id);
//         expect(findResponse).toEqual(initialConfig);

//         const newSampleModule = initialConfig.canadianSampleModule === "7A" ? "7B": "7A";
//         const updatedConfig = (() => {
//           const newConfig = JSON.parse(JSON.stringify(initialConfig));
//           newConfig.canadianSampleModule = newSampleModule;
//           return newConfig;
//         })();

//         const updateConfigResult = await repo.updateSampleModuleConfig(updatedConfig);
//         expect(updateConfigResult).not.toEqual(initialConfig);
//         expect(updateConfigResult).toEqual(updatedConfig);

//         const updatedFindResponse = await repo.findSampleModuleConfigById(initialConfig.id);
//         expect(updatedFindResponse).not.toEqual(initialConfig);
//         expect(updatedFindResponse).toEqual(updatedConfig);

//         const finalCount = await repo.getNumberOfSampleModuleConfigs();
//         expect(finalCount).toEqual(mockEntries.length);
//       }
//     );

//     it(
//       'throws an error if an update config does not exist',
//       async () => {
//         const badId = new ObjectId().toString();
//         let findResponse = await repo.findSampleModuleConfigById(badId);
//         expect(findResponse).toBeNull();

//         const badUpdatedConfig = generateMockSampleModuleConfig({ id: badId })
//         const findResult = await repo.findSampleModuleConfigById(badUpdatedConfig.id);
//         expect(findResult).toBe(null);

//         await expect(async () => { await repo.updateSampleModuleConfig(badUpdatedConfig); }).rejects.toThrow();
//       }
//     );

//     it(
//       'can delete a config',
//       async () => {
//         const entryId = mockEntries[0].id;
//         let initialEntry = await repo.findSampleModuleConfigById(entryId);
//         expect(initialEntry).not.toBe(null);

//         const testDecarbAssessment = await repo.deleteSampleModuleConfig(entryId);
//         expect(testDecarbAssessment).toBeTruthy();
//         expect(testDecarbAssessment).toEqual(true);

//         let entryAfterDeletion = await repo.findSampleModuleConfigById(entryId);
//         expect(entryAfterDeletion).toBeNull();

//         const finalCount = await repo.getNumberOfSampleModuleConfigs();
//         expect(finalCount).toEqual(mockEntries.length - 1);
//       }
//     );

//     it(
//       'throws an error if a deleted config is deleted',
//       async () => {
//         const entryId = mockEntries[0].id;
//         let initialEntry = await repo.findSampleModuleConfigById(entryId);
//         expect(initialEntry).not.toBeNull();

//         const testDecarbAssessment = await repo.deleteSampleModuleConfig(entryId);
//         expect(testDecarbAssessment).toBeTruthy();
//         let entryAfterDeletion = await repo.findSampleModuleConfigById(entryId);
//         expect(entryAfterDeletion).toBeNull();

//         expect(async () => { await repo.deleteSampleModuleConfig(entryId); }).rejects.toThrow();
//         let entryAfterSecondDeletion = await repo.findSampleModuleConfigById(entryId);
//         expect(entryAfterSecondDeletion).toBeNull();
//       }
//     );

//     it(
//       'throws an error if the config to delete does not exist',
//       async () => {
//         const badId = new ObjectId().toString();
//         let initialEntry = await repo.findSampleModuleConfigById(badId);
//         expect(initialEntry).toBe(null);

//         expect(async () => { await repo.deleteSampleModuleConfig(badId); }).rejects.toThrow();
//       }
//     );
//   }
// );
