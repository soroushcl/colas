import { DogRepository } from '../DogRepository';
import { Dog, User } from 'c-lib';

export class DogRepositoryInMemory extends DogRepository {
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