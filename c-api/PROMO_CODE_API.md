# Promo Code API

## Overview
The Promo Code API allows you to validate and retrieve discount information for promotional codes.

## Endpoint
`POST /stripe/apply-promocode`

## Request Body
```json
{
  "promoCode": "string"
}
```

## Response
### Success Response (200)
```json
{
  "discount": 20
}
```
- `discount`: The percentage discount (0-100)

### Error Response (200)
```json
{
  "err": "Promo code is not valid."
}
```
- `err`: Error message describing why the promo code is invalid

## Error Messages
- "Promo code is required." - When no promo code is provided
- "Promo code is not valid." - When the promo code doesn't exist in the database
- "Promo code is not active." - When the promo code exists but is inactive in Stripe
- "Failed to apply promo code." - When there's a server error

## Database Requirements
The API requires a MongoDB collection called "PromoCodes" with documents following this structure:
```json
{
  "_id": "ObjectId",
  "id": "string",
  "code": "string",
  "stripeCouponId": "string",
  "stripePromoCodeId": "string",
  "percentOff": 20,
  "amountOff": 0,
  "isActive": true,
  "onlyFirstTime": false,
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "couponId": "string"
}
```

## Usage Example
```javascript
const response = await fetch('/stripe/apply-promocode', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    promoCode: 'SUMMER2024'
  })
});

const result = await response.json();
if (result.discount !== undefined) {
  console.log(`Discount: ${result.discount}%`);
} else {
  console.error('Error:', result.err);
}
```

## Implementation Notes
- The API converts promo codes to uppercase before searching
- It validates the promo code exists in the database
- It checks if the corresponding Stripe promotion code is active
- Returns the percentage discount from the Stripe coupon
- Requires STRIPE_SECRET_KEY environment variable to be set
