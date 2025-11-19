import { RecipeRepository } from '../RecipeRepository';
import { Dog, gender, Ingredient, protein, Recipe, RecipeIngredient, shape, Subscription, User, } from 'c-lib';
import { Collection, Db, ObjectId } from "mongodb";
import { fromMongo, mongoObj, toMongo } from "@utils/mongoUtils";
import axios from 'axios';
import { SubscriptionMongoRepository, SubscriptionRepository } from '@auth/repositories/subscriptionRepository';
import { DogMongoRepository, DogRepository } from '@auth/repositories/dogRepository';
const apikey = 'AF0hMb2j1mxyrXjhRKy4wRKu77iYdthDMFAVz5gEBebfhGniKeN4EK59XbKYG76xzA7T82iz9dZxyTwqwPE2H0AHEQziLI12dT3b'; //TODO env 

export class RecipeMongoRepository extends RecipeRepository {
  private recipeCollection: Collection;
  private ingredientCollection: Collection;
  private subscriptionRepo?: SubscriptionRepository;
  private dogRepo: DogRepository;
  constructor(db: Db, recipeCollectionName: string, ingredientCollectionName: string, dogRepo: DogRepository, subscriptionRepo?: SubscriptionRepository) {
    super();
    this.recipeCollection = db.collection(recipeCollectionName);
    this.ingredientCollection = db.collection(ingredientCollectionName);
    this.dogRepo = dogRepo;
    this.subscriptionRepo = subscriptionRepo;
  }

  setSubscriptionRepository(subscriptionRepo: SubscriptionRepository) {
    this.subscriptionRepo = subscriptionRepo;
  }

  async findRecipeById(id: Recipe["id"]): Promise<Recipe> {
    const mongoRecipe = await this.recipeCollection.findOne({ _id: new ObjectId(id) });
    if (mongoRecipe) {
      return fromMongo(mongoRecipe as unknown as mongoObj<Recipe>);
    }
    const defaultRecipe = await this.recipeCollection.findOne({});
    return fromMongo(defaultRecipe as unknown as mongoObj<Recipe>);

  }

  async addRecipe(recipe: Recipe): Promise<Recipe> {
    // Remove _id and id to avoid inserting undefined values
    const { _id, id, ...rest } = recipe as any;
    let inserted = await this.recipeCollection.insertOne(toMongo(rest));
    let newRecipe = await this.recipeCollection.findOne({ _id: inserted.insertedId });
    if (!newRecipe) {
      throw new Error("Failed to retrieve the newly inserted recipe.");
    }
    (newRecipe as any).id = inserted.insertedId;
    return newRecipe as unknown as Recipe
  }

  getApiDog(dog: Dog) {
    // console.log("getApiDog dog", dog)
    let breed = (dog.breed == 'Mutt (up to 20 lbs)' || dog.breed == 'Mutt (21 To 50 Lbs)' || dog.breed == 'Mutt (51 to 100 lbs)' || dog.breed == 'Mutt (Over 100 lbs)') ?
      'Mutt' :
      (dog.breed == 'Unknown/Other (up to 20 lbs)' || dog.breed == 'Unknown/Other (21 to 50 lbs)' || dog.breed == 'Unknown/Other (51 to 100 lbs)' || dog.breed == 'Unknown/Other (Over 100 lbs)') ?
        'Unknown/Other' :
        dog.breed
    let apiDog = {} as any;
    apiDog.activity = this.activityLevelToClient(dog.activityLevel);
    apiDog.ageInMonth = ((new Date()).getTime() - new Date(dog.age).getTime()) / (1000 * 60 * 60 * 24 * 30);
    // apiDog.weight = Math.floor(dog.weight * 0.453592 * 10) / 10; //to KG
    apiDog.weight = Math.floor(12 * 0.453592 * 10) / 10; //to KG
    apiDog.breed = breed;
    apiDog.sizeOfBreed = "small";
    apiDog.bodySize = this.shapeToClient(dog.shape);
    apiDog.gender = dog.gender === gender.male ? "male" : "female";
    if (dog.name) { apiDog.name = dog.name };
    apiDog.castrated = dog.isNeutered;
    apiDog.pregnant = dog.isPregnant;
    apiDog.secondHalfOfPregnancy = false;
    apiDog.lactating = dog.isNursing;
    apiDog.numberOfPuppies = dog.nursingPuppies || 0;
    return apiDog
  }
  activityLevelToClient = (activityLevel: string) => {
    if (activityLevel === 'High') {
      return 'High activity'
    } else if (activityLevel === 'Normal') {
      return 'Normal activity'
    } else if (activityLevel === 'Low') {
      return 'Low activity'
    }
    return 'Low activity'
  }

