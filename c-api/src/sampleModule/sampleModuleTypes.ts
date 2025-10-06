import {RequestHandler} from "express";

export interface SampleModuleRouterFactoryViews {
  createSampleModuleConfig: RequestHandler,
  getAllSampleModuleConfigs: RequestHandler,
  updateSampleModuleConfig: RequestHandler,
  deleteSampleModuleConfig: RequestHandler,
  getNumberOfSampleModuleConfigs: RequestHandler,
  getSampleModuleConfigById: RequestHandler<{id: string}>,
}

export interface SampleModuleHandler {
  sampleModuleViews: {
    createSampleModuleConfig: RequestHandler,
    getAllSampleModuleConfigs: RequestHandler,
    updateSampleModuleConfig: RequestHandler,
    deleteSampleModuleConfig: RequestHandler,
    getNumberOfSampleModuleConfigs: RequestHandler,
    getSampleModuleConfigById: RequestHandler<{id: string}>,
  },
}
