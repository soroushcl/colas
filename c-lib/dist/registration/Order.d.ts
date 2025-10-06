import { Dog } from "./Dog";
import { Address, Subscription } from "./Subscription";
export interface Order {
    id: string;
    userId: Dog['owner'];
    dog: Dog['id'];
    subscriptionId: Subscription['id'];
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    shippingAddress: Address;
    shippingDate?: Date;
    shippingTrackingNumber?: string;
    shipmentId?: string;
    invoiceNumber?: string;
    price: number;
    amountPaid?: number;
    status: OrderStatus;
    detail: OrderDetail;
    carrier?: Carrier;
    service?: Service;
    packageCode?: PackageCode;
    packageWeight?: number;
    shipmentDate?: Date;
    labelPdf?: string;
    deliveryProofPicture?: string;
    deliveryProofPictureDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}
export declare enum OrderStatus {
    active = "active",
    uncollectible = "uncollectible",
    tempPaymentFailed = "tempPaymentFailed",
    trialing = "trialing",
    aggregation = "aggregation",
    preparation = "preparation",
    packaging = "packaging",
    shipped = "shipped",
    canceled = "canceled",
    paused = "paused",
    skipped = "skipped",
    delivered = "delivered"
}
export interface OrderDetail {
    type: Subscription['type'];
    info: Subscription['info'];
    promoCode?: string;
    dailyPrice: number;
    selectedRecipes: Subscription['selectedRecipes'];
    recurring: number;
}
export declare enum Carrier {
    fedex = "fedex",
    purolator_ca = "purolator_ca",
    tyltgo = "tyltgo",
    flashbox = "flashbox",
    colaskitchen = "colaskitchen"
}
export declare enum Service {
    fedex_ground = "fedex_ground",
    fedex_economy = "fedex_economy",
    fedex_standard_overnight = "fedex_standard_overnight",
    fedex_priority_overnight = "fedex_priority_overnight",
    fedex_first_overnight = "fedex_first_overnight",
    purolator_express = "purolator_express",
    purolator_ground = "purolator_ground",
    same_day_delivery = "same_day_delivery",
    next_day_delivery_commercial_addresses = "next_day_delivery_commercial_addresses"
}
export declare enum PackageCode {
    ck_1 = "ck_1",
    ck_2 = "ck_2"
}
