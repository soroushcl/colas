'use client'
import { makeAutoObservable, reaction } from 'mobx';
import { googleLoginRequestBody, Order, OrderStatus, protein, Recipe, resetPasswordRequestBody, Subscription, subscriptionType, User, userStatus } from 'c-lib';
import FetchApi from '../services/api';
import { Dog } from 'c-lib';
import { DogStore } from './dogStore';

const emailErrorString = "Oops! This doesn't look like a valid email";
// const passwordErrorString = "Password must be at least 3 characters";
// const passwordMatchErrorString = "Passwords must match";

export class UserStore {
  registeredDogs: { dog: Dog, recipes: Recipe[], subscription: Subscription, oldOrders: Order[], activeOrders: Order[] }[] = []
  upcomingOrder: { dogs: Dog['name'][], recipes: string, status: OrderStatus, date: string } = {
    dogs: [],
    recipes: '',
    status: OrderStatus.active,
    date: ''
  }
  upcomingOrders: Order[] = []
  card: number = 0
  billingAddress: {
    line1: string,
    line2: string,
    city: string,
    state: string,
    country: string,
    postalCode: string
  } = {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: 'CA',
      postalCode: ''
    }
  shippingAddress: {
    line1: string,
    line2: string,
    city: string,
    state: string,
    country: string,
    postalCode: string
  } = {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: 'CA',
      postalCode: ''
    }
  user: User = {
    email: "",
    password: '',
    name: '',
    firstName: "",
    lastName: '',
    id: '',
    state: '',
    dogCount: 0,
    status: userStatus.new
  };
  forgotData = {
    repassword: '',
  };
  totalPrice = 0
  totalPriceWithoutDiscount = 0
  clientSecret = ''
  currentRegisteringDog = 0
  currentStep = 0
  customerStep = 0
  stateStep = this.customerStep + 1
  dogCountStep = this.stateStep + 1
  dogNameStep = this.dogCountStep + 1
  emailError = '';
  rememberMe = false;
  isNew = true;

  googleRegData = {
    code: '',
  };

  api: FetchApi;
  isDogBreedValid: any;
  isDogNameValid: any;
  dogStore: DogStore;

