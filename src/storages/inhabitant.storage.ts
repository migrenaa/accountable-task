import { InhabitantSchema } from "../schemas/inhabitant.schema";
import { LoggerService } from "../services";
import { Inhabitant } from "../models";
import { injectable } from "inversify";
import { v4 as uuid } from "uuid";

@injectable()
export class InhabitantStorage {
  constructor(private logger: LoggerService) {
  }

  // use async await
  public async create(inhabitant: Inhabitant): Promise<Inhabitant> {
    let result: Promise<Inhabitant> = undefined;

    try {
      const newInhabitant = new InhabitantSchema(inhabitant);
      newInhabitant.id = uuid();
      const inhabitantSaved = newInhabitant.save();
      result = inhabitantSaved;
    } catch (error) {
      result = Promise.reject(error);
    }

    return result;
  }

  
  public async update(inhabitant: Inhabitant): Promise<Inhabitant> {
    try {
        return await InhabitantSchema.findOneAndUpdate(
            {
                id: inhabitant.id
            },
            {
                $set: {
                    name: inhabitant.name,
                    balance: inhabitant.balance,
                    products: inhabitant.products
                }
            },
            {
                new: true
            }
        ).exec();
    } catch (error) {
        this.logger.error(`Could not update inhabitant ${inhabitant.id}. Error: ${error}`);
        throw error;
    }
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
