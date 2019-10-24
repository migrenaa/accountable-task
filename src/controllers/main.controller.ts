import { Request, Response } from "express";
import { injectable } from "inversify";

@injectable()
export class MainController {
  public rootURL(req: Request, res: Response) {
    res.status(200).send({
      message: "Accountable API is working!!"
    });
  }
}
