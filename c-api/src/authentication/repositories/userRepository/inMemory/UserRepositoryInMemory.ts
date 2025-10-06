import { UserRepository } from '../UserRepository';
import { ForgotPasswordUser, User, userStatus } from 'c-lib';

export class UserRepositoryInMemory extends UserRepository {
  private db: User[];

  constructor(db: User[]) {
    super();
    this.db = db;
  }

  findUserById(id: User["id"]): Promise<User | null> {
    return new Promise((resolve) => {
      resolve(this.db.find(user => user.id === id) || null);
    });
  }

  findUserByEmail(email: User["email"]): Promise<User | null> {
    return new Promise((resolve) => {
      resolve(this.db.find(user => user.email === email) || null);
    });
  }

  addUser(newUser: User): Promise<User> | Promise<never> {
    return new Promise((resolve, reject) => {
      const isIdTaken = Boolean(this.db.find(user => user.id === newUser.id));
      if (isIdTaken) return reject('id already taken');
      const isEmailTaken = Boolean(this.db.find(user => user.email === newUser.email));
      if (isEmailTaken) return reject('email already taken');
      this.db.push(newUser);
      resolve(newUser);
    });
  }

  async createForgotPassword(newForgotPasswordUser: ForgotPasswordUser): Promise<ForgotPasswordUser> {
    return newForgotPasswordUser;
  }

  async doneForgotPassword(forgotPasswordId: ForgotPasswordUser["id"]): Promise<ForgotPasswordUser> {
    const forgotPassword: ForgotPasswordUser = {
      id: "1",
      user: '2',
      isDone: false,
      expiration: new Date()
    }
    return forgotPassword;
  }

  async getForgotPasswordById(forgotPasswordId: ForgotPasswordUser["id"]): Promise<ForgotPasswordUser> {
    const forgotPassword: ForgotPasswordUser = {
      id: "1",
      user: '2',
      isDone: false,
      expiration: new Date()
    }
    return forgotPassword;
  }

  createId(): Promise<User["id"]> {
    return new Promise((resolve) => {
      const lastId = this.db[this.db.length - 1].id;
      const newId = (parseInt(lastId) + 1).toString();
      resolve(newId);
    });
  }

  enableDisableUser(userId: User["id"], activate: boolean): Promise<boolean> {
    return Promise.resolve(false);
  }


  updateUser(user: User): Promise<User | null> | Promise<never> {
    return Promise.resolve(user);
  }

  // updateCustomer(state: User['state'], dogCount: User['dogCount']): Promise<User | null> | Promise<never> {
  //   const updatedCustomer: User = {
  //     id: "1",
  //     email: 'e',
  //     firstName: '2',
  //     state: state,
  //     dogCount: dogCount
  //   }
  //   return Promise.resolve(updatedCustomer);
  // }

  // organizationsList(): Promise<Organization[]> {
  //   return Promise.resolve([]);
  // }

  // findOrganizationById(organizationId: Organization["id"]): Promise<Organization | null> {
  //   return Promise.resolve(null);
  // }

  // updateOrganization(updatedOrganization: Organization): Promise<Organization | null> {
  //   return Promise.resolve(null);
  // }

  // createOrganization(organization: Organization): Promise<Organization | null> {
  //   return Promise.resolve(null);
  // }


  // getOrganizationById(organizationId: Organization["id"]): Promise<Organization | null> {
  //   return Promise.resolve(null);
  // }
}

export function createDb(): User[] {
  return [
    {
      email: 'omid.taghavi@cola.ai',
      id: '1',
      password: '12345',
      name: 'Davy',
      firstName: 'Omid',
      state: "Ontario",
      dogCount: 4,
      status: userStatus.new,
      // lastName: 'Taghavi',
      // type: UserType.cola_admin,
      // disabled: false,
    }
  ];
}