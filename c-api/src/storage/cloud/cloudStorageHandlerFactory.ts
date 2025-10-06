import {CloudStorageHandler} from "./CloudStorageHandler.js";
import {googleCloudStorage} from "./google/googleCloudStorage.js";

export const cloudStorageHandlerFactory = (storageType: 'google' | 'aws'): CloudStorageHandler => {
  if (storageType === 'google'){
    return new googleCloudStorage();
  }
  else{
    return new googleCloudStorage();
  }
}