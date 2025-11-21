import { Recipe } from "./Recipe";
import { Subscription } from "./Subscription";

export interface Dog {
    id: string;
    owner: string;
    name: string;
    weight: number;
    breed: string;
    age: Date;
    gender: gender;
    isNeutered: boolean;
    isPregnant: boolean;
    pregnancyDuration: number;
    isNursing: boolean;
    hasHealthIssue: boolean;
    healthIssue: healthIssue[];
    nursingPuppies: number;
    activityLevel: activityLevel;
    eating: eatingHabit;
    shape: shape;
    isAllergic: boolean;
    allergies: allergy[];
    proteins: protein[];
    calorie?: number;
    note?: string;
    status?: dogStatus;
    recipes: Recipe['id'][];
    subscription?: Subscription;
}
export interface EditDog {
    mainDog: string;
    id: string;
    owner: string;
    name: string;
    weight: number;
    breed: string;
    age: Date;
    gender: gender;
    isNeutered: boolean;
    isPregnant: boolean;
    pregnancyDuration: number;
    isNursing: boolean;
    hasHealthIssue: boolean;
    healthIssue: healthIssue[];
    nursingPuppies: number;
    activityLevel: activityLevel;
    eating: eatingHabit;
    shape: shape;
    isAllergic: boolean;
    allergies: allergy[];
    proteins: protein[];
    calorie?: number;
    note?: string;
    status?: dogStatus;
    recipes: Recipe[];
    subscription?: Subscription;
}
export enum gender {
    male = "Male",
    female = "Female",
}
export enum activityLevel {
    low = "Low",
    normal = "Normal",
    high = "High",
}
export enum eatingHabit {
    picky = "Picky eater",
    good = "Good eater",
    great = "Great eater",
}
export enum healthIssue {
    pancreatitis = "History of Pancreatitis",
    digestive = "Digestive issues",
    kidney = "Kidney disease",
    cancer = "Cancer",
    heart = "Heart disease",
    diarrhea = "Diarrhea",
    intestinal = "Intestinal parasites",
}
export enum allergy {
    beef = "Beef",
    chicken = "Chicken",
    salmon = "Salmon",
    turkey = "Turkey",
    egg = "Egg",
    fish = "Fish oil",
    rice = "Rice",
    peanut = "Peanut",
    lentils = "Lentils",
    beans = "Beans",
}
export enum shape {
    underweight = "Underweight",
    fit = "Fit",
    overweight = "Overweight",
}
export enum protein {
    beef = "Beef",
    chicken = "Chicken",
    salmon = "Salmon",
    // turkey = "Turkey",
}
export enum dogStatus {
    active = "active",
    canceled = "canceled",
    paused = "paused",
    new = "new",
}

export enum dogLifeStage {
    puppy = "Puppy",
    adult = "Adult",
    senior = "Senior",
}

// export interface Dog {
//     owner: string;
//     name: string;
//     weight: string;
//     breed: string;
//     age: Date;
//     gender: gender;
//     isNeutered: boolean;
//     isPregnant: boolean;
//     pregnancyDuration?: number;
//     isNursing: boolean;
//     hasHealthIssue: boolean;
//     healthIssue?: healthIssue[];
//     nursingPuppies?: number;
//     activityLevel: activityLevel;
//     eating: eatingHabit;
//     shape: shape;
//     isAllergic: boolean;
//     allergies?: allergy[];
//     proteins: protein[];
// }

// export function getDog(dog: Dog): Dog {
//     const {
//         owner,
//         name,
//         weight,
//         breed,
//         age,
//         gender,
//         isNeutered,
//         isPregnant,
//         pregnancyDuration,
//         isNursing,
//         hasHealthIssue,
//         healthIssue,
//         nursingPuppies,
//         activityLevel,
//         eating,
//         shape,
//         isAllergic,
//         allergies,
//         proteins,
//     } = dog;
//     return {
//         owner,
//         name,
//         weight,
//         breed,
//         age,
//         gender,
//         isNeutered,
//         isPregnant,
//         pregnancyDuration,
//         isNursing,
//         hasHealthIssue,
//         healthIssue,
//         nursingPuppies,
//         activityLevel,
//         eating,
//         shape,
//         isAllergic,
//         allergies,
//         proteins,
//     };
// }

