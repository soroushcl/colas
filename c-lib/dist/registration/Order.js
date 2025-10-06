export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["active"] = "active";
    OrderStatus["uncollectible"] = "uncollectible";
    OrderStatus["tempPaymentFailed"] = "tempPaymentFailed";
    OrderStatus["trialing"] = "trialing";
    OrderStatus["aggregation"] = "aggregation";
    OrderStatus["preparation"] = "preparation";
    OrderStatus["packaging"] = "packaging";
    OrderStatus["shipped"] = "shipped";
    OrderStatus["canceled"] = "canceled";
    OrderStatus["paused"] = "paused";
    OrderStatus["skipped"] = "skipped";
    OrderStatus["delivered"] = "delivered";
})(OrderStatus || (OrderStatus = {}));
export var Carrier;
(function (Carrier) {
    Carrier["fedex"] = "fedex";
    Carrier["purolator_ca"] = "purolator_ca";
    Carrier["tyltgo"] = "tyltgo";
    Carrier["flashbox"] = "flashbox";
    Carrier["colaskitchen"] = "colaskitchen";
})(Carrier || (Carrier = {}));
export var Service;
(function (Service) {
    Service["fedex_ground"] = "fedex_ground";
    Service["fedex_economy"] = "fedex_economy";
    Service["fedex_standard_overnight"] = "fedex_standard_overnight";
    Service["fedex_priority_overnight"] = "fedex_priority_overnight";
    Service["fedex_first_overnight"] = "fedex_first_overnight";
    Service["purolator_express"] = "purolator_express";
    Service["purolator_ground"] = "purolator_ground";
    Service["same_day_delivery"] = "same_day_delivery";
    Service["next_day_delivery_commercial_addresses"] = "next_day_delivery_commercial_addresses";
})(Service || (Service = {}));
export var PackageCode;
(function (PackageCode) {
    PackageCode["ck_1"] = "ck_1";
    PackageCode["ck_2"] = "ck_2";
})(PackageCode || (PackageCode = {}));
//# sourceMappingURL=Order.js.map