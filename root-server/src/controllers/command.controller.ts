/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError, ShamanExpressController } from "shaman-api";
import { TYPES } from "../composition/app.composition.types";
import { ICommandService } from "../services/command.service";
import { CommandForm } from "shaman-cluster-lib";

@injectable()
export class CommandController implements ShamanExpressController {

  name: string = 'command';

  constructor(@inject(TYPES.CommandService) private commandService: ICommandService) {

  }

  configure = (express: Application) => {
    let router = Router();
    router
      .post('/', this.scheduleCommand)
      .post('/data', this.storeCommandData)
      .post('/status', this.updateCommandStatus)

    express.use('/api/command', router);
  }

  scheduleCommand = (req: Request, res: Response, next: any) => {
    let form = req.body as CommandForm;
    if (!form.command) return next(new RouteError("No command provided.", 400));
    if (!form.args) return next(new RouteError("No arguments provided.", 400));
    return this.commandService.scheduleCommand(form)
      .then(_ => res.status(204).send({status: "Accepted"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  storeCommandData = (req: Request, res: Response, next: any) => {
    if (!req.body.requestId) return next(new RouteError("No request id provided.", 400));
    if (!req.body.deviceId) return next(new RouteError("No device id provided.", 400));
    return this.commandService.storeData(req.body)
      .then(_ => res.status(204).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  updateCommandStatus = (req: Request, res: Response, next: any) => {
    if (!req.body.requestId) return next(new RouteError("No request id provided.", 400));
    if (!req.body.deviceId) return next(new RouteError("No device id provided.", 400));
    if (!req.body.status) return next(new RouteError("No status value provided.", 400));
    let {requestId, deviceId, status} = req.body;
    return this.commandService.updateCommandStatus(requestId, deviceId, status)
      .then(_ => res.status(204).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

}
