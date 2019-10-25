import * as mongoose from "mongoose";
import { TransactionSchema } from "../schemas";
import { LoggerService } from "../services";
import { Transaction } from "../models";
import { injectable } from "inversify";
import { v4 as uuid } from "uuid";


// Mongoose bug - it is using mpromise, if it's not specified
(<any>mongoose).Promise = global.Promise;

@injectable()
export class TransactionStorage {
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
  public async create(transaction: Transaction): Promise<Transaction> {
    let result: Promise<Transaction> = undefined;

    try {
      const newTransaction = new TransactionSchema(transaction);
      const transactionSaved = newTransaction.save();
      result = transactionSaved;
    } catch (error) {
      result = Promise.reject(error);
    }

    return result;
  }

  public async getByID(id: string): Promise<Transaction> {
    return this.getByFilter("id", id);
  }

  public async getByBuyerId(buyerId: string, limit: number): Promise<Transaction[]> {
    let result: Promise<Transaction[]> = undefined;

    try {
      result = await TransactionSchema.find({buyerId: buyerId}, null, { sort: { dateTraded: -1 }, limit: limit }).exec();
    } catch (error) {
      const errorMsg = `Cannot obtain data. Error: ${error}`;
      result = Promise.reject(new Error(errorMsg));
    }

    return result;
  }


  public async getBySellerId(sellerId: string, limit: number): Promise<Transaction[]> {
    let result: Promise<Transaction[]> = undefined;

    try {
      result = await TransactionSchema.find({sellerId: sellerId}, null, { sort: { dateTraded: -1 }, limit: limit }).exec();
    } catch (error) {
      const errorMsg = `Cannot obtain data. Error: ${error}`;
      result = Promise.reject(new Error(errorMsg));
    }

    return result;
  }

  public async getByFilter(filterProperty: string, filterValue: string): Promise<Transaction> {
    let result: Promise<Transaction> = undefined;

    try {
      const filter: any = {};
      filter[filterProperty] = { $in: [filterValue] };
      result = TransactionSchema.findOne(filter).exec();
    } catch (error) {
      const errorMsg = `Cannot obtain user ${filterValue}. Error: ${error}`;
      result = Promise.reject(new Error(errorMsg));
    }

    return result;
  }

  public async getAll(): Promise<Transaction[]> {
    let result: Promise<Transaction[]> = undefined;

    try {
      const tmpres = await TransactionSchema.find({}).exec();
      result = Promise.resolve(tmpres);
    } catch (error) {
      const errorMsg = `Error: ${error}`;
      result = Promise.reject(new Error(errorMsg));
    }

    return result;
  }

  public async deleteAll(): Promise<void> {
    try {
      await TransactionSchema.deleteMany({}).exec();
    } catch (err) {
      throw new Error(
        "couldn't remove all providers from provider storage: " + JSON.stringify(err)
      );
    }
  }
}
