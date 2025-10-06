import { SubscriptionRepository } from '../SubscriptionRepository';
import { Dog, dogLifeStage, gender, PatternInfo, protein, Recipe, recurringType, shape, Subscription, subscriptionStatus, subscriptionType, User, } from 'c-lib';
import { Collection, Db, ObjectId } from "mongodb";
import { toMongo } from "@utils/mongoUtils";
import { BreedRepository } from 'src/breeds/repositories';
import axios from 'axios';
import { RecipeRepository } from '@auth/repositories/recipeRepository';
import { DogRepository } from '@auth/repositories/dogRepository';

export class SubscriptionMongoRepository extends SubscriptionRepository {
  private subscriptionCollection: Collection;
  private priceVersionCollection: Collection;
  private calorieRangeCollection: Collection;
  private calorieRangePriceCollection: Collection;
  private growthPatternCollection: Collection;
  private priceModelCollection: Collection;
  private breedRepo: BreedRepository;
  private recipeRepo: RecipeRepository;
  private dogRepo: DogRepository;

  constructor(db: Db, subscriptionCollectionName: string, priceVersionCollectionName: string, calorieRangeCollectionName: string, calorieRangePriceCollectionName: string, growthPatternCollectionName: string, priceModelCollectionName: string, breedRepo: BreedRepository, recipeRepo: RecipeRepository, dogRepo: DogRepository) {
    super();
    this.subscriptionCollection = db.collection(subscriptionCollectionName);
    this.priceVersionCollection = db.collection(priceVersionCollectionName);
    this.calorieRangeCollection = db.collection(calorieRangeCollectionName);
    this.calorieRangePriceCollection = db.collection(calorieRangePriceCollectionName);
    this.growthPatternCollection = db.collection(growthPatternCollectionName);
    this.priceModelCollection = db.collection(priceModelCollectionName);
    this.breedRepo = breedRepo;
    this.recipeRepo = recipeRepo;
    this.dogRepo = dogRepo;
  }

  shippingPrice = 20;

  async addSubscription(subscription: Subscription): Promise<Subscription> {
    console.log("addSubscription")
    // Ensure the subscription has a valid id before calling toMongo
    if (!subscription.id) {
      subscription.id = new ObjectId().toString();
    }
    let inserted = await this.subscriptionCollection.insertOne(toMongo(subscription));
    const newSubscription = await this.subscriptionCollection.findOne({ _id: inserted.insertedId })
    return newSubscription as unknown as Subscription
  }

  async generateSubscription(subscription: Subscription): Promise<Subscription> {
    console.log("generateSubscription mongo")
    const priceVersion = await this.priceVersionCalculator();
    console.log("generateSubscription priceVersion", priceVersion)
    const dog = await this.dogRepo.findDogById(subscription.dog);
    if (!dog) {
      throw new Error(`Dog not found for id: ${subscription.dog}`);
    }
    const dogPrice = await this.createDogDailyPrice(dog, priceVersion);
    const recurring = this.recurringCalculator(dog, subscription);
    let tempRecipes: Recipe[]
    tempRecipes = [];
    for (let i = 0; i < dog.recipes.length; i++) {
      let recipe = await this.recipeRepo.findRecipeById(dog.recipes[i]);
      tempRecipes.push(recipe);
    }
    subscription['info'] = this.amountCalculator(tempRecipes, subscription.selectedRecipes, recurring);
    subscription['recurring'] = recurring;
    subscription['dailyPrice'] = this.subscriptionPriceCalculator(subscription);
    subscription['dogPrice'] = dogPrice ?? 0;
    subscription['priceVersion'] = (priceVersion ?? 0).toString();
    subscription['status'] = subscriptionStatus.trialing
    let res: Subscription = subscription;
    await this.addSubscription(subscription)
    return res;
  }

  subscriptionPriceCalculator(subscription: Subscription): number {
    let coef = 1;
    if (subscription.type === subscriptionType.full) {
      coef = 1;
    } else if (subscription.type === subscriptionType.half) {
      coef = .6;
    } else if (subscription.type === subscriptionType.topper) {
      coef = .3;
    }
    // let discount = subscription.discount ? subscription.discount : 0
    let dailyPrice = (subscription.dogPrice * coef + this.shippingPrice / subscription.recurring)
    console.log("subscriptionPriceCalculator dailyPrice: ", dailyPrice, coef, subscription)
    return dailyPrice
  }

