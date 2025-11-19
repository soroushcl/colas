import {Dog, Recipe, User} from 'c-lib';

export abstract class RecipeRepository {
  abstract addRecipe(recipe: Recipe): Promise<Recipe> | Promise<never>;
  abstract generateRecipes(dog: Dog): Promise<Recipe[]> | Promise<never>;
  abstract findRecipeById(id: Recipe['id']): Promise<Recipe> | Promise<never>;
  abstract findRecipesByUserId(userId: User['id']): Promise<Recipe[]> | Promise<never>;
  abstract updateDogRecipes(dog: Dog, versionNumber: number): Promise<{ success: boolean, error?: string }> | Promise<never>;

}
