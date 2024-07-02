import "reflect-metadata";
import * as _path from 'path';
import { ConfigFactory, ShamanExpressApp } from 'shaman-api';

import { AppConfig } from "./models/app.config";
import { Compose } from "./composition/app.composition";

let bootstrap = async () => {
  let configPath = _path.join(__dirname, '..', 'app', 'config', 'app.config.json');
  const config = await ConfigFactory.GenerateConfig<AppConfig>(configPath);
  const app = new ShamanExpressApp({
    configPath: configPath,
    port: parseInt(config.port),
    headerAllowList: [
      'Content-Type',
      'Data-Type',
      'Authorization'
    ]
  });
  let container = await app.compose();
  await Compose(container);
  await app.configureRouter([]);
  await app.startApplication();
}

bootstrap().catch(ex => {
  console.error(ex);
  process.exit(1);
});