import { Success, Fail } from '../index';
import { paymentIntentResponseBody, paymentIntentRequestBody } from '../../payment';

export type createPaymentIntentResponseBody = Success<paymentIntentResponseBody> | Fail;

export interface createPaymentIntentRequestBody extends paymentIntentRequestBody {}
