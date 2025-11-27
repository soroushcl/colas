import { Success, Fail } from '../index';
import { paymentIntentResponseBody, paymentIntentRequestBody } from '../../payment';
export type createPaymentIntentResponseBody = Success<paymentIntentResponseBody> | Fail;
export interface createPaymentIntentRequestBody extends paymentIntentRequestBody {
}
export interface changeCardRequestBody {
    paymentMethodId: string;
}
export type changeCardResponseBody = Success<true> | Fail;
export interface getInvoiceRequestBody {
    invoiceNumber: string;
}
export type getInvoiceResponseBody = Success<{
    price: string;
    url: string;
}> | Fail;
