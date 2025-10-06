'use client'
import { createContext, ReactNode, useContext } from 'react';
import { UserStore } from './userStore';
// import { RecipeStore } from './recipeStore';
// import { RegStore } from './regStore';
import FetchApi from '@/services/api';
import { DogStore } from './dogStore';

const api = new FetchApi();

interface Stores {
  userStore: UserStore;
  // recipeStore: RecipeStore;
  dogStore: DogStore;
}

// const recipeStore = new RecipeStore(api)
const dogStore = new DogStore(api)
const userStore = new UserStore(api, dogStore)

const stores: Stores = { userStore, dogStore };

const StoreContext = createContext<Stores>(stores);


export const StoreProvider = ({ children }: { children: ReactNode }) => (
  <StoreContext.Provider value={stores}>{children}</StoreContext.Provider>
);

export const useStores = () => useContext(StoreContext);