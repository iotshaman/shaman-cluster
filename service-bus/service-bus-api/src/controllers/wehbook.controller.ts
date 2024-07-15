/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError, ShamanExpressController } from "shaman-api";
import { TYPES } from "../composition/app.composition.types";
import { IWebhookService } from "../services/webhook.service";
import { WebhookRegistrationForm } from "../forms/webhook-registration.form";

@injectable()
export class WehbookController implements ShamanExpressController {

  name: string = 'webhook';

  constructor(@inject(TYPES.WebhookService) private webhookService: IWebhookService) {

  }

  configure = (express: Application) => {
    let router = Router();
    router
      .post('/register', this.registerWebhook)

    express.use('/api/webhook', router);
  }

  registerWebhook = (req: Request, res: Response, next: any) => {
    let body = req.body as WebhookRegistrationForm;
    if (!body.deviceId) return next(new RouteError("No device id provided.", 400));
    if (!body.instanceId) return next(new RouteError("No instance id provided.", 400));
    if (!body.webhookUrl) return next(new RouteError("No webhook URL provided.", 400));
    if (!body.listeners?.length) return next(new RouteError("No listeners provided.", 400));
    return this.webhookService.registerWebhook(body)
      .then(_ => res.status(202).send({status: "Success"}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

}
