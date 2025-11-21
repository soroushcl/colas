import { Weight } from 'c-lib';

export abstract class WeightRepository {
  abstract addWeight(weight: Weight): Promise<Weight> | Promise<never>;
}
