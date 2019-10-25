import * as mongoose from "mongoose";
import { OfferSchema } from "../schemas";
import { LoggerService } from "../services";
import { Offer } from "../models";
import { injectable } from "inversify";
import { v4 as uuid } from "uuid";

// Mongoose bug - it is using mpromise, if it's not specified
(<any>mongoose).Promise = global.Promise;

@injectable()
export class OfferStorage {
  constructor(private logger: LoggerService) {
    this.initDbConnection(process.env.MONGODB_CONNECTION_STRING);
  }

  protected initDbConnection(connectionString: string): void {
    mongoose.connect(connectionString, { useNewUrlParser: true }, (err: any) => {
      if (err) {
        throw err;
      } else {
        this.logger.info("Mongoose connection established!");
      }
    });
    this.logger.info("MongoDB service init");
  }

  // use async await
  public async create(offer: Offer): Promise<Offer> {
    let result: Promise<Offer> = undefined;

    try {
      const newOffer = new OfferSchema(offer);
      const offerSaved = newOffer.save();
      result = offerSaved;
    } catch (error) {
      result = Promise.reject(error);
    }

    return result;
  }

  public async getByID(uuid: string): Promise<Offer> {
    return this.getByFilter("uuid", uuid);
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
                id: offer.uuid
            },
            {
                $set: {
                  isOpen: false
                }
            }
        ).exec();
    } catch (error) {
        this.logger.error(`Could not update offer ${offer.uuid}. Error: ${error}`);
        throw error;
    }
}
}