  amountCalculator(recipes: Recipe[], selectedRecipes: protein[], recurring: number): { recipeId: Recipe["id"], amount: number }[] {
    let priority = {
      1: 2, //beef
      2: 3, //chicken
      3: 1 //salmon
    }

    let selectedRecipesByPriority = selectedRecipes.map((r) => {
      let c = this.calculateRecipeIdFromProtein(r);
      return priority[c as keyof typeof priority];
    });
    console.log("amountCalculator 1 ", selectedRecipesByPriority, selectedRecipes)

    let normalizeDif = Math.min(...selectedRecipesByPriority) - 1;
    selectedRecipesByPriority = selectedRecipesByPriority.map(r => {
      return (r - normalizeDif);
    })
    console.log("amountCalculator 2 ", normalizeDif, selectedRecipesByPriority)


    return recipes.map(recipe => {
      let amount = 0;
      console.log(recipe.protein, selectedRecipes.includes(recipe.protein))
      if (selectedRecipes.includes(recipe.protein)) {
        let dif = recurring % (selectedRecipes.length);
        let t = recurring / (selectedRecipes.length);
        let p = selectedRecipesByPriority[selectedRecipes.indexOf(recipe.protein)];
        console.log(recipe.protein, dif, t, p)
        if (dif >= p) {
          amount = Math.floor(t) + 1;
        } else {
          amount = Math.floor(t);
        }
      }
      return { recipeId: recipe.id, amount: amount };
    });
  }

  recurringCalculator(dog: Dog, subscription: Subscription): number {
    if (subscription) {
      if (subscription.recurringType == recurringType.manual) {
        return subscription.recurring
      }
    } if (dog.calorie) {

      if (dog.calorie <= 200) {
        return 4 * 7;
      } else if (dog.calorie >= 200 && dog.calorie <= 350) {
        return 4 * 7;
      } else if (dog.calorie >= 350 && dog.calorie <= 500) {
        return 4 * 7;
      } else if (dog.calorie >= 500 && dog.calorie <= 750) {
        return 4 * 7;
      } else if (dog.calorie >= 750 && dog.calorie <= 1100) {
        return 4 * 7;
      } else if (dog.calorie >= 1100 && dog.calorie <= 2000) {
        return 2 * 7;
      } else if (dog.calorie >= 2000 && dog.calorie <= 5000) {
        return 1 * 7;
      } else {
        return 1 * 7;
      }
    } else {
      return 1 * 7;
    }

  }

  async recipePriceCalculator(recipeId: number, calorie: number, versionNumber: number): Promise<number> {
    // 1:beef, 2:chicken, 3:salmon from Recipe Schema
    // console.log("recipePriceCalculator", recipeId, calorie, versionNumber, breeder)
    try {
      let priceVersion = await this.priceVersionCollection.findOne({ versionNumber: versionNumber })
      let calorieRange = await this.calorieRangeCollection.findOne({ max: { $gte: calorie - 1 }, min: { $lte: calorie } })
      let calorieRangePrice = await this.calorieRangePriceCollection.findOne({ calorieRange: calorieRange!._id, versionNumber: versionNumber, _id: { $in: priceVersion!.prices } })
      let price = recipeId == 1 ? calorieRangePrice!.beefPrice : recipeId == 2 ? calorieRangePrice!.chikenPrice : recipeId == 3 ? calorieRangePrice!.salmonPrice : 0
      // console.log("calculated1: ", price * calorie, recipeId, calorie, versionNumber)
      return price * calorie;
    } catch (e) {
      console.log("error calculating price recipePriceCalculatorWithVersionNumber", recipeId, calorie, versionNumber, e)
      return 0
    }
  }

  async priceVersionCalculator(versionNumber?: number, breeder?: boolean): Promise<number> {
    let priceVersion;
    try {
      if (versionNumber) {
        priceVersion = await this.priceVersionCollection.findOne({ versionNumber: versionNumber })
      } else if (breeder) {
        priceVersion = await this.priceVersionCollection.findOne({ versionNumber: 3 })
      } else {
        priceVersion = await this.priceVersionCollection.findOne({ isActive: true })
      }
      return priceVersion!.versionNumber;
    } catch (e) {
      console.log("error calculating price version", versionNumber, breeder, priceVersion, e)
      return 0
    }
  }

