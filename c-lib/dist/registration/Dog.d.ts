import { Recipe } from "./Recipe";
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
}
export declare enum gender {
    male = "Male",
    female = "Female"
}
export declare enum activityLevel {
    low = "Low",
    normal = "Normal",
    high = "High"
}
export declare enum eatingHabit {
    picky = "Picky eater",
    good = "Good eater",
    great = "Great eater"
}
export declare enum healthIssue {
    pancreatitis = "History of Pancreatitis",
    digestive = "Digestive issues",
    kidney = "Kidney disease",
    cancer = "Cancer",
    heart = "Heart disease",
    diarrhea = "Diarrhea",
    intestinal = "Intestinal parasites"
}
export declare enum allergy {
    beef = "Beef",
    chicken = "Chicken",
    salmon = "Salmon",
    turkey = "Turkey",
    egg = "Egg",
    fish = "Fish oil",
    rice = "Rice",
    peanut = "Peanut",
    lentils = "Lentils",
    beans = "Beans"
}
export declare enum shape {
    underweight = "Underweight",
    fit = "Fit",
    overweight = "Overweight"
}
export declare enum protein {
    beef = "Beef",
    chicken = "Chicken",
    salmon = "Salmon"
}
export declare enum dogStatus {
    active = "active",
    canceled = "canceled",
    paused = "paused",
    new = "new"
}
export declare enum dogLifeStage {
    puppy = "Puppy",
    adult = "Adult",
    senior = "Senior"
}
