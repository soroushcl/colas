
// import { HttpStatusCode } from "@utils/constants";
// import { Request, Response } from "express";
// // import { SampleModuleRepository } from "./repositories/SampleModuleRepository";
// // import { SampleModuleHandler } from "./sampleModuleTypes";
// import {
//   // clientSideSampleModuleConfig,
//   // SampleModuleConfig,
//   // createSampleModuleConfigRequestBody,
//   // createSampleModuleConfigResponseBody,
//   // deleteSampleModuleConfigRequestBody,
//   // deleteSampleModuleConfigResponseBody,
//   Fail,
//   // getSampleModuleConfigResponseBody,
//   // getSampleModuleConfigsResponseBody,
//   // getNumberOfAllSampleModuleConfigsResponseBody,
//   Success,
//   // updateSampleModuleConfigRequestBody,
//   // updateSampleModuleConfigResponseBody
// } from "c-lib";

// export const sampleModuleHandler = (
//   sampleModuleRepo: SampleModuleRepository
// ): SampleModuleHandler => {
//   function handleError(res: Response, e: any, httpStatusCode: number = HttpStatusCode.UNAUTHORIZED) {
//     const responseCode = httpStatusCode || sampleModuleRepo.getHttpStatusCodeFromRepoError(e);
//     res.status(responseCode).json(Fail(new Error(e.toString()).toString()));
//   }
//   function getCurrentTime(): number {
//     return new Date().getTime();
//   }

//   return {
//     sampleModuleViews: {
//       createSampleModuleConfig: async (req: Request<{}, {}, createSampleModuleConfigRequestBody>, res: Response<createSampleModuleConfigResponseBody>) => {
//         try {
//           const {
//             canadianSampleModule,
//             hdd,
//             province,
//             city,
//           } = req.body;
//           const currentTime = getCurrentTime();
//           const newConfig: SampleModuleConfig = {
//             id: sampleModuleRepo.createId(),
//             canadianSampleModule,
//             hdd,
//             province,
//             city,
//             createdAt: currentTime,
//             updatedAt: currentTime
//           };
//           const createdConfig = await sampleModuleRepo.createSampleModuleConfig(newConfig);
//           res.json(Success(createdConfig));
//         } catch (e: any) {
//           console.log(e);
//           handleError(res, e);
//         }
//       },
//       updateSampleModuleConfig: async (req: Request<{}, {}, updateSampleModuleConfigRequestBody>, res: Response<updateSampleModuleConfigResponseBody>) => {
//         try {
//           const { updatedConfig } = req.body;
//           const existingConfig = await sampleModuleRepo.findSampleModuleConfigById(updatedConfig.id);
//           if (!existingConfig) {
//             res
//               .status(HttpStatusCode.NOT_FOUND)
//               .json(Fail(new Error("unable to find config to update").toString()));
//             return;
//           }
//           const configToUpdateWith: SampleModuleConfig = {
//             ...updatedConfig,
//             updatedAt: getCurrentTime()
//           };
//           const updatedConfigResult = await sampleModuleRepo.updateSampleModuleConfig(configToUpdateWith);
//           res.json(Success(clientSideSampleModuleConfig(updatedConfigResult)));
//         } catch (e: any) {
//           console.log(e);
//           handleError(res, e);
//         }
//       },
//       deleteSampleModuleConfig: async (req: Request<{}, {}, deleteSampleModuleConfigRequestBody>, res: Response<deleteSampleModuleConfigResponseBody>) => {
//         try {
//           const { id } = req.body;
//           const foundConfig = await sampleModuleRepo.findSampleModuleConfigById(id);
//           if (!foundConfig) {
//             res
//               .status(HttpStatusCode.NOT_FOUND)
//               .json(Fail(new Error("unable to find config to delete").toString()));
//             return;
//           }
//           await sampleModuleRepo.deleteSampleModuleConfig(id);
//           res.json(Success(true));
//         } catch (e: any) {
//           console.log(e);
//           handleError(res, e);
//         }
//       },
//       getAllSampleModuleConfigs: async (req: Request, res: Response<getSampleModuleConfigsResponseBody>) => {
//         try {
//           const configs = await sampleModuleRepo.findAllSampleModuleConfigs();
//           res.json(Success(configs.map(c => clientSideSampleModuleConfig(c))));
//         } catch (e: any) {
//           console.log(e);
//           handleError(res, e);
//         }
//       },
//       getNumberOfSampleModuleConfigs: async (req: Request, res: Response<getNumberOfAllSampleModuleConfigsResponseBody>) => {
//         try {
//           const count = await sampleModuleRepo.getNumberOfSampleModuleConfigs();
//           res.json(Success(count));
//         } catch (e: any) {
//           console.log(e);
//           handleError(res, e);
//         }
//       },
//       getSampleModuleConfigById: async (req: Request<{ id: string; }, {}, {}>, res: Response<getSampleModuleConfigResponseBody>) => {
//         try {
//           const configId = req.params.id.toString();
//           const foundConfig = await sampleModuleRepo.findSampleModuleConfigById(configId);
//           if (foundConfig === null) {
//             res
//               .status(HttpStatusCode.NOT_FOUND)
//               .json(Fail(new Error("unable to find sample").toString()));
//             return;
//           }
//           res.json(Success(clientSideSampleModuleConfig(foundConfig)));
//         } catch (e: any) {
//           console.log(e);
//           handleError(res, e);
//         }
//       },
//     }
//   }
// }
