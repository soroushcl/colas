import React, { createContext, ReactNode, useContext } from 'react';
import API from '../services/api.js';


export interface ServiceProviderInterface {
  // isTest: boolean
  api: API;
}

interface ServiceProviderProps {
  children?: ReactNode | ReactNode[],
  // isTest: boolean | false
  api: API;
}

const ServiceProviderContext = createContext<ServiceProviderInterface>({
  // isTest: {} as boolean
  api: {} as API
});

export function useService() {
  return useContext(ServiceProviderContext);
}

export function ServiceProvider({children, api}: ServiceProviderProps) {
  return (
    <ServiceProviderContext.Provider value={{api: api}}>
      {
        children
      }
    </ServiceProviderContext.Provider>
  );
}
