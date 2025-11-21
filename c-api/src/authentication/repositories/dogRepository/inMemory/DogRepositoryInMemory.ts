import { DogRepository } from '../DogRepository';
import { Dog, dogLifeStage, EditDog, User } from 'c-lib';

export class DogRepositoryInMemory extends DogRepository {
  editDogById(id: Dog['id'], dog: Dog): Promise<Dog> | Promise<never> {
    throw new Error('Method not implemented.');
  }
  calculateDogLifeStage(age: Date, breedName: string): Promise<dogLifeStage> | Promise<never> {
    throw new Error('Method not implemented.' + age + breedName);
  }
  findEditDogById(id: EditDog['id']): Promise<EditDog | null> | Promise<never> {
    throw new Error('Method not implemented.' + id);
  }
  addEditDog(dog: EditDog): Promise<EditDog> | Promise<never> {
    throw new Error('Method not implemented.' + dog);
  }
  findDogById(id: Dog['id']): Promise<Dog | null> | Promise<never> {
    throw new Error('Method not implemented.1');
  }
  addDog(dog: Dog): Promise<Dog> | Promise<never> {
    return new Promise((resolve, reject) => {
      this.db.push(dog as Dog);
      resolve(dog as Dog);
    });
  }
  private db: Dog[];

  constructor(db: Dog[]) {
    super();
    this.db = db;
  }

  findDogsByOwner(ownerId: User['id']): Promise<Dog[]> | Promise<never> {
    return new Promise((resolve) => {
      resolve(this.db.filter(d => d.owner === ownerId));
    });
  }

  checkAndUpdateDogLifeStage(_dogId: string): Promise<void> | Promise<never> {
    throw new Error('Method not implemented.');
  }

  // export function createDb(): Dog[] {
  //   return [
  //     {
  //       owner: "",
  //       name: '',
  //       weight: '',
  //       breed: '',
  //       age: new Date(),
  //       gender: gender.male,
  //       isNeutered: false,
  //       isPregnant: false,
  //       pregnancyDuration: 0,
  //       isNursing: false,
  //       hasHealthIssue: false,
  //       healthIssue: [],
  //       nursingPuppies: 0,
  //       activityLevel: activityLevel.low,
  //       eating: eatingHabit.picky,
  //       shape: shape.underweight,
  //       isAllergic: false,
  //       allergies: [],
  //       proteins: [],
  //       calorie: 0,
  //       note: '',
  //       status: dogStatus.active
  //     }
  //   ];
}