// import { Collection, Db, MongoError, ObjectId } from "mongodb";
// // import { SampleModuleConfig } from "c-lib";
// import { HttpStatusCode } from "@utils/constants";
// import { BaseMongoRepository, getHttpStatusCodeCodeFromMongoError, mongoObj } from "@utils/mongoUtils";
// // import { SampleModuleRepository } from "../SampleModuleRepository";

// export class SampleModuleMongoRepository implements SampleModuleRepository {
//   private collection: Collection<mongoObj<SampleModuleConfig>>;
//   private baseSampleModuleRepo: BaseMongoRepository<SampleModuleConfig>;

//   constructor(db: Db, SampleModuleCollectionName: string) {
//     this.collection = db.collection(SampleModuleCollectionName);
//     this.baseSampleModuleRepo = new BaseMongoRepository(this.collection);
//   }

//   createId(): SampleModuleConfig["id"] {
//     return new ObjectId().toString();
//   }

//   async createSampleModuleConfig(newConfig: SampleModuleConfig): Promise<SampleModuleConfig> {
//     try {
//       return this.baseSampleModuleRepo.createDocument(newConfig);
//     } catch (e) {
//       throw e;
//     }
//   }

//   async updateSampleModuleConfig(updateConfig: SampleModuleConfig): Promise<SampleModuleConfig> {
//     try {
//       return this.baseSampleModuleRepo.updateDocument(updateConfig);
//     } catch (e) {
//       throw e;
//     }
//   }

//   async deleteSampleModuleConfig(configId: SampleModuleConfig["id"]): Promise<boolean> {
//     try {
//       return this.baseSampleModuleRepo.deleteDocument(configId);
//     } catch (e) {
//       throw e;
//     }
//   }

//   async getNumberOfSampleModuleConfigs(): Promise<number> {
//     try {
//       return await this.baseSampleModuleRepo.getNumberOfDocuments();
//     } catch (e) {
//       throw e;
//     }
//   }

//   async findSampleModuleConfigById(id: SampleModuleConfig["id"]): Promise<SampleModuleConfig | null> {
//     try {
//       return await this.baseSampleModuleRepo.findDocumentById(id);
//     } catch (e) {
//       throw e;
//     }
//   }

//   async findAllSampleModuleConfigs(): Promise<SampleModuleConfig[]> {
//     try {
//       return await this.baseSampleModuleRepo.findAllDocuments();
//     } catch (e) {
//       throw e;
//     }
//   }

//   public getHttpStatusCodeFromRepoError(error: any): number {
//     if (error instanceof MongoError) {
//       return getHttpStatusCodeCodeFromMongoError(error);
//     }
//     return HttpStatusCode.BAD_REQUEST;
//   }
// }