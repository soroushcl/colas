import { BreedRepository } from '../BreedRepository';
import { Breed } from 'c-lib';
import { Collection, Db } from "mongodb";
import { toMongo } from "@utils/mongoUtils";

export class BreedMongoRepository extends BreedRepository {
  private breedCollection: Collection;

  constructor(db: Db, breedCollectionName: string) {
    super();
    this.breedCollection = db.collection(breedCollectionName);
  }

  async getAllBreeds(): Promise<Breed[]> {
    const cursor = this.breedCollection.find({}).sort({ name: 1 });
    const breeds = await cursor.toArray();
    return breeds as unknown as Breed[];
  }

  async getBreedByName(name: string): Promise<Breed | null> {
    const cursor = this.breedCollection.findOne({ name: name });
    return cursor as unknown as Breed;
  }

  async getBreedById(id: string): Promise<Breed | null> {
    const breed = await this.breedCollection.findOne({ id });
    return breed as unknown as Breed | null;
  }

  async addBreed(breed: Breed): Promise<Breed> {
    const inserted = await this.breedCollection.insertOne(toMongo(breed));
    const newBreed = await this.breedCollection.findOne({ _id: inserted.insertedId });
    return newBreed as unknown as Breed;
  }

  async updateBreed(breed: Breed): Promise<Breed | null> {
    const result = await this.breedCollection.findOneAndUpdate(
      { id: breed.id },
      { $set: toMongo(breed) },
      { returnDocument: 'after' }
    );
    return result as unknown as Breed | null;
  }

  async deleteBreed(id: string): Promise<boolean> {
    const result = await this.breedCollection.deleteOne({ id });
    return result.deletedCount > 0;
  }
}
