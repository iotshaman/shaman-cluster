/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError, ShamanExpressController } from "shaman-api";
import { TYPES } from "../composition/app.composition.types";
import { IComputeService } from "../services/compute.service";
import { ComputeFileForm, ComputeRequestForm } from "shaman-cluster-lib";

@injectable()
export class ComputeController implements ShamanExpressController {

  name: string = 'compute';

  constructor(@inject(TYPES.ComputeService) private computeService: IComputeService) {

  }

  configure = (express: Application) => {
    let router = Router();
    router
      .post('/', this.startProcess)
      .post('/message', this.logComputeMessage)
      .post('/error', this.logComputeError)
      .post('/data', this.storeComputeData)
      .post('/file', this.storeComputeFile)
      .post('/chunk/status', this.updateChunkStatus)
      .get('/:requestId/status', this.getComputeStatus)
      .get('/:requestId/data', this.getComputeData)

    express.use('/api/compute', router);
  }

  startProcess = (req: Request, res: Response, next: any) => {
    let body = req.body as ComputeRequestForm
    if (!body.skill) return next(new RouteError("No skill name provided.", 400));
    if (!body.chunks?.length) return next(new RouteError("No chunks provided.", 400));
    return this.computeService.startProcess(req.body)
      .then(requestId => res.status(202).send({status: "Accepted", requestId}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  logComputeMessage = (req: Request, res: Response, next: any) => {
    if (!req.body.requestId) return next(new RouteError("No request id provided.", 400));
    if (!req.body.deviceId) return next(new RouteError("No device id provided.", 400));
    return this.computeService.logMessage(req.body)
      .then(_ => res.status(204).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  logComputeError = (req: Request, res: Response, next: any) => {
    if (!req.body.requestId) return next(new RouteError("No request id provided.", 400));
    if (!req.body.deviceId) return next(new RouteError("No device id provided.", 400));
    return this.computeService.logError(req.body)
      .then(_ => res.status(204).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  storeComputeData = (req: Request, res: Response, next: any) => {
    if (!req.body.requestId) return next(new RouteError("No request id provided.", 400));
    if (!req.body.deviceId) return next(new RouteError("No device id provided.", 400));
    return this.computeService.storeData(req.body)
      .then(_ => res.status(204).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  storeComputeFile = (req: Request, res: Response, next: any) => {
    let body = req.body as ComputeFileForm;
    if (!body.requestId) return next(new RouteError("No request id provided.", 400));
    if (!body.deviceId) return next(new RouteError("No device id provided.", 400));
    if (!body.fileName) return next(new RouteError("No filename provided.", 400));
    return this.computeService.storeFile(body)
      .then(_ => res.status(204).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  updateChunkStatus = (req: Request, res: Response, next: any) => {
    if (!req.body.requestId) return next(new RouteError("No request id provided.", 400));
    if (!req.body.chunkId) return next(new RouteError("No chunk id provided.", 400));
    if (!req.body.status) return next(new RouteError("No status value provided.", 400));
    let {requestId, chunkId, status} = req.body;
    return this.computeService.updateChunkStatus(requestId, chunkId, status)
      .then(_ => res.status(204).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  getComputeStatus = (req: Request, res: Response, next: any) => {
    if (!req.params.requestId) return next(new RouteError("No request id provided.", 400));
    return this.computeService.getComputeStatus(req.params.requestId)
      .then(status => res.json(status))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  getComputeData = (req: Request, res: Response, next: any) => {
    if (!req.params.requestId) return next(new RouteError("No request id provided.", 400));
    return this.computeService.getComputeData(req.params.requestId)
      .then(status => res.json(status))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

}
