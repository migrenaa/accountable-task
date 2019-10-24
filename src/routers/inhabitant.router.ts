import { injectable } from "inversify";
import { Router } from "express";
import { InhabitantController } from "../controllers";

@injectable()
export class InhabitantRouter {
  private readonly _router: Router;

  constructor(private inhabitantController: InhabitantController) {
    this._router = Router({ strict: true });
    this.init();
  }

  private init(): void {
    this._router.post("/", this.inhabitantController.create);
  }

  public get router(): Router {
    return this._router;
  }
}
