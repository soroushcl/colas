import { PromoCode } from 'c-lib';

export abstract class PromoCodeRepository {
  abstract findPromoCodeByCode(code: string): Promise<PromoCode | null>;
  abstract findPromoCodeById(code: string): Promise<PromoCode | null>;
}