  shapeToClient = (tShape: string) => {
    if (tShape === shape.underweight) {
      return 'underweight'
    } else if (tShape === shape.fit) {
      return 'fit'
    } else if (tShape === shape.overweight) {
      return 'overweight'
    }
    return 'overweight'
  }

  calculateProteinFromRecipeId = (recipeId: number): protein => {
    if (recipeId == 1) {
      return protein.beef
    } else if (recipeId == 2) {
      return protein.chicken
    } else if (recipeId == 3) {
      return protein.salmon
    } else {
      return protein.salmon
      // return protein.turkey
    }
  }

  getAPIRecipe(dog: Dog, selectedRecipe: number): Promise<Recipe> | Promise<never> {
    let apiDog = this.getApiDog(dog);
    console.log("getRecipe apiDog", apiDog, dog)
    let dogId = (dog as any)._id
    return new Promise(async (resolve, reject) => {
      apiDog.selectedRecipe = selectedRecipe;
      let requestOptions = {
        method: 'post',
        url: 'https://app.naturalnourishing.com/api/v2/get-recipe',
        // url: 'https://test-aws.dr-hachiko.com/api/v2/get-recipe',
        data: apiDog,
        headers: { "X-Api-Key": apikey }
      }
      let apiRecipe = await axios(requestOptions)
      console.log("getAPIRecipe", selectedRecipe, apiRecipe.data)
      let ings = []
      for (let i = 0; i < apiRecipe.data.recipe.length; i++) {
        let tempIng = await this.getIngredientByApiName(apiRecipe.data.recipe[i].ingredientName)
        console.log("tempIng", tempIng)
        if (tempIng != null) {
          let finalIngredient: RecipeIngredient = {
            ingredient: tempIng.name,
            amount: apiRecipe.data.recipe[i].dailyGram
          };
          ings.push(finalIngredient)
        } else {
          console.log("ing not found", apiRecipe.data.recipe[i].ingredientName)
        }
      }
      let protein = this.calculateProteinFromRecipeId(selectedRecipe)
      console.log("getAPIRecipe ings", selectedRecipe, ings)
      let finalRecipe: Recipe = {
        id: '',
        protein: protein,
        dog: dogId,
        owner: dog.owner,
        ingredients: ings,
        digestibleProtein: apiRecipe.data.additionalInfo['Digestible protein (%)'],
        crudeProtein: apiRecipe.data.additionalInfo['Crude protein (%)'],
        metabolizableEnergy: apiRecipe.data.additionalInfo['Metabolizable Energy Mj/kg'],
        ME: apiRecipe.data.additionalInfo['ME Kcal/kg'],
        fiber: apiRecipe.data.additionalInfo['Fiber'],
        fat: apiRecipe.data.additionalInfo['Fat '],
        weight: apiRecipe.data.recipe.reduce((accumulator: { dailyGram: string; }, ingredient: { dailyGram: string; }) => {
          return { 'dailyGram': parseFloat(accumulator.dailyGram) + parseFloat(ingredient.dailyGram) };
        }).dailyGram / 1000, //returns the total sum of ingredients to KG
        calorie: 0,
        recipeDog: dog
      };
      finalRecipe.calorie = finalRecipe.ME * finalRecipe.weight;
      // console.log("getAPIRecipe calorie", selectedRecipe, finalRecipe.calorie)
      console.log("getAPIRecipefinalRecipe ", selectedRecipe, finalRecipe)
      return resolve(finalRecipe);
    })
  }

