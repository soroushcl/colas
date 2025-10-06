// import {DogRepositoryInMemory} from '../DogRepositoryInMemory';
// import {DogRepository} from '../../DogRepository';
// import {User, userStatus} from 'c-lib';
// import { createDb } from '@auth/repositories/userRepository';

// // describe(
// //   'in memory user repository class can be instantiated',
// //   () => {
// //     test('class can be instantiated properly', async () => {
// //       const db = createDb();
// //       const repo = new UserRepositoryInMemory(db);
// //       expect(repo).toBeInstanceOf(UserRepositoryInMemory);
// //       expect(repo).toBeInstanceOf(UserRepository);
// //     });
// //   }
// // );

// describe(
//   'in memory user repository works properly',
//   () => {
//     let repo: DogRepositoryInMemory;
//     let db: User[];
//     beforeEach(() => {
//       db = createDb();
//       repo = new DogRepositoryInMemory(db);
//     });

//     test(
//       'can find a user by id',
//       async () => {
//         const testUser = db[0];

//         const user = await repo.findUserById(testUser.id);
//         expect(user).toEqual(testUser);
//       }
//     );

//     test(
//       'can find a user by email',
//       async () => {
//         const testUser = db[0];

//         const user = await repo.findUserByEmail(testUser.email);
//         expect(user).toEqual(testUser);
//       }
//     );

//     test(
//       'can successfully add a user',
//       async () => {
//         const newUser: User = {
//           id: '2',
//           email: 'myShinyUser@gmail.com',
//           password: '123',
//           firstName: 'Davy',
//           state: 'Ontario',
//           dogCount: 4,
//           status: userStatus.new
//         };

//         await repo.addUser(newUser);
//         expect(db).toHaveLength(2);

//         expect(db[db.length - 1]).toEqual(newUser);
//       }
//     );

//     test(
//       'add user throws error if id taken',
//       async () => {
//         const newUser: User = {
//           id: '1',
//           email: 'someOtherUser@gmail.com',
//           password: '123',
//           firstName: 'Jack',
//           state: "Ontario",
//           dogCount: 4,
//           status: userStatus.new
//         };

//         await expect(repo.addUser(newUser)).rejects.toBe('id already taken');
//         expect(db).toHaveLength(1);
//       }
//     );

//     test(
//       'add user throws error if email taken',
//       async () => {
//         const newUser: User = {
//           id: '2',
//           email: 'omid.taghavi@cola.ai',
//           password: '123',
//           firstName: 'omid',
//           state: "Ontario",
//           dogCount: 4,
//           status: userStatus.new
//         };

//         await expect(repo.addUser(newUser)).rejects.toBe('email already taken');
//         expect(db).toHaveLength(1);
//       }
//     );

//     test(
//       'create id works properly',
//       async () => {
//         const id = await repo.createId();
//         expect(id).toBeTruthy();
//       }
//     );

//     test(
//       'new id can be used to create new user',
//       async () => {
//         const newUser: User = {
//           id: await repo.createId(),
//           email: 'myShinyUser@gmail.com',
//           password: '123',
//           firstName: 'Davy',
//           state: "Ontario",
//           dogCount: 4,
//           status: userStatus.new
//         };

//         await repo.addUser(newUser);
//         expect(db).toHaveLength(2);

//         expect(db[db.length - 1]).toEqual(newUser);
//       }
//     );
//   }
// );