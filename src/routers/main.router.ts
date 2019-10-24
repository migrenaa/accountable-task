import { injectable } from "inversify";
import { Router, Request, Response } from "express";
import { MainController } from "../controllers";

@injectable()
export class MainRouter {
  private readonly _router: Router;

  constructor(private _mainController: MainController) {
    this._router = Router({ strict: true });
    this.init();
  }

  private init(): void {
    this._router.get("/", (req: Request, res: Response) => this._mainController.rootURL(req, res));
  }

  public get router(): Router {
    return this._router;
  }
}
