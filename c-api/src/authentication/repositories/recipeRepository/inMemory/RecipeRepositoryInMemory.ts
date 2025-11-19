import { RecipeRepository } from '../RecipeRepository';
import { Dog, Recipe, User } from 'c-lib';

export class RecipeRepositoryInMemory extends RecipeRepository {
  findRecipeById(id: Recipe['id']): Promise<Recipe> | Promise<never> {
    const recipe = this.db.find(r => r.id === id);
    if (!recipe) {
      return Promise.reject(new Error('Recipe not found'));
    }
    return Promise.resolve(recipe);
  }
  generateRecipes(dog: Dog): Promise<Recipe[]> | Promise<never> {
    console.log('In Memory generateRecipes dog', dog.name)
    throw new Error('Method not implemented.2');
  }
  addRecipe(recipe: Recipe): Promise<Recipe> | Promise<never> {
    return new Promise((resolve, reject) => {
      this.db.push(recipe as Recipe);
      resolve(recipe as Recipe);
    });
  }

  private db: Recipe[];

  constructor(db: Recipe[]) {
    super();
    this.db = db;
  }

  findRecipesByUserId(userId: User['id']): Promise<Recipe[]> | Promise<never> {
    return new Promise((resolve) => {
      resolve(this.db.filter(d => d.owner === userId));
    });
  }

  updateDogRecipes(dog: Dog, versionNumber: number): Promise<{ success: boolean, error?: string }> | Promise<never> {
    return new Promise((resolve) => {
      resolve({ success: true });
    });
  }

}