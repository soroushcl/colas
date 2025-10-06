export var gender;
(function (gender) {
    gender["male"] = "Male";
    gender["female"] = "Female";
})(gender || (gender = {}));
export var activityLevel;
(function (activityLevel) {
    activityLevel["low"] = "Low";
    activityLevel["normal"] = "Normal";
    activityLevel["high"] = "High";
})(activityLevel || (activityLevel = {}));
export var eatingHabit;
(function (eatingHabit) {
    eatingHabit["picky"] = "Picky eater";
    eatingHabit["good"] = "Good eater";
    eatingHabit["great"] = "Great eater";
})(eatingHabit || (eatingHabit = {}));
export var healthIssue;
(function (healthIssue) {
    healthIssue["pancreatitis"] = "History of Pancreatitis";
    healthIssue["digestive"] = "Digestive issues";
    healthIssue["kidney"] = "Kidney disease";
    healthIssue["cancer"] = "Cancer";
    healthIssue["heart"] = "Heart disease";
    healthIssue["diarrhea"] = "Diarrhea";
    healthIssue["intestinal"] = "Intestinal parasites";
})(healthIssue || (healthIssue = {}));
export var allergy;
(function (allergy) {
    allergy["beef"] = "Beef";
    allergy["chicken"] = "Chicken";
    allergy["salmon"] = "Salmon";
    allergy["turkey"] = "Turkey";
    allergy["egg"] = "Egg";
    allergy["fish"] = "Fish oil";
    allergy["rice"] = "Rice";
    allergy["peanut"] = "Peanut";
    allergy["lentils"] = "Lentils";
    allergy["beans"] = "Beans";
})(allergy || (allergy = {}));
export var shape;
(function (shape) {
    shape["underweight"] = "Underweight";
    shape["fit"] = "Fit";
    shape["overweight"] = "Overweight";
})(shape || (shape = {}));
export var protein;
(function (protein) {
    protein["beef"] = "Beef";
    protein["chicken"] = "Chicken";
    protein["salmon"] = "Salmon";
    protein["turkey"] = "Turkey";
})(protein || (protein = {}));
export var dogStatus;
(function (dogStatus) {
    dogStatus["active"] = "active";
    dogStatus["canceled"] = "canceled";
    dogStatus["paused"] = "paused";
    dogStatus["new"] = "new";
})(dogStatus || (dogStatus = {}));
export var dogLifeStage;
(function (dogLifeStage) {
    dogLifeStage["puppy"] = "Puppy";
    dogLifeStage["adult"] = "Adult";
    dogLifeStage["senior"] = "Senior";
})(dogLifeStage || (dogLifeStage = {}));
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
//# sourceMappingURL=Dog.js.map