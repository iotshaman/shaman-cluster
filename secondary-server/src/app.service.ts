import "reflect-metadata";
import * as _path from 'path';
import { ConfigFactory, ShamanExpressApp } from 'shaman-api';

import { Container } from "inversify";
import { AppConfig } from "./models/app.config";
import { Compose } from "./composition/app.composition";
import { TYPES } from "./composition/app.composition.types";
import { RegistrationWorker } from "./workers/registration.worker";

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
  startRegistrationWorker(container);
}

bootstrap().catch(ex => {
  console.error(ex);
  process.exit(1);
});

function startRegistrationWorker(container: Container) {
  let worker = container.get<RegistrationWorker>(TYPES.RegistrationWorker);
  worker.start();
}