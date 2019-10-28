import { TransactionSchema } from "../schemas";
import { LoggerService } from "../services";
import { Transaction } from "../models";
import { injectable } from "inversify";
import { v4 as uuid } from "uuid";


@injectable()
export class TransactionStorage {
  constructor() {
  }

  // use async await
  public async create(transaction: Transaction): Promise<Transaction> {
    let result: Promise<Transaction> = undefined;

    try {
      const newTransaction = new TransactionSchema(transaction);
      // newTransaction.id = uuid();
      const transactionSaved = newTransaction.save();
      result = transactionSaved;
    } catch (error) {
      result = Promise.reject(error);
    }

    return result;
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
}
