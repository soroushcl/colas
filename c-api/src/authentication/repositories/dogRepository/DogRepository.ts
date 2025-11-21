import {Dog, dogLifeStage, EditDog, User} from 'c-lib';

export abstract class DogRepository {
  // abstract findUserByEmail(email: User['email']): Promise<User | null> | Promise<never>;

  abstract findDogById(id: Dog['id']): Promise<Dog | null> | Promise<never>;

  abstract findEditDogById(id: EditDog['id']): Promise<EditDog | null> | Promise<never>;

  abstract addDog(dog: Dog): Promise<Dog> | Promise<never>;
  
  abstract addEditDog(dog: EditDog): Promise<EditDog> | Promise<never>;

  abstract findDogsByOwner(ownerId: User['id']): Promise<Dog[]> | Promise<never>;

  abstract checkAndUpdateDogLifeStage(dogId: string): Promise<void> | Promise<never>;

  abstract calculateDogLifeStage(age: Date, breedName: string): Promise<dogLifeStage> | Promise<never>;

  abstract editDogById(id: Dog['id'], dog: Dog): Promise<Dog> | Promise<never>;

  // abstract updateUser(user: User): Promise<User | null> | Promise<never>;

  // abstract updateCustomer(state: User['state'], dogCount: User['dogCount']): Promise<User | null> | Promise<never>;

  // abstract enableDisableUser(userId: User['id'], activate: boolean): Promise<boolean>;

  // abstract createForgotPassword(newForgotPasswordUser: ForgotPasswordUser): Promise<ForgotPasswordUser | null>;

  // abstract doneForgotPassword(forgotPasswordId: ForgotPasswordUser['id']): Promise<ForgotPasswordUser | null>;

  // abstract getForgotPasswordById(forgotPasswordId: ForgotPasswordUser['id']): Promise<ForgotPasswordUser | null>;

  // abstract createId(): Promise<User['id']>;
}
