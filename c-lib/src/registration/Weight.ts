import { User } from "src/authentication";
import { Dog } from "./Dog";

export interface Weight {
    weight: number;
    userId: User['id']
    dog: Dog['id']
    id: string;
    createdAt: Date;
    updatedAt: Date;
}