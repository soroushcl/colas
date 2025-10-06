import express from "express";
// import {UserType} from "c-lib";
import { externalAuthorization} from "@utils/authorize.js";
import { SampleModuleRouterFactoryViews } from "../sampleModuleTypes.js";

export const sampleModuleRouterFactory = (views: SampleModuleRouterFactoryViews) => {
  const router = express.Router();

  router.get('/configs/count', externalAuthorization, views.getNumberOfSampleModuleConfigs);
  router.get('/configs/all', externalAuthorization, views.getAllSampleModuleConfigs);
  router.get('/configs/:id', externalAuthorization, views.getSampleModuleConfigById);
  
  // router.post('/configs', authorize(), views.createSampleModuleConfig);
  // router.put('/configs', authorize(), views.updateSampleModuleConfig);
  // router.delete('/configs', authorize(), views.deleteSampleModuleConfig);

  router.post('/configs',  views.createSampleModuleConfig);
  router.put('/configs',  views.updateSampleModuleConfig);
  router.delete('/configs',  views.deleteSampleModuleConfig);

  return router;
}