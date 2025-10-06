import { User } from "src/authentication";
import { Dog, protein } from "./Dog";
export interface Recipe {
    id: string;
    protein: protein;
    dog: Dog['id'];
    owner: User['id'];
    ingredients: RecipeIngredient[];
    digestibleProtein: number;
    crudeProtein: number;
    metabolizableEnergy: number;
    ME: number;
    fiber: string;
    fat: string;
    weight: number;
    calorie: number;
    recipeDog?: Dog;
    price?: Number;
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
