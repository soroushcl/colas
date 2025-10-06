import { User } from "src/authentication";
import { Dog, protein } from "./Dog";

export interface Recipe {
    id: string;
    protein: protein;
    dog: Dog['id'];
    owner: User['id'];
    ingredients: RecipeIngredient[];
    digestibleProtein: number; // unit: Percentage
    crudeProtein: number; // unit: Percentage
    metabolizableEnergy: number; //unit: Mj/kg
    ME: number; // unit: Kcal/kg
    fiber: string; // e.g: Max 2%
    fat: string; // e.g : Min 3%
    weight: number;
    calorie: number; // ME * Weight
    recipeDog?: Dog,
    price?: Number,
}


export interface Ingredient {
    id: string;
    name: string;
    apiName: string;
}

export interface RecipeIngredient {
    ingredient: Ingredient['name'];
    amount: number;
}