/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { ServiceBusMessage } from "service-bus-client";
import { RouteError, ShamanExpressController } from "shaman-api";
import { TYPES } from "../composition/app.composition.types";
import { ICommandService } from "../services/command.service";

@injectable()
export class CommandController implements ShamanExpressController {

  name: string = 'command';

  constructor(@inject(TYPES.CommandService) private commandService: ICommandService) {}

  configure = (express: Application) => {
    let router = Router();
    router
      .post('/', this.runCommand)
      .post('/failure', this.handleCommandFailure)

    express.use('/webhook/command', router);
  }

  runCommand = (req: Request, res: Response, next: any) => {
    let message = req.body as ServiceBusMessage;
    if (!message.body) return next(new RouteError("Message body not provided.", 400));
    if (!message.body.command) return next(new RouteError("Command name not provided.", 400));
    if (!message.args?.requestId) return next(new RouteError("Chunk id not provided.", 400));
    return this.commandService.runCommand(message.args.requestId, message.body)
      .then(_ => res.status(202).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  handleCommandFailure = (req: Request, res: Response, next: any) => {
    let message = req.body as ServiceBusMessage;
    if (!message.args?.requestId) return next(new RouteError("Request id not provided.", 400));
    return this.commandService.handleCommandFailure(message.args.requestId)
      .then(_ => res.status(202).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }


}
