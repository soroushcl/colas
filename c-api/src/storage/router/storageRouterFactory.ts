import express from "express";
// import {authorize} from "@utils/authorize";
// import {userType} from "c-lib";
import {storageRouterFactoryViews} from "../storageTypes.js";
// import {authorize} from "@utils/email: 'omid@colaskitchen.com'authorize";
// import {userType} from "c-lib";

export const storageRouterFactory = (views: storageRouterFactoryViews) => {
  const router = express.Router();


  // router.post('/download-files',  authorize([userType.cola_admin, userType.cola_user, userType.customer_admin, userType.customer_user]), views.downloadFile);
  router.post('/download-files', views.downloadFile);


  return router;
}