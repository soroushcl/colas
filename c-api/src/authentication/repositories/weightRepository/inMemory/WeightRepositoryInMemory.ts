import { WeightRepository } from '../WeightRepository';
import { Weight } from 'c-lib';

export class WeightRepositoryInMemory extends WeightRepository {

  private db: Weight[];

  constructor(db: Weight[]) {
    super();
    this.db = db;
  }


  addWeight(weight: Weight): Promise<Weight> | Promise<never> {
    return new Promise((resolve, reject) => {
      this.db.push(weight as Weight);
      resolve(weight as Weight);
    });
  }

}