  getMonthCoefFromPatternInfo(patternInfo: PatternInfo[], month: number): number {
    // console.log("getMonthCoefFromPatternInfo", month)
    let tempMonth = 0
    if (month > 0 && month < 18) {
      tempMonth = month
    } else if (month > 18) {
      tempMonth = 18
    } else {
      console.log("error calculating growth coef", month, patternInfo)
      return 0
    }
    const coef = patternInfo.filter(p => p.month == tempMonth)[0].coef
    // console.log("coef", coef)
    return coef
  }

  ageTopper(ageInMonth: number): number {
    if (ageInMonth >= 3 && ageInMonth < 3.5) {
      return 3.5;
    } else if (ageInMonth >= 3.5 && ageInMonth < 4) {
      return 4
    } else {
      return parseInt(ageInMonth.toString()) + 1
    }
  }

  ageCutter(ageInMonth: number): number {
    if (ageInMonth >= 3 && ageInMonth < 3.5) {
      return 3;
    } else if (ageInMonth >= 3.5 && ageInMonth < 4) {
      return 3.5
    } else {
      return parseInt(ageInMonth.toString())
    }
  }

  async newWeightPredictor(dog: Dog, predictDate: Date): Promise<number | undefined> {
    // console.log("newWeightPredictor1", predictDate)
    let breed = await this.breedRepo.getBreedByName(dog.breed.replace(/\(/g, '\\('))
    if (breed) {
      let avgAdultWeight = (dog.gender === gender.male) ? breed.breedInfo.male.weight.avg : breed.breedInfo.female.weight.avg;
      // console.log("newWeightPredictor2", avgAdultWeight)
      let growthPattern;
      if (avgAdultWeight > 132) {
        growthPattern = await this.growthPatternCollection.findOne({ minWeight: { $lt: avgAdultWeight } })
      } else {
        growthPattern = await this.growthPatternCollection.findOne({ minWeight: { $lt: avgAdultWeight }, maxWeight: { $gte: avgAdultWeight } })
      }
      if (growthPattern) {
        // console.log("newWeightPredictor3", growthPattern.name, mongoose.Types.ObjectId(dog._id))
        // let weight = await Weight.findOne({ dog: mongoose.Types.ObjectId(dog._id) }, {}, { sort: { 'createdAt': -1 } })
        let weight = 12
        // console.log("newWeightPredictor4", dog._id, weight)
        let weightlogTime
        if (weight) {
          weightlogTime = new Date().getTime()
          // weightlogTime = weight.createdAt.getTime()
        } else {
          // console.log("no weight found", dog._id)
          weightlogTime = new Date().getTime()
        }
        // console.log("newWeightPredictor5", weightlogTime)
        // if ((wightlogTime - predictDate.getTime()) / (1000 * 60 * 60 * 24) < 28) {
        //     return dog.weight;
        // } else {

        let ageInMonth = (weightlogTime - new Date(dog.age).getTime()) / (1000 * 60 * 60 * 24 * 30);

        let predictAgeInMonth = (new Date(predictDate).getTime() - new Date(dog.age).getTime()) / (1000 * 60 * 60 * 24 * 30);
        // console.log("newWeightPredictor", ageInMonth, predictAgeInMonth)

        let coefNow = this.getMonthCoefFromPatternInfo(growthPattern.patternInfo, this.ageTopper(ageInMonth)) * ((ageInMonth - this.ageCutter(ageInMonth)) / (this.ageTopper(ageInMonth) - this.ageCutter(ageInMonth)))
          + this.getMonthCoefFromPatternInfo(growthPattern.patternInfo, this.ageCutter(ageInMonth)) * ((this.ageTopper(ageInMonth) - ageInMonth) / (this.ageTopper(ageInMonth) - this.ageCutter(ageInMonth)));

        let adultWeight = dog.weight / (coefNow / 100);

        let coefPredict = this.getMonthCoefFromPatternInfo(growthPattern.patternInfo, this.ageTopper(predictAgeInMonth)) * ((predictAgeInMonth - this.ageCutter(predictAgeInMonth)) / (this.ageTopper(predictAgeInMonth) - this.ageCutter(predictAgeInMonth)))
          + this.getMonthCoefFromPatternInfo(growthPattern.patternInfo, this.ageCutter(predictAgeInMonth)) * ((this.ageTopper(predictAgeInMonth) - predictAgeInMonth) / (this.ageTopper(predictAgeInMonth) - this.ageCutter(predictAgeInMonth)));

        let predictedWeight = adultWeight * (coefPredict / 100)
        // console.log("predictedWeight", predictedWeight)
        return predictedWeight;
        // }
      } else {
        console.log("no Growth Pattern found!", avgAdultWeight)
        return 0
      }
    } else {
      console.log("no Breed found!", dog.breed)
      return 0
    }
  }

  async calculateDogLifeStage(age: Date, breedName: string): Promise<dogLifeStage> {
    // console.log("calculateDogLifeStage", age, breedName)
    let breed = await this.breedRepo.getBreedByName(breedName.replace(/\(/g, '\\('))
    if (breed) {
      let ageInMonth = (new Date().getTime() - new Date(age).getTime()) / (1000 * 60 * 60 * 24 * 30);
      // console.log("breed", breed, ageInMonth, breed.adultAgeInMounth, breed.seniorAgeInMounth)
      return ageInMonth < breed.adultAgeInMonth ? dogLifeStage.puppy : ageInMonth < breed.seniorAgeInMonth ? dogLifeStage.adult : dogLifeStage.senior
    } else {
      console.log("no Breed found!", breedName.replace(/\(/g, '\\(').replace(/\)/g, '\\)'))
      return dogLifeStage.adult
    }
  }

  async weightGenerator(dog: Dog): Promise<{ month: number, weight: number }[]> {
    const months = [3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const weights: { month: number, weight: number }[] = [];
    for (let i = 0; i < months.length; i++) {
      const age = new Date(new Date(dog.age).getTime() + (1000 * 60 * 60 * 24 * 30 * months[i]));
      // console.log("weightGenerator1", months[i], age)
      let predicted = await this.newWeightPredictor(dog, age);
      // console.log("weightGenerator2", predicted)
      if (typeof predicted === "number") {
        weights.push({ month: months[i], weight: predicted });
      }
      // console.log("weights", weights)
    }

    return weights;
  }

  activityLevelToClient = (activityLevel: string) => {
    if (activityLevel === 'High') {
      return 'High activity'
    } else if (activityLevel === 'Normal') {
      return 'Normal activity'
    } else if (activityLevel === 'Low') {
      return 'Low activity'
    }
    return 'low'
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

  async getRecipeForMostExpensiveRecipeId(dog: Dog): Promise<Recipe> {
    // console.log("getRecipeForMostExpensiveRecipeId dog", dog)
    let apikey = 'AF0hMb2j1mxyrXjhRKy4wRKu77iYdthDMFAVz5gEBebfhGniKeN4EK59XbKYG76xzA7T82iz9dZxyTwqwPE2H0AHEQziLI12dT3b';

    let apiDog = this.getApiDog(dog);
    // console.log("getRecipeForMostExpensiveRecipeId apiDog", apiDog)
    return new Promise((resolve, reject) => {
      let result = [];
      let i = 3;
      apiDog.selectedRecipe = i;
      let requestOptions = {
        method: 'post',
        url: 'https://app.naturalnourishing.com/api/v2/get-recipe',
        // url: 'https://test-aws.dr-hachiko.com/api/v2/get-recipe',
        data: apiDog,
        headers: { "X-Api-Key": apikey }
      }
      result.push(axios(requestOptions)
        .then(response => {
          if (response.data.success != undefined && response.data.success.toString() === "false") { throw { req: requestOptions, res: response.data, recipeId: i } }
          return { dog: apiDog, recipeId: i, data: response.data };
        }))

      Promise.all(result)
        .then(responses => {
          // Only return the first (and only) recipe object, not an array
          // Map the API response to a Recipe object to satisfy the type
          const apiResponse = responses[0];
          // You may need to adjust the mapping below to match your Recipe type
          const recipe: Recipe = {
            id: "",
            dog: apiResponse.dog,
            owner: '',
            // Add all required Recipe fields here, mapping from apiResponse.data as needed
            // Example:
            protein: apiResponse.data.protein,
            ingredients: apiResponse.data.ingredients,
            digestibleProtein: apiResponse.data.digestibleProtein,
            ME: apiResponse.data.ME,
            weight: apiResponse.data.weight,
            calorie: apiResponse.data.calorie,
            recipeDog: apiResponse.data.recipeDog,
            crudeProtein: apiResponse.data.crudeProtein,
            metabolizableEnergy: apiResponse.data.metabolizableEnergy,
            fiber: apiResponse.data.fiber,
            fat: apiResponse.data.fat
          };
          resolve(recipe);
        })
        .catch(err => {
          console.log('api error', dog.name, JSON.stringify(err, null, 2))
          reject(err);
        })
    })
  }

  async popyPriceRecipeCalculator(dog: Dog): Promise<{ recipe: Recipe, age: number, dogWeight: number }[]> {

    // console.log("popyPriceCalculator: ", dog)
    let weights = await this.weightGenerator(dog);
    // console.log("popyPriceCalculator  weights: ", weights)
    let testDogs = weights.map(w => {
      let d = Object.assign({}, { ...dog, ageInMonth: w.month, castrated: dog.isNeutered });
      // d.weight = Math.floor(w.weight * 0.453592 * 10) / 10;
      d.weight = w.weight;
      // d.ageInMonth = w.month;
      if (w.month > 5) {
        d.isNeutered = true;
      }
      return d;
    });
    let promises = testDogs.map(async d => {
      return { res: await this.getRecipeForMostExpensiveRecipeId(d), dog: d }
    })
    let recipes = await Promise.all(promises);
    recipes = recipes.flat();

    let tempRecipes = recipes.map(async recipe => {
      let finalRecipe: Recipe = {
        id: '',
        protein: protein.beef,
        dog: '',
        owner: '',
        ingredients: [],
        digestibleProtein: 0,
        crudeProtein: 0,
        metabolizableEnergy: 0,
        ME: 0,
        fiber: '',
        fat: '',
        weight: 0,
        calorie: 0
      };
      // Fix: Add type annotations and avoid implicit any, and fix indexing error
      const res0 = (Array.isArray(recipe.res) ? recipe.res[0] : undefined) as any;
      if (res0 && res0.data && res0.data.additionalInfo && res0.data.recipe) {
        finalRecipe.ME = res0.data.additionalInfo['ME Kcal/kg'];
        finalRecipe.weight = (res0.data.recipe as Array<{ dailyGram: number | string }>).reduce(
          (accumulator: number, ingredient: { dailyGram: number | string }) => {
            return accumulator + parseFloat(ingredient.dailyGram as string);
          },
          0
        ) / 1000; // returns the total sum of ingredients to KG
        finalRecipe.calorie = finalRecipe.ME * finalRecipe.weight;
      } else {
        finalRecipe.ME = 0;
        finalRecipe.weight = 0;
        finalRecipe.calorie = 0;
      }
      // Safely extract ageInMonth and dog weight, avoid type errors
      const dogAgeInMonth = (() => {
        if (Array.isArray(recipe.res) && recipe.res[0] && recipe.res[0].dog && typeof recipe.res[0].dog.ageInMonth !== 'undefined') {
          return recipe.res[0].dog.ageInMonth;
        }
        return undefined;
      })();

      return {
        ...finalRecipe,
        age: dogAgeInMonth,
        dogWeight: recipe.dog && typeof recipe.dog.weight !== 'undefined' ? recipe.dog.weight : undefined
      };
    })
    let result = await Promise.all(tempRecipes);
    // console.log("popyPriceCalculator 4: ", recipes)

    // if we wanted to add to recipe
    // Recipe.updateMany({owner: mongoose.Types.ObjectId(user._id)}, {isActive: false}).catch(console.log);
    // Recipe.create(recipes[i])
    // }

    // The result array does not match the expected return type: { recipe: Recipe; age: number; dogWeight: number; }[]
    // Instead, it returns objects with properties spread from finalRecipe, plus age and dogWeight, but not under a 'recipe' key.
    // To fix, wrap finalRecipe under 'recipe', and ensure age and dogWeight are present as top-level properties.
    return result.map(r => ({
      recipe: {
        id: r.id,
        protein: r.protein,
        dog: r.dog,
        owner: r.owner,
        ingredients: r.ingredients,
        digestibleProtein: r.digestibleProtein,
        crudeProtein: r.crudeProtein,
        metabolizableEnergy: r.metabolizableEnergy,
        ME: r.ME,
        fiber: r.fiber,
        fat: r.fat,
        weight: r.weight,
        calorie: r.calorie,
        recipeDog: r.recipeDog
      },
      age: Number(r.age ?? 0),
      dogWeight: Number(r.dogWeight ?? 0)
    }));
  }

  calculateRecipeIdFromProtein = (p: protein) => {
    if (p == protein.beef) {
      return 3
    } else if (p == protein.chicken) {
      return 2
    } else if (p == protein.salmon) {
      return 1
    } else if (p == protein.turkey) {
      return 4
    } else {
      return 3
    }
  }

  async createDogDailyPrice(dog: Dog, priceVersion: number): Promise<number | undefined> {
    console.log("createDogDailyPrice", dog, priceVersion)
    let dogPrice = 0;
    // let weight = await Weight.findOne({ dog: dog._id }).lean();
    let weight = 12;
    let predictedWeight = weight ? await this.newWeightPredictor(dog, new Date()) : dog.weight
    // let predictedWeight = (weight && (weight.createdAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) > 28) ? await newWeightPredictor(dog, new Date()) : dog.weight
    // let ageInMonth = (new Date().getTime() - new Date(dog.age).getTime()) / (1000 * 60 * 60 * 24 * 30);
    // dog.ageInMonth = ageInMonth
    // console.log("createDogDailyPrice, ageInMonth", ageInMonth, predictedWeight)
    let puppyPriceInfo: { predictedWeight: number, calculatedCalorie: number, ageInMonth: number }[] = [];
    let lifeStage = await this.calculateDogLifeStage(dog.age, dog.breed)
    if (lifeStage == dogLifeStage.puppy && !dog.isPregnant) {
      // let tempDog = { ...dog, weight: predictedWeight }
      // console.log("popyPriceRecipeCalculator input ", tempDog)
      let calculatedRecipes = await this.popyPriceRecipeCalculator(dog);
      // console.log("calculatedRecipes: ", calculatedRecipes.recipes)
      let totalPrice = 0
      for (let i = 0; i < calculatedRecipes.length; i++) {
        let recipe = calculatedRecipes[i]
        let recipePrice = await this.recipePriceCalculator(3, recipe.recipe.calorie, priceVersion)
        totalPrice += recipePrice
        puppyPriceInfo.push({ predictedWeight: recipe.dogWeight, calculatedCalorie: recipe.recipe.calorie, ageInMonth: recipe.age })
      }
      dogPrice = totalPrice / calculatedRecipes.length

    } else {
      dogPrice = 0;//AVERAGE price of 3 recipes.
      let validRecipeCount = 0;
      for (const recipe of dog.recipes) {
        let tempRecipe = await this.recipeRepo.findRecipeById(recipe);
        if (tempRecipe && typeof tempRecipe.price === 'number') {
          dogPrice += tempRecipe.price;
          validRecipeCount++;
        } else {
          let recipePrice = await this.recipePriceCalculator(this.calculateRecipeIdFromProtein(tempRecipe.protein), tempRecipe.calorie, priceVersion)
          dogPrice += recipePrice;
          validRecipeCount++;
        }
      }
      dogPrice = validRecipeCount > 0 ? dogPrice / validRecipeCount : 0;
    }
    // console.log("price model inputs", dogLifeStage, dogPrice, puppyPriceInfo)
    await this.priceModelCollection.insertOne(
      {
        dog: dog.id,
        dogLifeStage: lifeStage,
        dogWeight: dog.weight,
        // weightLog: weight ? weight.id : null,
        predictedWeight: predictedWeight,
        breed: dog.breed,
        age: dog.age,
        gender: dog.gender,
        isNeutered: dog.isNeutered,
        isPregnant: dog.isPregnant,
        pregnancyDuration: dog.pregnancyDuration,
        isNursing: dog.isNursing,
        nursingPuppies: dog.nursingPuppies,
        activityLevel: dog.activityLevel,
        shape: dog.shape,
        calorie: dog.calorie,
        puppyPriceInfo: lifeStage == dogLifeStage.puppy ? puppyPriceInfo : null,
        priceVersion: priceVersion,
        calculatedDogDailyPrice: dogPrice,
      }
    )
    return (dogPrice);
  }

  async findSubscriptionsByUserId(userId: User['id']): Promise<Subscription[]> {
    // Support both legacy string owner ids and ObjectId-based owner refs
    const filter = ObjectId.isValid(userId as any)
      ? { userId: { $in: [userId as any, new ObjectId(userId as any)] } }
      : { userId: userId };
    const cursor = this.subscriptionCollection.find(filter as any);
    const list = await cursor.toArray();
    return list as unknown as Subscription[];
  }

  // async checkAndupdateDogLifeStage(dogId:string) => {
  //   let dog = await Dog.findById(dogId)
  //   if (dog) {
  //     let priceModel = await PriceModel.findOne({ dog: dogId })
  //     if (priceModel) {
  //       let lastLifeStage = priceModel.dogLifeStage
  //       let currentLifeStage = await calculateDogLifeStage(dog.age, dog.breed)
  //       if (lastLifeStage == currentLifeStage) {
  //         return
  //       } else {
  //         let apiResult = await generateRecipes([dog], dog.owner, priceModel.priceVersion);
  //         let recipeIds = []
  //         for (const recipe of apiResult.recipes[0]) {
  //           let recipeId = await Recipe.findOneAndUpdate({ recipeId: recipe.recipeId, dog: recipe.dog, owner: recipe.owner }, { $set: recipe })
  //           recipeIds.push(recipeId._id)
  //         }
  //         dog.recipes = recipeIds
  //         let dogPrice = await createDogDailyPrice(dog, priceModel.priceVersion)

  //         let dailyPrice = subscriptionPriceCalculator({ ...dog.subscription.toJSON(), dogPrice: dogPrice })
  //         await Dog.findOneAndUpdate({ _id: dogId }, { $set: { subscription: { ...dog.subscription.toJSON(), dogPrice: dogPrice, dailyPrice: dailyPrice }, recipes: recipeIds } })
  //         await Subscription.findOneAndUpdate({ dog: dogId, status: { $nin: ['canceled'] } }, { $set: { dailyPrice: dailyPrice } })
  //       }
  //     } else {
  //       console.log("no priceModel found!", dogId)
  //     }

  //   } else {
  //     console.log("no Dog found!", dogId)
  //   }
  // }


  // async popyPriceRecipeCalculator(dog: Dog) => {

  //   // console.log("popyPriceCalculator: ", dog)
  //   let weights = await weightGenerator(dog);
  //   // console.log("popyPriceCalculator  weights: ", weights)
  //   let testDogs = weights.map(w => {
  //     let d = Object.assign({}, dog);
  //     // d.weight = Math.floor(w.weight * 0.453592 * 10) / 10;
  //     d.weight = w.weight;
  //     d.ageInMonth = w.month;
  //     if (w.month > 5) {
  //       d.castrated = true;
  //     }
  //     return d;
  //   });
  //   let promises = testDogs.map(async d => {
  //     return { res: await getRecipeForMostExpensiveRecipeId(d), dog: d }
  //   })
  //   let recipes = await Promise.all(promises);
  //   recipes = recipes.flat();

  //   recipes = recipes.map(async recipe => {
  //     let finalRecipe = {};
  //     finalRecipe.ME = recipe.res[0].data.additionalInfo['ME Kcal/kg'];
  //     finalRecipe.weight = recipe.res[0].data.recipe.reduce((accumulator, ingredient) => {
  //       return { 'dailyGram': parseFloat(accumulator.dailyGram) + parseFloat(ingredient.dailyGram) }
  //     }).dailyGram / 1000; //returns the total sum of ingredients to KG
  //     finalRecipe.calorie = finalRecipe.ME * finalRecipe.weight;
  //     finalRecipe.age = recipe.res[0].dog.ageInMonth;
  //     finalRecipe.dogWeight = recipe.dog.weight
  //     return finalRecipe;
  //   })
  //   recipes = await Promise.all(recipes);
  //   // console.log("popyPriceCalculator 4: ", recipes)

  //   // if we wanted to add to recipe
  //   // Recipe.updateMany({owner: mongoose.Types.ObjectId(user._id)}, {isActive: false}).catch(console.log);
  //   // Recipe.create(recipes[i])
  //   // }

  //   // console.log(JSON.stringify(recipes,null,2));
  //   // console.log('priceCalculator2', totalPrice / (recipes.length), totalPrice, recipes.length);
  //   return { recipes: recipes };
  // }

}

