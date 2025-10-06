import { RequestHandler } from "express";
import { BreedListResponse, Success, Fail } from "c-lib";
import { BreedRepository } from "./repositories/index.js";

export const breedHandlerFactory = (breedRepo: BreedRepository) => {
    const getBreeds: RequestHandler = async (req, res) => {
        try {
            const breeds = await breedRepo.getAllBreeds();
            const response: BreedListResponse = {
                breeds: [...breeds].sort((a, b) => a.name.localeCompare(b.name))
            };
            res.json(Success(response));
        } catch (error) {
            console.error('Error fetching breeds:', error);
            res.status(500).json(Fail(new Error('Failed to fetch breeds').toString()));
        }
    };

    return {
        getBreeds
    };
};
