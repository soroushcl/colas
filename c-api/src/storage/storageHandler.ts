import { StorageHandler } from "./storageTypes.js";
import { Fail, downloadFileRequestBody, downloadFileResponseBody, Success } from "c-lib";
import { Request, Response } from "express";
import { CloudStorageHandler } from "./cloud/CloudStorageHandler.js";
// import {BuildingRepository} from "../building";
// import {DecarbonizationAssessmentRepository} from "../decarbonization";
// import {DecarbonizationSimulationRepository} from "../decarbonization";
// import {OrganizationRepository} from "../organization/repositories";

// export const storageHandler = (storage : CloudStorageHandler, organizationRepository: OrganizationRepository, buildingRepository: BuildingRepository, assessmentRepository: DecarbonizationAssessmentRepository, simulationRepository: DecarbonizationSimulationRepository) : StorageHandler => {
export const storageHandler = (storage: CloudStorageHandler): StorageHandler => {
  return {
    views: {
      downloadFile: async (req: Request<{}, {}, downloadFileRequestBody>, res: Response<downloadFileResponseBody>) => {
        const { filePath } = req.body;
        if (!filePath) {
          res.status(401).json(Fail(new Error("Must have a file name").toString()));
          return;
        }
        try {
          const urls = await storage.downloadFiles([filePath], false);
          if (urls.length === 0 || !urls[0]) {
            res.status(401).json(Fail(new Error("Something went wrong on google cloud storage").toString()));
            return;
          }
          res.json(Success(urls[0]))
        } catch (e: any) {
          res
            .status(400)
            .json(Fail(new Error(e.toString()).toString()));
        }
      },
    }
  }
}