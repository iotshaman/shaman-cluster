/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { injectable } from "inversify";
import { ShamanExpressController } from "shaman-api";

@injectable()
export class HealthController implements ShamanExpressController {

  name: string = 'health';

  configure = (express: Application) => {
    let router = Router();
    router
      .get('/', this.getStatus)

    express.use('/api/health', router);
  }

  getStatus = (_req: Request, res: Response, _next: any) => {
    res.json({ status: 'healthy' });
  }

}
