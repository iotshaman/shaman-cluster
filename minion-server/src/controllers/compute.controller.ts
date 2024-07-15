/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError, ShamanExpressController } from "shaman-api";
import { TYPES } from "../composition/app.composition.types";
import { IComputeService } from "../services/compute.service";
import { ServiceBusMessage } from "service-bus-client";

@injectable()
export class ComputeController implements ShamanExpressController {

  name: string = 'compute';

  constructor(@inject(TYPES.ComputeService) private computeService: IComputeService) {
    
  }

  configure = (express: Application) => {
    let router = Router();
    router
      .post('/', this.compute)
      .post('/failure', this.handleComputeFailure)

    express.use('/webhook/compute', router);
  }

  compute = (req: Request, res: Response, next: any) => {
    let message = req.body as ServiceBusMessage;
    if (!message.body) return next(new RouteError("Message body not provided.", 400));
    if (!message.args?.requestId) return next(new RouteError("Request id not provided.", 400));
    if (!message.args?.skill) return next(new RouteError("Skill not provided.", 400));
    if (!message.args?.chunkId) return next(new RouteError("Chunk id not provided.", 400));
    let {skill, chunkId, requestId} = message.args;
    return this.computeService.compute(requestId, chunkId, skill, message.body)
      .then(_ => res.status(202).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  handleComputeFailure = (req: Request, res: Response, next: any) => {
    let message = req.body as ServiceBusMessage;
    if (!message.args?.requestId) return next(new RouteError("Request id not provided.", 400));
    if (!message.args?.chunkId) return next(new RouteError("Chunk id not provided.", 400));
    return this.computeService.handleComputeFailure(message.args.requestId, message.args.chunkId)
      .then(_ => res.status(202).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

}
