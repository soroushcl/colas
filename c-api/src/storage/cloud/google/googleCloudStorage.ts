import { CloudStorageHandler } from "../CloudStorageHandler.js";
import {SignedPostPolicyV4Output, Storage} from "@google-cloud/storage";

const cloudStorage = new Storage({
  keyFilename: `./external_files/steam-bee-376520-87a452303461.json`,
  projectId: "steam-bee-376520",
});

export class googleCloudStorage extends CloudStorageHandler {
  async uploadFiles(
    files: Express.Multer.File[],
    directoryPath: string,
    isPublic: boolean
  ): Promise<{ name: string; url: string }[]> {
    const bucketName = isPublic ? process.env['PUBLIC_STORAGE_BUCKET_NAME'] || "cola-dev-public" : process.env['PRIVATE_STORAGE_BUCKET_NAME'] || "cola-dev-private";
    const bucket = cloudStorage.bucket(bucketName);

    let result: { name: string; url: string }[] | null = [];

    const promises = files.map(file => new Promise<{ name: string; url: string }>(async (resolve) => {
      if (process.env['NODE_ENV'] === 'production' || process.env['NODE_ENV'] === 'development' || process.env['NODE_ENV'] === 'storage') {
        const blob = bucket.file(`${directoryPath}/${file.originalname}`);
        await blob.save(file.buffer);
        resolve({
          name: file.originalname,
          url: isPublic ? `https://storage.googleapis.com/${bucket.name}/${blob.name}` : `${blob.name}`
        });
      } else {
        resolve({
          name: "development",
          url: 'development'
        })
      }
    }))
    try {
      result = await Promise.all(promises)
      return result;
    } catch (e: any) {
      throw (Error(e.toString()));
    }
  }

  async downloadFiles(fileNames: string[], isPublic: boolean): Promise<(string | undefined)[]> {
    const bucketName = isPublic ? process.env['PUBLIC_STORAGE_BUCKET_NAME'] || "cola-dev-public" : process.env['PRIVATE_STORAGE_BUCKET_NAME'] || "cola-dev-private";
    const bucket = cloudStorage.bucket(bucketName);

    let result: (string | undefined)[] = [];

    const promises = fileNames.map(file => new Promise<(string | undefined)>(async (resolve,) => {
      const bucketFile = bucket.file(file);
      const config: any = {
        action: "read", // giving read permission here
        expires: "03-17-2025", // specifying the expiry date
      };
      const [url] = await bucketFile.getSignedUrl(config)
      resolve(url);
    }));
    try {
      result = await Promise.all(promises);
      return result;
    } catch (e: any) {
      throw Error(e.toString());
    }
  }

  async readStreamFilesAsString(fileNames: string[], isPublic: boolean): Promise<(string | undefined)[]> {
    const bucketName = isPublic ? process.env['PUBLIC_STORAGE_BUCKET_NAME'] || "cola-dev-public" : process.env['PRIVATE_STORAGE_BUCKET_NAME'] || "cola-dev-private";
    const bucket = cloudStorage.bucket(bucketName);

    let result: (string | undefined)[] = [];

    const promises = fileNames.map(file => new Promise<(string | undefined)>(async (resolve,reject) => {
      const bucketFile = bucket.file(file);
      const stream = bucketFile.createReadStream() //stream is created
      let fileContent = '';

      stream.on('data', chunk => {
        fileContent += chunk;
      });

      stream.on('error', err => {
        console.error('Error in stream', err);
        reject(new Error('Error in reading file'));
      });

      stream.on('end', () => {
        // The file content is ready as a string
        console.log('File read successfully');
        resolve(fileContent); // or process the file content as needed
      });
    }));
    try {
      result = await Promise.all(promises);
      return result;
    } catch (e: any) {
      throw Error(e.toString());
    }
  }

  async signedUrlFile(directoryPath: string, fileName: string): Promise<SignedPostPolicyV4Output> {
    const bucketName = process.env['PRIVATE_STORAGE_BUCKET_NAME'] || "cola-dev-private";
    const bucket = cloudStorage.bucket(bucketName);

    const file = bucket.file(`${directoryPath}/${fileName}`);
    // These options will allow temporary uploading of a file
    // through an HTML form.
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 120 * 60 * 1000, // 2 hours
    };

    const [response] = await file.generateSignedPostPolicyV4(options);
    console.log(response);
    return response;
  }
}
