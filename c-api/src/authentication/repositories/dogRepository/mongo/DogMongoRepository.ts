import { DogRepository } from '../DogRepository';
import { Dog, User } from 'c-lib';
import { Collection, Db, ObjectId } from "mongodb";
import { fromMongo, toMongo } from "@utils/mongoUtils";


export class DogMongoRepository extends DogRepository {
  async findDogById(id: Dog['id']): Promise<Dog | null> {
    let dog: any | null = null;
    if (ObjectId.isValid(id)) {
      dog = await this.dogCollection.findOne({ _id: new ObjectId(id) });
    }
    // Fallback: if not found or id not a valid ObjectId, try direct string match (legacy data)
    if (!dog) {
      dog = await this.dogCollection.findOne({ _id: id as any });
    }
    if (!dog) {
      return null;
    }
    return fromMongo(dog as any) as unknown as Dog;
  }
  private dogCollection: Collection;

  constructor(db: Db, dogCollectionName: string) {
    super();
    this.dogCollection = db.collection(dogCollectionName);
  }


  async addDog(dog: Dog): Promise<Dog> {
    let inserted = await this.dogCollection.insertOne(toMongo(dog));
    const newDog = await this.dogCollection.findOne({ _id: inserted.insertedId })
    return newDog as unknown as Dog
  }

  async findDogsByOwner(ownerId: User['id']): Promise<Dog[]> {
    // Support both legacy string owner ids and ObjectId-based owner refs
    const filter = ObjectId.isValid(ownerId as any)
      ? { owner: { $in: [ownerId as any, new ObjectId(ownerId as any)] } }
      : { owner: ownerId };
    const cursor = this.dogCollection.find(filter as any);
    const list = await cursor.toArray();
    return list as unknown as Dog[];
  }

}
