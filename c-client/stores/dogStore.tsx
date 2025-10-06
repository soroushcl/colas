'use client'
import { makeAutoObservable, reaction, toJS } from 'mobx';
import { activityLevel, Dog, dogStatus, eatingHabit, gender, Subscription, Recipe, shape, subscriptionStatus, subscriptionType, recurringType } from 'c-lib';
import FetchApi from '../services/api';
// import { RecipeStore } from './recipeStore';
interface dogRecipes {
  dogId: '',
  recipes: Recipe[]
}

export class DogStore {
  dogs: Dog[] = []; // List of registered dogs
  currentDogIndex = 0;
  recipes: Recipe[] = [];
  maxDogs = 4;
  dog: Dog = {
    owner: '',
    name: '',
    weight: 12,
    breed: '',
    age: new Date(),
    gender: gender.female,
    isNeutered: false,
    isPregnant: false,
    pregnancyDuration: 0,
    isNursing: false,
    nursingPuppies: 0,
    hasHealthIssue: false,
    healthIssue: [],
    isAllergic: false,
    allergies: [],
    activityLevel: activityLevel.low,
    shape: shape.underweight,
    calorie: 0,
    note: '',
    status: dogStatus.active,
    eating: eatingHabit.picky,
    proteins: [],
    id: '',
    recipes: []
  };
  subscription: Subscription = {
    id: '',
    userId: this.dog.owner,
    dog: this.dog.id,
    shippingAddress: {
      line1: '',
      postalCode: '',
      city: '',
      state: '',
      country: '',
      phoneNumber: ''
    },
    discounts: [],
    dailyPrice: 0,
    priceVersion: '',
    status: subscriptionStatus.active,
    type: subscriptionType.full,
    info: [],
    selectedRecipes: [],
    recurring: 0,
    recurringType: recurringType.automated,
    dogPrice: 0,
    isActive: true,
  }
  currentStep = 0
  nameStep = 0
  breedStep = this.nameStep + 1
  ageStep = this.breedStep + 1
  genderStep = this.ageStep + 1
  neuteredStep = this.genderStep + 1
  pregnantStep = this.neuteredStep + 1
  nursingStep = this.pregnantStep + 1
  activityStep = this.nursingStep + 1
  healthStep = this.activityStep + 1
  alergyStep = this.healthStep + 1
  eatingStep = this.alergyStep + 1
  shapeStep = this.eatingStep + 1
  proteinStep = this.shapeStep + 1

  get isDogNameValid() {
    return (this.dog.name);
  }

  get isDogBreedValid() {
    return (this.dog.breed);
  }

  api: FetchApi;
  // recipeStore: RecipeStore;

  constructor(api: FetchApi) {
    makeAutoObservable(this);
    this.api = api
    // this.recipeStore = recipeStore
    if (typeof window !== 'undefined') {
      try {
        const persistedDogs = window.localStorage.getItem('dogStore:dogs');
        const persistedCurrentDogIndex = window.localStorage.getItem('dogStore:currentDogIndex');
        const persistedRecipes = window.localStorage.getItem('dogStore:recipes');
        const persistedDog = window.localStorage.getItem('dogStore:dog');
        const persistedSubscription = window.localStorage.getItem('dogStore:subscription');
        const persistedCurrentStep = window.localStorage.getItem('dogStore:currentStep');
        if (persistedDogs) {
          this.dogs = JSON.parse(persistedDogs) || [];
        }
        if (persistedCurrentDogIndex != null) {
          const idx = parseInt(persistedCurrentDogIndex, 10);
          if (!Number.isNaN(idx)) this.currentDogIndex = idx;
        }
        if (persistedRecipes) {
          this.recipes = JSON.parse(persistedRecipes) || [];
        }
        if (persistedDog) {
          const parsedDog = JSON.parse(persistedDog);
          if (parsedDog && parsedDog.age) {
            parsedDog.age = new Date(parsedDog.age);
          }
          this.dog = parsedDog || this.dog;
        }
        if (persistedSubscription) {
          this.subscription = JSON.parse(persistedSubscription) || this.subscription;
        }
        if (persistedCurrentStep != null) {
          const step = parseInt(persistedCurrentStep, 10);
          if (!Number.isNaN(step)) this.currentStep = step;
        }
      } catch (_) {
        // ignore
      }

      reaction(
        () => ({
          dogs: this.dogs.slice(),
          currentDogIndex: this.currentDogIndex,
          recipes: this.recipes.slice(),
          dog: toJS(this.dog),
          subscription: toJS(this.subscription),
          currentStep: this.currentStep,
        }),
        (snapshot) => {
          try {
            window.localStorage.setItem('dogStore:dogs', JSON.stringify(snapshot.dogs));
            window.localStorage.setItem('dogStore:currentDogIndex', String(snapshot.currentDogIndex));
            window.localStorage.setItem('dogStore:recipes', JSON.stringify(snapshot.recipes));
            window.localStorage.setItem('dogStore:dog', JSON.stringify(snapshot.dog));
            window.localStorage.setItem('dogStore:subscription', JSON.stringify(snapshot.subscription));
            window.localStorage.setItem('dogStore:currentStep', String(snapshot.currentStep));
          } catch (_) {
            // ignore
          }
        }
      );
    }
  }

