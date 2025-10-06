import { UserMongoRepository } from '../UserMongoRepository';
import { UserRepository } from '../../UserRepository';
import { User, userStatus, } from 'c-lib';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Db, MongoClient, ObjectId } from "mongodb";
import { fromMongo, mongoObj } from "@utils/mongoUtils";

const testUserId = new ObjectId();
const testUser: mongoObj<User> = {
  email: 'omid.taghavi@cola.ai',
  _id: testUserId,
  password: '12345',
  name: 'Omid',
  firstName: 'Omid',
  state: "Ontario",
  dogCount: 4,
  status: userStatus.new,
  lastName: 'Taghavi',
  // type: UserType.cola_admin,
  // disabled: false,
}

const userCollectionName = "users";
const forgotPasswordCollectionName = "forgotPasswords";

const createDb = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  const client = new MongoClient(uri);
  await client.connect()
  const db = client.db("test");

  await db.collection(userCollectionName).insertMany([
    testUser
  ])
  return { db, mongoServer, client };
}

describe(
  'UserMongoRepository',
  () => {
    test('can be instantiated', async () => {
      const { db, mongoServer, client } = await createDb();
      const repo = new UserMongoRepository(db, userCollectionName, forgotPasswordCollectionName);
      expect(repo).toBeInstanceOf(UserMongoRepository);
      expect(repo).toBeInstanceOf(UserRepository);
      await client.close()
      await mongoServer.stop()
    });
  }
);

describe(
  'If the mongo server is working, UserMongoRepository',
  () => {
    let repo: UserMongoRepository;
    let db: Db;
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;
    beforeEach(async () => {
      const dbMongo = await createDb();
      db = dbMongo.db;
      mongoServer = dbMongo.mongoServer;
      client = dbMongo.client;
      repo = new UserMongoRepository(db, userCollectionName, forgotPasswordCollectionName);
    });

    afterEach(async () => {
      await client.close()
      await mongoServer.stop()
    })

    test(
      'can find a user by id',
      async () => {
        const testUser = (await db.collection(userCollectionName).find({}).toArray())[0] as unknown as mongoObj<User>;
        const user = await repo.findUserById(testUserId.toString());
        expect(user).toEqual(fromMongo(testUser));
      }
    );

    test(
      'can find a user by email',
      async () => {
        const user = await repo.findUserByEmail(testUser.email);
        expect(user).toEqual(fromMongo(testUser));
      }
    );

    test(
      'can successfully add a user',
      async () => {
        const newUser: User = {
          id: await repo.createId(),
          email: 'myShinyUser@gmail.com',
          password: '123',
          name: 'Davy',
          firstName: 'Davy',
          state: "Ontario",
          dogCount: 4,
          status: userStatus.new
        };

        await repo.addUser(newUser);
        expect(await db.collection(userCollectionName).countDocuments({})).toEqual(2);
        expect(await repo.findUserById(newUser.id.toString())).toEqual(newUser);
      }
    );

    test(
      'add user throws error if id taken',
      async () => {
        const newUser: User = {
          id: testUser._id.toString(),
          email: 'someOtherUser@gmail.com',
          password: '123',
          name: 'Davy',
          firstName: 'Jack',
          state: "Ontario",
          dogCount: 4,
          status: userStatus.new
        };
        await expect(repo.addUser(newUser)).rejects.toThrow(`E11000 duplicate key error collection: test.users index: _id_ dup key: { _id: ObjectId('${testUser._id.toString()}') }`);
        expect(await db.collection(userCollectionName).countDocuments({})).toEqual(1);
      }
    );

    test(
      'add user throws error if email taken',
      async () => {
        const newUser: User = {
          id: new ObjectId().toString(),
          email: 'omid.taghavi@cola.ai',
          password: '123',
          name: 'Davy',
          firstName: 'omid',
          state: "Ontario",
          dogCount: 4,
          status: userStatus.new
        };

        await expect(repo.addUser(newUser)).rejects.toThrow('email already taken');
        expect(await db.collection(userCollectionName).countDocuments({})).toEqual(1);
      }
    );

    test(
      'create id works properly',
      async () => {
        const id = await repo.createId();
        expect(id).toBeTruthy();
      }
    );

    test(
      'new id can be used to create new user',
      async () => {
        const newUser: User = {
          id: await repo.createId(),
          email: 'myShinyUser@gmail.com',
          password: '123',
          name: 'Davy',
          firstName: 'Davy',
          state: "Ontario",
          dogCount: 4,
          status: userStatus.new
        };

        await repo.addUser(newUser);
        expect(await db.collection(userCollectionName).countDocuments({})).toEqual(2);
        expect(await repo.findUserById(newUser.id.toString())).toEqual(newUser);
      }
    );
  }
);