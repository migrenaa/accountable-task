import * as mongoose from "mongoose";
import { InhabitantSchema } from "../schemas/inhabitant.schema";
import { LoggerService } from "../services";
import { Inhabitant, CreateInhabitantModel } from "../models";
import { injectable } from "inversify";

// Mongoose bug - it is using mpromise, if it's not specified
(<any>mongoose).Promise = global.Promise;

export class StorageExistsError extends Error {}

@injectable()
export class InhabitantStorage {
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
  public async create(inhabitant: Inhabitant): Promise<Inhabitant> {
    let result: Promise<Inhabitant> = undefined;

    try {
      const newInhabitant = new InhabitantSchema(inhabitant);
      const inhabitantSaved = newInhabitant.save();
      result = inhabitantSaved;
    } catch (error) {
      result = Promise.reject(error);
    }

    return result;
  }

  public async getByID(id: string): Promise<Inhabitant> {
    return this.getByFilter("id", id);
  }

  public async getByFilter(filterProperty: string, filterValue: string): Promise<Inhabitant> {
    let result: Promise<Inhabitant> = undefined;

    try {
      const filter: any = {};
      filter[filterProperty] = { $in: [filterValue] };
      result = InhabitantSchema.findOne(filter).exec();
    } catch (error) {
      const errorMsg = `Cannot obtain user ${filterValue}. Error: ${error}`;
      result = Promise.reject(new Error(errorMsg));
    }

    return result;
  }

  public async getAll(): Promise<Inhabitant[]> {
    let result: Promise<Inhabitant[]> = undefined;

    try {
      const tmpres = await InhabitantSchema.find({}).exec();
      result = Promise.resolve(tmpres);
    } catch (error) {
      const errorMsg = `Error: ${error}`;
      result = Promise.reject(new Error(errorMsg));
    }

    return result;
  }

  public async deleteAll(): Promise<void> {
    try {
      await InhabitantSchema.deleteMany({}).exec();
    } catch (err) {
      throw new Error(
        "couldn't remove all providers from provider storage: " + JSON.stringify(err)
      );
    }
  }
}
