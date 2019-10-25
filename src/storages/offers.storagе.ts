import { OfferSchema } from "../schemas";
import { LoggerService } from "../services";
import { Offer } from "../models";
import { injectable } from "inversify";
import { v4 as uuid } from "uuid";


@injectable()
export class OfferStorage {
  constructor(private logger: LoggerService) {
  }

  // use async await
  public async create(offer: Offer): Promise<Offer> {
    let result: Promise<Offer> = undefined;

    try {
      const newOffer = new OfferSchema(offer);
      // newOffer.id = uuid();
      const offerSaved = newOffer.save();
      result = offerSaved;
    } catch (error) {
      result = Promise.reject(error);
    }

    return result;
  }

  public async getByID(id: string): Promise<Offer> {
    return this.getByFilter("id", id);
  }

  public async getByFilter(filterProperty: string, filterValue: string): Promise<Offer> {
    let result: Promise<Offer> = undefined;

    try {
      const filter: any = {};
      filter[filterProperty] = { $in: [filterValue] };
      result = OfferSchema.findOne(filter).exec();
    } catch (error) {
      const errorMsg = `Cannot obtain user ${filterValue}. Error: ${error}`;
      result = Promise.reject(new Error(errorMsg));
    }

    return result;
  }

  public async getAll(): Promise<Offer[]> {
    let result: Promise<Offer[]> = undefined;

    try {
      const tmpres = await OfferSchema.find({}).exec();
      result = Promise.resolve(tmpres);
    } catch (error) {
      const errorMsg = `Error: ${error}`;
      result = Promise.reject(new Error(errorMsg));
    }

    return result;
  }

  public async closeOffer(offer: Offer): Promise<Offer> {
    try {
      return await OfferSchema.findOneAndUpdate(
        {
          id: offer.id
        },
        {
          $set: {
            isOpen: false,
          }
        },
        {
          new: true
        }
      ).exec();
    } catch (error) {
      this.logger.error(`Could not update offer ${offer.id}. Error: ${error}`);
      throw error;
    }
  }
}
