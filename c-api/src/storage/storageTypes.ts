import {RequestHandler} from "express";

export interface storageRouterFactoryViews {
  downloadFile: RequestHandler;
}

export interface StorageHandler {
  views: {
    downloadFile: RequestHandler;
  }
}