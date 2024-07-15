/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError, ShamanExpressController } from "shaman-api";
import { TYPES } from "../composition/app.composition.types";
import { IMessageService } from "../services/message.service";
import { ServiceBusMessage } from "../models/service-bus-message";

@injectable()
export class MessageController implements ShamanExpressController {

  name: string = 'message';

  constructor(@inject(TYPES.MessageService) private messageService: IMessageService) {
    
  }

  configure = (express: Application) => {
    let router = Router();
    router
      .post('/', this.postMessage)
      .post('/batch', this.postMessages)

    express.use('/api/message', router);
  }

  postMessage = (req: Request, res: Response, next: any) => {
    let body = req.body as ServiceBusMessage;
    if (!body.path) return next(new RouteError("No entity path provided.", 400));
    if (!body.body) return next(new RouteError("No message body provided.", 400));
    return this.messageService.addMessage(body)
      .then(_ => res.status(202).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  postMessages = (req: Request, res: Response, next: any) => {
    let messages: ServiceBusMessage[] = req.body.messages || [];
    if (messages.some(m => !m.path || !m.body)) {
      return next(new RouteError("Malformed message found in array.", 400));
    }
    return this.messageService.addMessages(messages)
      .then(_ => res.status(202).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

}