  async getIngredientByApiName(apiName: Ingredient["apiName"]): Promise<Ingredient | null> {
    const _ingredient = await this.ingredientCollection.findOne({ apiName: apiName });
    if (_ingredient) {
      return fromMongo((_ingredient as unknown as mongoObj<Ingredient>));
    } else {
      return null;
    }
  }

  async generateRecipes(dog: Dog): Promise<Recipe[]> {
    let res: Recipe[] = []
    for (let i = 1; i < 4; i++) {
      let apiRecipe = await this.getAPIRecipe(dog, i)
      let recipe = await this.addRecipe(apiRecipe)
      console.log("hhhh")
      res.push(recipe)
    }
    return res
  }

  async findRecipesByUserId(userId: User['id']): Promise<Recipe[]> {
    // Support both legacy string owner ids and ObjectId-based owner refs
    const filter = ObjectId.isValid(userId as any)
      ? { owner: { $in: [userId as any, new ObjectId(userId as any)] } }
      : { owner: userId };
    const cursor = this.recipeCollection.find(filter as any);
    const list = await cursor.toArray();
    return list as unknown as Recipe[];
  }

  async updateDogRecipes(dog: Dog, versionNumber: number): Promise<{ success: boolean, error?: string }> {
    let apiResult = await this.generateRecipes(dog)
    // console.log("updateDogRecipes2", dog.recipes)
    const recipeIds = []
    for (const recipe of apiResult) {
      let r = toMongo(recipe)
      // `_id` is immutable; ensure it never reaches the update payload
      if ("_id" in r) {
        delete (r as any)._id;
      }
      console.log("AAA4")
      console.log(r)
      const result = await this.recipeCollection.findOneAndUpdate(
        { protein: recipe.protein, dog: recipe.dog, owner: recipe.owner },
        { $set: r },
        { returnDocument: "after", upsert: true }
      );
      // console.log("recipeId", result)
      // The _id is located at result.value?._id after MongoDB update
      // Filter out undefined ids to satisfy string[] type
      recipeIds.push(result?.value?._id?.toString());
    }
    dog.recipes = recipeIds.filter((id): id is string => typeof id === 'string');
    // console.log("updateDogRecipes2", dog.recipes)
    if (!this.subscriptionRepo) {
      throw new Error("Subscription repository not configured for RecipeMongoRepository");
    }
    const subscriptionMongoRepo = this.subscriptionRepo as unknown as SubscriptionMongoRepository;
    const dogMongoRepo = this.dogRepo as unknown as DogMongoRepository;
    const dogCollection = (dogMongoRepo as any).dogCollection;
    const subscriptionCollection = (subscriptionMongoRepo as any).subscriptionCollection;
    const dogPrice = await subscriptionMongoRepo.createDogDailyPrice(dog, versionNumber)

    // let dogPrice = apiResult.recipes[0][0].dogPrice
    // versionNumber = apiResult.recipes[0][0].priceVersion
    // console.log("updateDogRecipes: ", dogPrice, subscription)
    const dailyPrice = subscriptionMongoRepo.subscriptionPriceCalculator({ ...(dog.subscription as Subscription), dogPrice: dogPrice ?? 0 });
    await dogCollection.findOneAndUpdate({ _id: new ObjectId(dog.id) }, {
      $set: {
        subscription: {
          priceVersion: versionNumber,
          dailyPrice: dailyPrice,
          recurring: (dog.subscription as Subscription).recurring,
          info: (dog.subscription as Subscription).info,
          selectedRecipes: (dog.subscription as Subscription).selectedRecipes,
          type: (dog.subscription as Subscription).type,
          dogPrice: dogPrice,
        }
      }
    })
    await subscriptionCollection.findOneAndUpdate({ dog: new ObjectId(dog.id) }, { $set: { dailyPrice: dailyPrice, priceVersion: versionNumber } })
    return { success: true };
  }

}
