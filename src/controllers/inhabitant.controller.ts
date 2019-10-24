import { LoggerService } from "../services";
import { Request, Response } from "express";
import { injectable } from "inversify";
import { InhabitantStorage } from "../storages";
import { Inhabitant } from "../models";

@injectable()
export class InhabitantController {
  constructor(
    private loggerService: LoggerService,
    private inhabitantStorage: InhabitantStorage
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
   *               $ref: '#/definitions/CreateInhabitantModel'
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
}

