/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError, ShamanExpressController } from "shaman-api";
import { TYPES } from "../composition/app.composition.types";
import { IComputeService } from "../services/compute.service";

@injectable()
export class JobWebhookController implements ShamanExpressController {

  name: string = 'job';

  constructor(@inject(TYPES.ComputeService) private computeService: IComputeService) {}

  configure = (express: Application) => {
    let router = Router();
    router
      .post('/', this.startJob)

    express.use('/webhook/job', router);
  }

  startJob = (req: Request, res: Response, next: any) => {
    if (!req.body.skill) return next(new RouteError("No skill name provided.", 400));
    if (!req.body.strategy) return next(new RouteError("No strategy provided.", 400));
    if (!req.body.requestId) return next(new RouteError("No request id provided.", 400));
    return this.computeService.startProcess(req.body)
      .then(_ => res.status(204).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

}
