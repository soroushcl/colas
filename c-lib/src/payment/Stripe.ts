import { Fail, Success } from "src/requests";

export type paymentIntentResponseBody = Success<{ clientSecret: string }> | Fail;


export interface paymentIntentRequestBody {
  amount: number;
  currency: string
}