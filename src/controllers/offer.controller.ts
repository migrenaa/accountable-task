import { LoggerService } from "../services";
import { Request, Response } from "express";
import { injectable } from "inversify";
import {  OfferStorage } from "../storages";

@injectable()
export class OfferController {
  constructor(
    private loggerService: LoggerService,
    private offerStorage: OfferStorage
  ) { }

  /**
   * @swagger
   * /offer:
   *  get:
   *      description: List opened offers
   *      tags:
   *          - Offer
   *      produces:
   *          - application/json
   *      responses:
   *          200:
   *              description: OK
   *          400:
   *              description: Invalid payload!
   *          500:
   *              description: Server error
   */
  public getOpened = async (req: Request, res: Response) => {
    this.loggerService.verbose(`[getOpened] Fetching a list of opened offers.`);

    try {
      const offers = await this.offerStorage.getOpened();
      res.status(200).send({ offers: offers});
    } catch (err) {
      this.loggerService.error(err);
      res.status(500).send({ error: "Something went wrong, please try again later." });
    }
  }
}

