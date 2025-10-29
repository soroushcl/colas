if (process.env.NODE_ENV === "local") {
  await import("dotenv/config");
}
import express from 'express';
import cors from 'cors';
import repositoryFactory from './repositoryFactory.js';
import { authenticationRouterFactory, authenticationHandlerFactory } from "@auth/index.js";
import { breedRouterFactory } from './breeds/breedRouterFactory.js';
import { paymentRouterFactory } from './payment/paymentRouterFactory.js';
import { StripePaymentRepository } from './payment/repositories/StripePaymentRepository.js';

// import {

//   sampleModuleViewsHandler, sampleModuleViewsRouterFactory,

// } from "./sampleModule";

const corsOptions = {
  origin: process.env['ALLOWED_ORIGINS'] || ['https://api-v2.colaskitchen.com', 'http://localhost:3000'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  exposedHeaders: 'Set-Cookie',
  credentials: true
}

const app = express();

app.use(cors(corsOptions));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }))

repositoryFactory().then(repositories => {
  // Authentication
  const { authViews, authDependencies, authMiddleware } = authenticationHandlerFactory(repositories.userRepo, repositories.dogRepo, repositories.orderRepo, repositories.recipeRepo, repositories.subscriptionRepo, repositories.stripeCustomerRepo);

  if (authDependencies) authDependencies
    .forEach(dep => app.use(dep));

  app.use(authMiddleware);
  app.use('/authentication', authenticationRouterFactory(authViews));

  // Breeds API
  app.use('/api', breedRouterFactory(repositories.breedRepo));

  // Payments API
  const stripeSecret = process.env['STRIPE_SECRET_KEY'] || '';
  if (!stripeSecret) {
    console.warn('STRIPE_SECRET not set; /stripe endpoints disabled');
  } else {
    const paymentRepo = new StripePaymentRepository(stripeSecret);
    app.use('/stripe', paymentRouterFactory(paymentRepo, repositories.promoCodeRepo, stripeSecret));
  }

  // const {sampleModuleViews} = sampleModuleViewsHandler(repositories.sampleModuleRepo);
  // app.use('/sample-module', sampleModuleViewsRouterFactory(sampleModuleViews));


  const port = process.env.API_PORT || 4000;

  app.listen(
    port,
    () => console.log(`API online on port ${port}`)
  );
})
  .catch(e => {
    console.log(e)
  })

