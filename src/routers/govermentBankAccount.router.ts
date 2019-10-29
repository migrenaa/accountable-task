import { injectable } from "inversify";
import { Router } from "express";
import { GovermentBankAccountController } from "../controllers";

@injectable()
export class GovermentBankAccountRouter {
  private readonly _router: Router;

  constructor(private bankAccountController: GovermentBankAccountController) {
    this._router = Router({ strict: true });
    this.init();
  }

  private init(): void {
    this._router.get("/", this.bankAccountController.get);
  }

  public get router(): Router {
    return this._router;
  }
}
