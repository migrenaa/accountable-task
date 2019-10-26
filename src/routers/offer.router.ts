import { injectable } from "inversify";
import { Router } from "express";
import { OfferController } from "../controllers";

@injectable()
export class OfferRouter {
  private readonly _router: Router;

  constructor(private offerController: OfferController) {
    this._router = Router({ strict: true });
    this.init();
  }

  private init(): void {
    this._router.get("/", this.offerController.getOpened);
  }

  public get router(): Router {
    return this._router;
  }
}
