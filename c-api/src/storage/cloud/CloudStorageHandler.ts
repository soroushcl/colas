import {StorageObject} from "c-lib";
import {SignedPostPolicyV4Output} from "@google-cloud/storage";

export abstract class CloudStorageHandler {
  abstract uploadFiles(
    files: Express.Multer.File[],
    directoryPath: string,
    isPublic: boolean
  ): Promise<StorageObject[]>;

  abstract downloadFiles(fileNames: StorageObject['url'][], isPublic: boolean): Promise<(string | undefined)[]>;

  abstract signedUrlFile(directoryPath: string, fileName: string): Promise<SignedPostPolicyV4Output>;

  abstract readStreamFilesAsString(fileNames: StorageObject['url'][], isPublic: boolean): Promise<(string | undefined)[]>;

}
