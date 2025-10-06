import { PromoCodeRepository } from './PromoCodeRepository.js';
import { PromoCode } from 'c-lib';
import { Collection, Db } from "mongodb";
import { fromMongo } from "@utils/mongoUtils.js";

export class PromoCodeMongoRepository extends PromoCodeRepository {
  private promoCodeCollection: Collection;

  constructor(db: Db, collectionName: string) {
    super();
    this.promoCodeCollection = db.collection(collectionName);
  }

  async findPromoCodeByCode(code: string): Promise<PromoCode | null> {
    const mongoPromoCode = await this.promoCodeCollection.findOne({ code: code.toUpperCase() });
    if (!mongoPromoCode) return null;
    return fromMongo<PromoCode>(mongoPromoCode as any);
  }
}