  registerNextDog() {
    this.currentDogIndex += 1
    this.dog = {
      owner: '',
      name: '',
      weight: 12,
      breed: '',
      age: new Date(),
      gender: gender.female,
      isNeutered: false,
      isPregnant: false,
      pregnancyDuration: 0,
      isNursing: false,
      nursingPuppies: 0,
      hasHealthIssue: false,
      healthIssue: [],
      isAllergic: false,
      allergies: [],
      activityLevel: activityLevel.low,
      shape: shape.underweight,
      calorie: 0,
      note: '',
      status: dogStatus.active,
      eating: eatingHabit.picky,
      proteins: [],
      id: '',
      recipes: []
    };
    this.subscription = {
      id: '',
      userId: this.dog.owner,
      dog: this.dog.id,
      shippingAddress: {
        line1: '',
        postalCode: '',
        city: '',
        state: '',
        country: '',
        phoneNumber: ''
      },
      discounts: [],
      dailyPrice: 0,
      priceVersion: '',
      status: subscriptionStatus.active,
      type: subscriptionType.full,
      info: [],
      selectedRecipes: [],
      recurring: 0,
      recurringType: recurringType.automated,
      dogPrice: 0,
      isActive: true,
    }
  }

  async registerDog(owner: Dog['owner']): Promise<Boolean> {
    this.dog.owner = owner
    console.log('Dog Store create Dog:',
      this.dog.owner,
      this.dog.name,
      this.dog.weight,
      this.dog.breed,
      this.dog.age,
      this.dog.gender,
      this.dog.isNeutered,
      this.dog.isPregnant,
      this.dog.isNursing,
      this.dog.nursingPuppies,
      this.dog.hasHealthIssue,
      this.dog.healthIssue,
      this.dog.activityLevel,
      this.dog.shape,
      this.dog.proteins,
    );
    try {
      const res = await this.api.registerDog(this.dog)
      console.log("User Store res", res)
      if (res.success) {
        const registeredDog = res.payload.dog;
        const dogRecipes = res.payload.recipes;

        // Add dog to list of registered dogs
        this.dog = registeredDog;
        console.log("this.dog", this.dog.id, this.dog.owner)
        console.log("registeredDog", registeredDog._id, registeredDog.owner)
        this.dog.id = registeredDog._id
        this.dogs.push(this.dog);

        // Map recipes to dog ID
        this.recipes = (dogRecipes);
        this.subscription.dog = this.dog.id
        this.currentStep += 1
        return true
      } else {
        console.log('Error submitting form:1')
        return false
      }
    } catch (error) {
      console.log('Error submitting form:2', error?.toString());
      return false
    }
  }
  async createDogSubscription() {
    try {
      console.log("Dog Store subscription", this.subscription.selectedRecipes, this.subscription.type)
      const res = await this.api.createSubscription(this.subscription)
      console.log("Dog Store res", res, res.success)
      if (!res.success) {
        throw new Error('Failed to create subscription');
      }

      const subscriptionData = res.payload.subscription;
      console.log("AA1", subscriptionData)
      console.log("AA12", this.subscription)
      // Update the store with the returned subscription data
      this.subscription = {
        ...this.subscription,
        ...subscriptionData,
      };

      console.log("AA22", this.subscription)

      return true;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }
  // getRecipesForDog(dogId: Dog['id']) {
  //   const entry = this.recipes.find(r => r.dogId === dogId);
  //   return entry ? entry.recipes : [];
  // }

  // resetDog() {
  //   this.dog = {
  //     owner: '',
  //     name: '',
  //     weight: 12,
  //     breed: '',
  //     age: new Date(),
  //     gender: gender.female,
  //     isNeutered: false,
  //     isPregnant: false,
  //     pregnancyDuration: 0,
  //     isNursing: false,
  //     nursingPuppies: 0,
  //     hasHealthIssue: false,
  //     healthIssue: [],
  //     isAllergic: false,
  //     allergies: [],
  //     activityLevel: activityLevel.low,
  //     shape: shape.underweight,
  //     calorie: 0,
  //     note: '',
  //     status: dogStatus.active,
  //     eating: eatingHabit.picky,
  //     proteins: [],
  //     id: ''
  //   };
  // }

}
