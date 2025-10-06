import { Breed } from 'c-lib';

export abstract class BreedRepository {
  abstract getAllBreeds(): Promise<Breed[]> | Promise<never>;
  abstract getBreedByName(name: string): Promise<Breed | null> | Promise<never>;
  // abstract addBreed(breed: Breed): Promise<Breed> | Promise<never>;
  // abstract updateBreed(breed: Breed): Promise<Breed | null> | Promise<never>;
  // abstract deleteBreed(id: string): Promise<boolean> | Promise<never>;
}
