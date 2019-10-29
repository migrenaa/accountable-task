import { LoggerService } from "../services";
import { Request, Response } from "express";
import { injectable } from "inversify";
import { GovermentBankAccountStorage } from "../storages";

@injectable()
export class GovermentBankAccountController {
  constructor(
    private loggerService: LoggerService,
    private bankAccountStorage: GovermentBankAccountStorage
  ) { }

  /**
   * @swagger
   * /govermentBankAccount:
   *  get:
   *      description: Gets the goverments bank account balance balance
   *      tags:
   *          - GovermentBankAccount
   *      produces:
   *          - application/json
   *      responses:
   *          200:
   *              description: OK
   *          500:
   *              description: Server error
   */
  public get = async (req: Request, res: Response) => {
    try {
      const response = await this.bankAccountStorage.get();
      res.status(200).send(response);
    } catch (err) {
      this.loggerService.error(err);
      res.status(500).send({ error: "Something went wrong, please try again later." });
    }
  }
}

