/* istanbul ignore file */
import * as _path from 'path';
import { Application, static as StaticRoute } from "express";
import { inject, injectable } from "inversify";
import { ShamanExpressController } from "shaman-api";
import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "../models/app.config";

@injectable()
export class FileController implements ShamanExpressController {

  name: string = 'file';

  constructor(@inject(TYPES.AppConfig) private config: AppConfig) {

  }

  configure = (express: Application) => {
    let path = _path.join(this.config.storageFolderPath, 'files');
    express.use(`/files`, StaticRoute(path));
  }

}