  constructor(api: FetchApi, dogStore: DogStore) {
    makeAutoObservable(this);
    this.api = api
    this.dogStore = dogStore
    // Hydrate from localStorage on client
    if (typeof window !== 'undefined') {
      try {
        const persistedUser = window.localStorage.getItem('userStore:user');
        const persistedRemember = window.localStorage.getItem('userStore:rememberMe');
        const persistedStep = window.localStorage.getItem('userStore:currentStep');
        const persistedRegisteredDogs = window.localStorage.getItem('userStore:registeredDogs');
        const persistedUpcomingOrder = window.localStorage.getItem('userStore:upcomingOrder');
        const persistedUpcomingOrders = window.localStorage.getItem('userStore:upcomingOrders');
        const persistedBillingAddress = window.localStorage.getItem('userStore:billingAddress');
        const persistedShippingAddress = window.localStorage.getItem('userStore:shippingAddress');
        const persistedCard = window.localStorage.getItem('userStore:card');
        const persistedCurrentRegisteringDog = window.localStorage.getItem('userStore:currentRegisteringDog');
        if (persistedUser) {
          const parsedUser = JSON.parse(persistedUser);
          if (parsedUser && typeof parsedUser === 'object') {
            this.user = { ...this.user, ...parsedUser };
          }
        }
        if (persistedCard) {
          const parsedCard = JSON.parse(persistedCard);
          if (parsedCard && typeof parsedCard === 'number') {
            this.card = parsedCard;
          }
        }
        if (persistedBillingAddress) {
          const parsedBillingAddress = JSON.parse(persistedBillingAddress);
          if (parsedBillingAddress && typeof parsedBillingAddress === 'object') {
            this.billingAddress = { ...this.billingAddress, ...parsedBillingAddress };
          }
        }
        if (persistedShippingAddress) {
          const parsedShippingAddress = JSON.parse(persistedShippingAddress);
          if (parsedShippingAddress && typeof parsedShippingAddress === 'object') {
            this.shippingAddress = { ...this.shippingAddress, ...parsedShippingAddress };
          }
        }
        if (persistedRemember != null) {
          this.rememberMe = persistedRemember === 'true';
        }
        if (persistedStep != null) {
          const step = parseInt(persistedStep, 10);
          if (!Number.isNaN(step)) this.currentStep = step;
        }
        if (persistedRegisteredDogs) {
          try {
            const parsedDogs = JSON.parse(persistedRegisteredDogs);
            if (Array.isArray(parsedDogs)) {
              this.registeredDogs = parsedDogs;
            }
          } catch (_) {
            // ignore hydration errors for registeredDogs
          }
        }
        if (persistedUpcomingOrder) {
          try {
            const parsedUpcomingOrder = JSON.parse(persistedUpcomingOrder);
            if (parsedUpcomingOrder) {
              this.upcomingOrder = parsedUpcomingOrder;
            }
          } catch (_) {
            // ignore hydration errors for registeredDogs
          }
        }
        if (persistedUpcomingOrders) {
          try {
            const parsedUpcomingOrders = JSON.parse(persistedUpcomingOrders);
            if (parsedUpcomingOrders) {
              this.upcomingOrders = parsedUpcomingOrders;
            }
          } catch (_) {
            // ignore hydration errors for upcomingOrders
          }
        }
        if (persistedCurrentRegisteringDog != null) {
          const index = parseInt(persistedCurrentRegisteringDog, 10);
          if (!Number.isNaN(index)) this.currentRegisteringDog = index;
        }
      } catch (_) {
        // ignore hydration errors
      }

      // Persist on changes
      reaction(
        () => ({
          user: this.user,
          rememberMe: this.rememberMe,
          currentStep: this.currentStep,
          registeredDogs: this.registeredDogs,
          currentRegisteringDog: this.currentRegisteringDog,
          card: this.card,
          billingAddress: this.billingAddress,
          shippingAddress: this.shippingAddress,
          upcomingOrders: this.upcomingOrders,
          upcomingOrder: this.upcomingOrder,
        }),
        (snapshot) => {
          try {
            window.localStorage.setItem('userStore:user', JSON.stringify(snapshot.user));
            window.localStorage.setItem('userStore:rememberMe', String(snapshot.rememberMe));
            window.localStorage.setItem('userStore:currentStep', String(snapshot.currentStep));
            window.localStorage.setItem('userStore:registeredDogs', JSON.stringify(snapshot.registeredDogs));
            window.localStorage.setItem('userStore:currentRegisteringDog', String(snapshot.currentRegisteringDog));
            window.localStorage.setItem('userStore:card', JSON.stringify(snapshot.card));
            window.localStorage.setItem('userStore:billingAddress', JSON.stringify(snapshot.billingAddress));
            window.localStorage.setItem('userStore:shippingAddress', JSON.stringify(snapshot.shippingAddress));
            window.localStorage.setItem('userStore:upcomingOrders', JSON.stringify(snapshot.upcomingOrders));
            window.localStorage.setItem('userStore:upcomingOrder', JSON.stringify(snapshot.upcomingOrder));
          } catch (_) {
            // ignore persistence errors
          }
        }
      );
    }
  }

  get isEmailValid() {
    return /\S+@\S+\.\S+/.test(this.user.email);
  }


  get isLoginValid() {
    return (this.isEmailValid && this.user.password);
  }

  get isCustomerRegisterValid() {
    return (this.isEmailValid && this.user.firstName);
  }

  get isCustomerStateValid() {
    return (this.user.state == 'Ontario') || (this.user.state == 'Quebec');
  }
  get isCustomerDogCountValid() {
    return (this.user.dogCount !== 0);
  }

