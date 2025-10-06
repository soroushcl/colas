import express from "express";
import { breedHandlerFactory } from "./breedHandler.js";
import { BreedRepository } from "./repositories/index.js";

export const breedRouterFactory = (breedRepo: BreedRepository) => {
    const router = express.Router();
    const breedHandler = breedHandlerFactory(breedRepo);

    router.get('/breeds', breedHandler.getBreeds);

    return router;
};
