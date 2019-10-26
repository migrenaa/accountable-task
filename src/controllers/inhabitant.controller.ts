import { LoggerService, OfferService } from "../services";
import { Request, Response } from "express";
import { injectable } from "inversify";
import { InhabitantStorage } from "../storages";
import { Inhabitant, Offer } from "../models";

@injectable()
export class InhabitantController {
  constructor(
    private loggerService: LoggerService,
    private inhabitantStorage: InhabitantStorage,
    private offerService: OfferService
  ) { }

  /**
   * @swagger
   * /inhabitant:
   *  post:
   *      description: Creates an inhabitant
   *      parameters:
   *          - name: Inhabitant
   *            type: Inhabitant
   *            in: body
   *            schema:
   *               $ref: '#/definitions/Inhabitant'
   *      tags:
   *          - Inhabitant
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
  public create = async (req: Request, res: Response) => {
    const inhabitant: Inhabitant = req.body;
    if (!inhabitant) {
      this.loggerService.error(`[create] Invalid payload.`);
      return res.status(400).send({ error: "Invalid payload!" });
    }

    this.loggerService.verbose(`[create] Creating inhabitant.`);

    try {
      const newInhabitant = await this.inhabitantStorage.create(inhabitant);
      return res.status(201).send({ id: newInhabitant.id });
    } catch (err) {
      this.loggerService.error(err);
      res.status(500).send({ error: "Something went wrong, please try again later." });
    }
  }


  /**
   * @swagger
   * /inhabitant/{inhabitantId}/offers:
   *  post:
   *      description: Inhabintant places an offer
   *      parameters:
   *          - name: Offer
   *            type: Offer
   *            in: body
   *            schema:
   *               $ref: '#/definitions/Offer'
   *      tags:
   *          - Inhabitant
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
  public placeOffer = async (req: Request, res: Response) => {
    const offer: Offer = req.body;
    if (!offer) {
      this.loggerService.error(`[placeOffer] Invalid payload.`);
      return res.status(400).send({ error: "Invalid payload!" });
    }

    try {
      const response = await this.offerService.placeOffer(offer);
      return res.status(response.status).send({ message: "Offer placed" });
    } catch (err) {
      this.loggerService.error(err);
      res.status(500).send({ error: "Something went wrong, please try again later." });
    }    
  }

  /**
   * @swagger
   * /inhabitant/{inhabitantId}/offers/{offerId}/accept:
   *  post:
   *      parameters:
   *          - in: path
   *            name: inhabitantId
   *            type: string
   *            required: true
   *          - in: path
   *            name: offerId
   *            type: string
   *            required: true
   *      description: Accepts an offer and executes the trade
   *      tags:
   *          - Inhabitant
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
  public acceptOffer = async (req: Request, res: Response) => {
    const inhabitantId = req.params.inhabitantId;
    const offerId = req.params.offerId;

    try {
      const response = await this.offerService.trande(inhabitantId, offerId);
      return res.status(response.status).send({ message: response.message });
    } catch (err) {
      this.loggerService.error(err);
      res.status(500).send({ error: "Something went wrong, please try again later." });
    }
  }
}

