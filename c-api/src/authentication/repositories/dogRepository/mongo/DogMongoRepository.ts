import { DogRepository } from '../DogRepository';
import { Dog, dogLifeStage, EditDog, Subscription, User } from 'c-lib';
import { Collection, Db, ObjectId } from "mongodb";
import { fromMongo, toMongo } from "@utils/mongoUtils";
import { SubscriptionMongoRepository, SubscriptionRepository } from '@auth/repositories/subscriptionRepository';
import { BreedRepository } from 'src/breeds/repositories';


export class DogMongoRepository extends DogRepository {

  private dogCollection: Collection;
  private editDogCollection: Collection;
  private priceModelCollection: Collection;
  private subscriptionRepo?: SubscriptionRepository;
  private breedRepo: BreedRepository;
  constructor(db: Db, dogCollectionName: string, editDogCollectionName: string, priceModelCollectionName: string, breedRepo: BreedRepository, subscriptionRepo?: SubscriptionRepository) {
    super();
    this.dogCollection = db.collection(dogCollectionName);
    this.editDogCollection = db.collection(editDogCollectionName);
    this.priceModelCollection = db.collection(priceModelCollectionName);
    this.subscriptionRepo = subscriptionRepo;
    this.breedRepo = breedRepo;
  }

  setSubscriptionRepository(subscriptionRepo: SubscriptionRepository) {
    this.subscriptionRepo = subscriptionRepo;
  }

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

  async findEditDogById(id: EditDog['id']): Promise<EditDog | null> {
    let dog: any | null = null;
    if (ObjectId.isValid(id)) {
      dog = await this.editDogCollection.findOne({ _id: new ObjectId(id) });
    }
    // Fallback: if not found or id not a valid ObjectId, try direct string match (legacy data)
    if (!dog) {
      dog = await this.editDogCollection.findOne({ _id: id as any });
    }
    if (!dog) {
      return null;
    }
    return fromMongo(dog as any) as unknown as EditDog;
  }

  async addDog(dog: Dog): Promise<Dog> {
    let inserted = await this.dogCollection.insertOne(toMongo(dog));
    const newDog = await this.dogCollection.findOne({ _id: inserted.insertedId })
    return newDog as unknown as Dog
  }

  async editDogById(id: Dog['id'], dog: Dog): Promise<Dog> {
    let updated = await this.dogCollection.updateOne({ _id: new ObjectId(id) }, {
      $set: {
        dog
      }
    });
    return updated as unknown as Dog
  }

  async addEditDog(dog: EditDog): Promise<EditDog> {
    const editDog = await this.editDogCollection.findOne({ _id: new ObjectId(dog.id) })
    if (editDog) {
      await this.editDogCollection.updateOne({ _id: new ObjectId(dog.id) }, {
        $set: {
          dog
        }
      });
      const newDog = await this.editDogCollection.findOne({ _id: new ObjectId(dog.id) })
      return newDog as unknown as EditDog
    } else {

      let inserted = await this.editDogCollection.insertOne(toMongo(dog));
      const newDog = await this.editDogCollection.findOne({ _id: inserted.insertedId })
      return newDog as unknown as EditDog
    }
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

  async calculateDogLifeStage(age: Date, breedName: string): Promise<dogLifeStage> {
    // console.log("calculateDogLifeStage", age, breedName)
    let breed = await this.breedRepo.getBreedByName(breedName.replace(/\(/g, '\\(').replace(/\)/g, '\\)'))
    if (breed) {
      let ageInMonth = (new Date().getTime() - new Date(age).getTime()) / (1000 * 60 * 60 * 24 * 30);
      // console.log("breed", breed, ageInMonth, breed.adultAgeInMounth, breed.seniorAgeInMounth)
      return ageInMonth < breed.adultAgeInMonth ? dogLifeStage.puppy : ageInMonth < breed.seniorAgeInMonth ? dogLifeStage.adult : dogLifeStage.senior;
    } else {
      console.log("no Breed found!", breedName.replace(/\(/g, '\\(').replace(/\)/g, '\\)'))
      return dogLifeStage.adult;
    }
  }

  async checkAndUpdateDogLifeStage(dogId: string): Promise<void> {
    const dog = await this.findDogById(String(dogId));
    if (!this.subscriptionRepo) {
      throw new Error("Subscription repository not configured for DogMongoRepository");
    }
    const subscriptionMongoRepo = this.subscriptionRepo as unknown as SubscriptionMongoRepository;
    const subscriptionCollection = (subscriptionMongoRepo as any).subscriptionCollection;
    if (dog) {
      const priceModel = await this.priceModelCollection.findOne({ dog: new ObjectId(dogId) });
      if (priceModel) {
        const lastLifeStage = priceModel.dogLifeStage;
        const currentLifeStage = await this.calculateDogLifeStage(dog.age, dog.breed);
        if (lastLifeStage == currentLifeStage) {
          return;
        } else {
          const dogPrice = await subscriptionMongoRepo.createDogDailyPrice(dog, priceModel.priceVersion)
          const dailyPrice = subscriptionMongoRepo.subscriptionPriceCalculator({ ...dog.subscription as Subscription, dogPrice: dogPrice ?? 0 });
          await this.dogCollection.updateOne({ _id: new ObjectId(dog.id) }, { $set: { subscription: { ...dog.subscription as Subscription, dogPrice: dogPrice, dailyPrice: dailyPrice } } });
          await subscriptionCollection.updateOne({ dog: new ObjectId(dog.id) }, { $set: { dailyPrice: dailyPrice } });
        }
      } else {
        console.log("no priceModel found!", dogId)
      }

    } else {
      console.log("no Dog found!", dogId)
    }
  }

}
