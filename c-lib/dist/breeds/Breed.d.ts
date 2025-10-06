export interface Breed {
    id: string;
    name: string;
    size: BreedSize;
    breedInfo: {
        male: {
            height: {
                min: number;
                max: number;
            };
            weight: {
                min: number;
                max: number;
                avg: number;
            };
        };
        female: {
            height: {
                min: number;
                max: number;
            };
            weight: {
                min: number;
                max: number;
                avg: number;
            };
        };
    };
    adultAgeInMonth: number;
    seniorAgeInMonth: number;
}
export interface BreedListResponse {
    breeds: Breed[];
}
export interface BreedListRequestBody {
}
export declare enum BreedSize {
    small = "Small",
    medium = "Medium",
    large = "Large"
}
export interface GrowthPattern {
    id: string;
    name: string;
    minWeight: string;
    maxWeight: string;
    petternInfo: PatternInfo[];
}
export interface PatternInfo {
    month: number;
    coef: number;
}
