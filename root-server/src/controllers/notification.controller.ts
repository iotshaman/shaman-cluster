/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { ServiceBusMessage } from "service-bus-client";
import { RouteError, ShamanExpressController } from "shaman-api";
import { TYPES } from "../composition/app.composition.types";
import { INotificationService } from "../services/notification.service";

@injectable()
export class NotificationController implements ShamanExpressController {

  name: string = 'notification';

  constructor(@inject(TYPES.NotificationService) private notificationService: INotificationService) {}

  configure = (express: Application) => {
    let router = Router();
    router
      .post('/', this.notify)
      .post('/failure', this.handleNotificationFailure)

    express.use('/api/webhook/notify', router);
  }

  notify = (req: Request, res: Response, next: any) => {
    let message = req.body as ServiceBusMessage;
    if (!message.args?.requestId) return next(new RouteError("Request id not provided.", 400));
    if (!message.args?.requestType) return next(new RouteError("Request type not provided.", 400));
    if (!message.body?.status) return next(new RouteError("Request status not provided.", 400));
    let {requestId, requestType} = message.args;
    return this.notificationService.notify(requestId, requestType, message.body.status)
      .then(_ => res.status(202).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  handleNotificationFailure = (_req: Request, res: Response, _next: any) => {
    return res.status(202).send({status: "Accepted"});
  }

}