  async loginUser(): Promise<Boolean> {
    console.log('User Store loginUser:', this.user.email, this.user.firstName, this.user.state, this.user.dogCount);
    try {
      const res = await this.api.login(this.user.email, this.user.password, this.rememberMe)
      console.log("User Store res", res)
      if (res.success) {
        const payload: any = (res as any).payload;
        const token = payload.token;
        // Save basic user info
        if (payload.user?.firstName) {
          this.user.firstName = payload.user.firstName;
        }
        if (payload.user?.name) {
          this.user.firstName = payload.user.name;
        }
        // Store dogs in DogStore
        let registeredDogs: { dog: Dog, recipes: Recipe[], subscription: Subscription, oldOrders: Order[], activeOrders: Order[] }[] = []
        let dogs = payload?.dogs.map((r: any) => {
          r.id = r._id
          return r
        }) || [];
        let subscriptions: Subscription[] = payload?.subscriptions.map((r: any) => {
          r.id = r._id
          r.info = r.info ? r.info : dogs.filter((d: Dog) => d.id == r.dog)[0].subscription.info
          r.recurring = r.recurring ? r.recurring : dogs.filter((d: Dog) => d.id == r.dog)[0].subscription.recurring
          r.type = r.type ? r.type : dogs.filter((d: Dog) => d.id == r.dog)[0].subscription.type as subscriptionType
          return r
        }) || [];
        let orders: Order[] = payload?.orders.map((r: any) => {
          r.id = r._id
          return r
        }) || [];
        let recipes: Recipe[] = payload?.recipes.map((r: any) => {
          r.recipeId == 1 ? r.protein = protein.beef : r.recipeId == 2 ? r.protein = protein.chicken : r.recipeId == 3 ? r.protein = protein.salmon : r.protein = protein.salmon
          r.id = r._id
          return r
        })
          || [];

        for (let i = 0; i < dogs.length; i++) {
          if (!dogs[i].id) {
            dogs[i].id = dogs[i]._id
          }
          let dogRecipes = recipes.filter(obj => {
            return (obj.dog == dogs[i].id)
          })
          let dogSubscription = subscriptions.filter(obj => {
            return (obj.dog == dogs[i].id)
          })
          let dogOldOrders = orders.filter(obj => {
            return (obj.dog == dogs[i].id && obj.status == OrderStatus.delivered)
          })
          let activeOldOrders = orders.filter(obj => {
            return (obj.dog == dogs[i].id && obj.status == OrderStatus.active)
          })
          let registeredDog: { dog: Dog, recipes: Recipe[], subscription: Subscription, oldOrders: Order[], activeOrders: Order[] } = {
            dog: dogs[i], recipes: dogRecipes,
            subscription: dogSubscription[0],
            oldOrders: dogOldOrders,
            activeOrders: activeOldOrders
          }
          registeredDogs.push(registeredDog)
        }
        this.registeredDogs = registeredDogs

        let upcomingOrder: { dogs: Dog['name'][], recipes: { protein: protein, count: number }[], status: OrderStatus, date: string } = {
          dogs: [],
          recipes: [
            { protein: protein.beef, count: 0 },
            { protein: protein.chicken, count: 0 },
            { protein: protein.salmon, count: 0 },
            // { protein: protein.turkey, count: 0 }
          ],
          status: OrderStatus.aggregation,
          date: ''
        }
        let upcomingOrders: Order[] = []
        for (let i = 0; i < orders.length; i++) {
          console.log("upcomingOrder 1", [OrderStatus.aggregation, OrderStatus.packaging, OrderStatus.preparation, OrderStatus.shipped].includes(orders[i].status), orders[i].status)
          if ([OrderStatus.aggregation, OrderStatus.packaging, OrderStatus.preparation, OrderStatus.shipped].includes(orders[i].status)) {
            upcomingOrders.push(orders[i])
            let dog = dogs.filter((d: any) => d.id == orders[i].dog)[0]
            console.log("upcomingOrder 2", dog.name, orders[i].dog, dogs)
            if (!upcomingOrder.dogs.includes(dog.name)) {
              upcomingOrder.dogs.push(dog.name.charAt(0).toUpperCase() + dog.name.slice(1))
            }
            console.log("upcomingOrder 3", orders[i].detail.info, orders[i].detail.info.length)
            for (let j = 0; j < orders[i].detail.info.length; j++) {
              let info = orders[i].detail.info[j]
              let recipeId = info.recipeId
              let amount = info.amount
              let prot = recipes.filter(r => r.id == recipeId)[0].protein
              upcomingOrder.recipes.filter(t => t.protein == prot)[0].count += amount
            }
            upcomingOrder.status = orders[i].status
            upcomingOrder.date = new Date(orders[i].shippingDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })
          }
        }
        let recipeNames = ''
        for (let i = 0; i < upcomingOrder.recipes.length; i++) {
          let r = upcomingOrder.recipes[i]
          if (r.count) {
            recipeNames += (r.count + " " + r.protein)
            recipeNames += ", "
          }
        }
        recipeNames = recipeNames.substring(0, recipeNames.length - 1)
        this.upcomingOrder = { dogs: upcomingOrder.dogs, recipes: recipeNames, status: upcomingOrder.status, date: upcomingOrder.date }
        this.upcomingOrders = upcomingOrders
        this.card = payload.cards[0] ? payload.cards[0].card.last4 : 0
        this.billingAddress = payload.billingAddress
        this.shippingAddress = payload.billingAddress
        console.log("login completed registeredDogs", this.registeredDogs)
        console.log("login completed upcomingOrder", this.upcomingOrder)
        console.log("login completed upcomingOrder", this.upcomingOrder.date)
        console.log("login completed cards", this.card)
        console.log("login completed billingAddress", this.billingAddress)
        console.log("login completed shippingAddress", this.shippingAddress)

        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem('token', token);
            window.localStorage.setItem('userStore:user', JSON.stringify(this.user));
            window.localStorage.setItem('userStore:registeredDogs', JSON.stringify(this.registeredDogs));
            window.localStorage.setItem('userStore:upcomingOrder', JSON.stringify(this.upcomingOrder));
            window.localStorage.setItem('userStore:upcomingOrders', JSON.stringify(this.upcomingOrders));
            window.localStorage.setItem('userStore:card', JSON.stringify(this.card));
            window.localStorage.setItem('userStore:billingAddress', JSON.stringify(this.billingAddress));
            window.localStorage.setItem('userStore:shippingAddress', JSON.stringify(this.shippingAddress));
          } catch (_) {
            // ignore
          }
        }
        return true
      } else {
        console.log('Error submitting form:')
        this.emailError = emailErrorString
        return false
      }
    } catch (error) {
      console.log('Error submitting form:', error?.toString());
      this.emailError = error?.toString() || emailErrorString
      return false
    }
  }

  async loginUserWithGoogle(body: googleLoginRequestBody): Promise<Boolean> {
    console.log('User Store loginUserWithGoogle');
    try {
      const res = await this.api.googleLogin(body.code)
      console.log("User Store res", res)
      if (res.success) {
        const payload: any = (res as any).payload;
        const token = payload.token;
        // Save basic user info
        if (payload.user?.firstName) {
          this.user.firstName = payload.user.firstName;
        }
        if (payload.user?.name) {
          this.user.firstName = payload.user.name;
        }
        // Store dogs in DogStore
        let registeredDogs: { dog: Dog, recipes: Recipe[], subscription: Subscription, oldOrders: Order[], activeOrders: Order[] }[] = []
        let dogs = payload?.dogs || [];
        let subscriptions: Subscription[] = payload?.dogs || [];
        let orders: Order[] = payload?.dogs || [];
        let recipes: Recipe[] = payload?.recipes || [];
        for (let i = 0; i < dogs.length; i++) {
          if (!dogs[i].id) {
            dogs[i].id = dogs[i]._id
          }
          let dogRecipes = recipes.filter(obj => {
            return (obj.dog == dogs[i].id)
          })
          let dogSubscription = subscriptions.filter(obj => {
            return (obj.dog == dogs[i].id)
          })
          let dogOldOrders = orders.filter(obj => {
            return (obj.dog == dogs[i].id && obj.status == OrderStatus.delivered)
          })
          let activeOldOrders = orders.filter(obj => {
            return (obj.dog == dogs[i].id && obj.status == OrderStatus.active)
          })
          let registeredDog: { dog: Dog, recipes: Recipe[], subscription: Subscription, oldOrders: Order[], activeOrders: Order[] } = {
            dog: dogs[i], recipes: dogRecipes,
            subscription: dogSubscription[0],
            oldOrders: dogOldOrders,
            activeOrders: activeOldOrders
          }
          registeredDogs.push(registeredDog)
        }
        this.registeredDogs = registeredDogs
        let upcomingOrder
        // this.dogStore.dogs = dogs;
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem('token', token);
            window.localStorage.setItem('userStore:user', JSON.stringify(this.user));
          } catch (_) {
            // ignore
          }
        }
        return true
      } else {
        console.log('Error submitting form:')
        this.emailError = emailErrorString
        return false
      }
    } catch (error) {
      console.log('Error submitting form:', error);
      this.emailError = emailErrorString
      return false
    }
  }

  async registerUser(): Promise<Boolean> {
    console.log('User Store registerUser:', this.user.email, this.user.firstName, this.user.state, this.user.dogCount);
    try {
      const res = await this.api.register(this.user.email, this.user.firstName)
      console.log("User Store res", res)
      if (res.success) {
        this.user = res.payload.user;
        this.currentStep += 1
        return true
      } else {
        console.log('Error submitting form:')
        this.emailError = emailErrorString
        return false
      }
    } catch (error) {
      console.log('Error submitting form:', error?.toString());
      this.emailError = error?.toString() || emailErrorString
      return false
    }
  }
  async setPassword(): Promise<Boolean> {
    console.log('User Store setPassword:', this.user.password, this.forgotData.repassword);
    try {
      if (!this.user.password) {
        return false
      }
      const res = await this.api.setPasswordRequest(this.user.id, this.user.password, this.forgotData.repassword)
      console.log("User Store res", res)
      if (res) {
        // Auto-login the user after successful update
        const loginPassword = this.user.password ? this.user.password : '123';
        const loginRes = await this.loginUser()
        this.currentStep += 1
        return true
      } else {
        console.log('Error submitting form:')
        this.emailError = emailErrorString
        return false
      }
    } catch (error) {
      console.log('Error submitting form:', error?.toString());
      this.emailError = error?.toString() || emailErrorString
      return false
    }
  }

  async createPayment(): Promise<Boolean> {
    console.log('User Store createPayment:',);
    try {
      const res = await this.api.createPaymentIntent(this.totalPrice, 'cad')
      console.log("User Store createPayment res", res)
      if (res.success) {
        this.clientSecret = res.payload.clientSecret;
        return true
      } else {
        console.log('Error submitting form:')
        return false
      }
    } catch (error) {
      console.log('Error submitting form:', error?.toString());
      return false
    }
  }

  registerNextDog(dog: Dog, recipes: Recipe[], subscription: Subscription) {
    console.log('User Store registerNextDog dog:', dog);
    console.log('User Store registerNextDog recipes:', recipes);
    console.log('User Store registerNextDog subscription:', subscription);
    this.registeredDogs.push({ dog, recipes, subscription, oldOrders: [], activeOrders: [] })
    console.log('User Store registerNextDog registeredDogs:', this.registeredDogs);
    this.currentRegisteringDog += 1
  }

  async updateCustomer(): Promise<Boolean> {
    console.log('User Store updateCustomer:', this.user.email, this.user.firstName, this.user.state, this.user.dogCount);
    if (this.currentStep == this.stateStep) {
      this.currentStep += 1
      return true
    } else {
      try {
        const res = await this.api.updateUser(this.user)
        console.log("User Store res", res)
        if (res.success) {
          this.user = res.payload;
          this.currentStep += 1
          return true
        } else {
          console.log('Error submitting form:')
          this.emailError = emailErrorString
          return false
        }
      } catch (error) {
        console.log('Error submitting form:', error?.toString());
        this.emailError = error?.toString() || emailErrorString
        return false
      }
    }
  }

  async registerUserWithGoogle(): Promise<Boolean> {
    console.log('User Store registerUserWithGoogle');
    try {
      const res = await this.api.googleReg(this.googleRegData.code)
      console.log("User Store res", res)
      this.user.email = res
      return true
    } catch (error) {
      console.log('Error submitting form:', error);
      this.emailError = emailErrorString
      return false
    }
  }

  async forgotPassword(): Promise<Boolean> {
    console.log('Forgot Store Submitting form data:', this.user.email);
    try {
      const res = await this.api.sendPasswordResetEmail(this.user.email)
      console.log("Forgot Store res", res)
      if (!res) {
        console.log('Error submitting form:');
        this.emailError = emailErrorString
        return false
      }
      return true
    } catch (error) {
      console.log('Error submitting form:', error);
      this.emailError = emailErrorString
      return false
    }
  }

  async resetPassword(body: resetPasswordRequestBody['forgotPasswordId']): Promise<Boolean> {
    console.log('Forgot Store Submitting form data:', this.user.password, this.forgotData.repassword);
    try {
      const res = await this.api.resetPasswordRequest(this.user.password!, this.forgotData.repassword, body)
      console.log("Forgot Store res", res)
      if (!res) {
        console.log('Error submitting form:');
        this.emailError = emailErrorString
        return false
      }
      return true
    } catch (error) {
      console.log('Error submitting form:', error);
      this.emailError = emailErrorString
      return false
    }
  }

}