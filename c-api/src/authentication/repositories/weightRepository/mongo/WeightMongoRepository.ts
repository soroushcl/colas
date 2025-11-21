import { createMongoId, toMongo } from '@utils/mongoUtils';
import { WeightRepository } from '../WeightRepository';
import { Weight, } from 'c-lib';
import { Collection, Db, ObjectId } from "mongodb";
// import { toMongo } from "@utils/mongoUtils";
// import { BreedRepository } from 'src/breeds/repositories';
// import { RecipeRepository } from '@auth/repositories/recipeRepository';
// import { DogRepository } from '@auth/repositories/dogRepository';

export class WeightMongoRepository extends WeightRepository {
  private weightCollection: Collection;

  constructor(db: Db, weightCollectionName: string) {
    super();
    this.weightCollection = db.collection(weightCollectionName);
  }


  
  async addWeight(weight: Weight): Promise<Weight> {
    const normalizedOrder = this.ensureValidOrderId(weight);
    const inserted = await this.weightCollection.insertOne(toMongo(normalizedOrder));
    const newOrder = await this.weightCollection.findOne({ _id: inserted.insertedId });
    return newOrder as unknown as Weight;
  }

  private ensureValidOrderId(weight: Weight): Weight {
    if (weight.id && ObjectId.isValid(weight.id)) {
      return weight;
    }
    return {
      ...weight,
      id: createMongoId(),
    };
  }
}

