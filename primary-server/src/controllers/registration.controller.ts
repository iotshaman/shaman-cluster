/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError, ShamanExpressController } from "shaman-api";
import { RegistrationForm } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";
import { IRegistrationService } from "../services/registration.service";

@injectable()
export class RegistrationController implements ShamanExpressController {

  name: string = 'registration';

  constructor(@inject(TYPES.RegistrationService) private registrationService: IRegistrationService) {

  }

  configure = (express: Application) => {
    let router = Router();
    router
      .get('/', this.getAllRegistrations)
      .post('/', this.registerNode)

    express.use('/api/registration', router);
  }

  getAllRegistrations = (_req: Request, res: Response, next: any) => {
    return this.registrationService.getRegisteredNodes()
      .then(nodes => res.json({nodes}))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

  registerNode = (req: Request, res: Response, next: any) => {
    let form: RegistrationForm = req.body;
    if (!form.deviceId) return next(new RouteError("No device id provided.", 400));
    if (!form.nodeName) return next(new RouteError("No name provided.", 400));
    if (!form.ipAddress) return next(new RouteError("No ip address provided.", 400));
    return this.registrationService.registerNode(form)
      .then(node => res.json(node))
      .catch(ex => next(new RouteError(ex.message, 500)));
  }

}
