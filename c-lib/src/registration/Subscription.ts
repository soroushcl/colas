import { Dog } from "./Dog";
import { Recipe } from "./Recipe";

export interface Subscription {
    id: string;
    userId: Dog['owner'];
    dog: Dog['id'];
    shippingAddress: Address;
    status: subscriptionStatus;
    type: subscriptionType
    info: subscriptionInfo[]
    selectedRecipes: Dog['proteins']
    recurring: number
    recurringType: recurringType
    dogPrice: number
    discounts: {id: PromoCode['id'], discount: number}[];
    dailyPrice: number;
    priceVersion: PriceVersion['id'];
    isActive: boolean;
    weeklyPrices?: weeklyPrice[]
}

export interface Address {
    line1: string
    line2?: string
    postalCode: string,
    city: string
    state: string
    country: string
    phoneNumber: string
}

export interface PromoCode {
    id: string;
    code: string
    stripeCouponId: string,
    stripePromoCodeId: string
    percentOff: number
    amountOff: number
    isActive: boolean
    onlyFirstTime: boolean
    expiresAt: Date
    couponId: Coupon['id']
}

export enum couponType {
    percentOff = "PercentOff",
    amountOff = "AmountOff",
}

export enum recurringType {
    automated = "Automated",
    manual = "Manual",
}

export enum currency {
    CAD = "CAD",
}

export enum duration {
    once = "Once",
    forever = "Forever",
    repeating = "Repeating",
}

export enum subscriptionStatus {
    active = "Active",
    trialing = "Trialing",
    canceled = "Canceled",
    paused = "Paused",
}

export enum subscriptionType {
    full = "Full",
    half = "Half",
    topper = "Topper",
}

export interface subscriptionInfo {
    recipeId: Recipe['id']
    amount: number
}

export interface weeklyPrice {
    week: number
    price: number
}

export interface Coupon {
    id: string;
    name: string
    stripeCouponId: string
    type: couponType
    percentOff: number
    amountOff: number
    currency: currency
    duration: duration
    durationInMonths: number
}

export interface PriceVersion {
    id: string;
    versionNumber: number
    prices: CalorieRangePrice[]
    isActive: boolean
    updateTo: PriceVersion['id']
}

export interface CalorieRangePrice {
    id: string;
    calorieRange: CalorieRange['id']
    salmonPrice: number
    chikenPrice: number
    beefPrice: number
    versionNumber: number
}

export interface CalorieRange {
    id: string;
    name: string
    min: number
    max: number
}
