/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError, ShamanExpressController } from "shaman-api";
import { TYPES } from "../composition/app.composition.types";
import { IComputeService } from "../services/compute.service";

@injectable()
export class ComputeController implements ShamanExpressController {

  name: string = 'compute';

  constructor(@inject(TYPES.ComputeService) private computeService: IComputeService) {

  }

  configure = (express: Application) => {
    let router = Router();
    router
      .post('/', this.getStatus)

    express.use('/api/compute', router);
  }

  getStatus = (req: Request, res: Response, next: any) => {
    if (!req.body.skill) return next(new RouteError("No skill name provided.", 400));
    if (!req.body.strategy) return next(new RouteError("No strategy provided.", 400));
    if (!req.body.requestId) return next(new RouteError("No request id provided.", 400));
    return this.computeService.startProcess(req.body)
      .then(_ => res.status(202).send({status: "Accepted"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

}
