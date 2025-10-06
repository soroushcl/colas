
export abstract class PaymentRepository {
  abstract createPaymentIntent(amount: number, currency: string): Promise<string> | Promise<never> ;
 
}
