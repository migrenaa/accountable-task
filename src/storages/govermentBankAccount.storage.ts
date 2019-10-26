import { GovermentBankAccountSchema } from "../schemas";
import { LoggerService } from "../services";
import { GovermentBankAccount } from "../models";
import { injectable } from "inversify";


@injectable()
export class GovermentBankAccountStorage {
  constructor(private logger: LoggerService) {
    this.create();
  }

  // use async await
  private async create(): Promise<void> {
    try {
      let bankAccount: GovermentBankAccount;
      bankAccount = await this.get();
      if (bankAccount) {
        return;
      } else {
        bankAccount = {
          amount: "0",
          dateUpdated: undefined
        };
      }

      this.logger.info("Creating a goverment bank account entity");
      const newBankAccount = new GovermentBankAccountSchema(bankAccount);
      newBankAccount.save();
    } catch (error) {
      this.logger.error(`Error creating bank account: ${error}`);
      Promise.reject(error);
    }
  }


  public async updateAmount(amount: string): Promise<void> {
    try {
        return await GovermentBankAccountSchema.findOneAndUpdate(
            {
                
            },
            {
                $set: {
                    amount: amount
                }
            },
            {
                new: true
            }
        ).exec();
    } catch (error) {
        this.logger.error(`Could not update the bank account. Error: ${error}`);
        throw error;
    }
}

  public async get(): Promise<GovermentBankAccount> {
    let result: Promise<GovermentBankAccount> = undefined;

    try {
      result = await GovermentBankAccountSchema.findOne().exec();
    } catch (error) {
      const errorMsg = `Cannot obtain data. Error: ${error}`;
      result = Promise.reject(new Error(errorMsg));
    }
    return result;
  }
}