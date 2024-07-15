import "reflect-metadata";
import * as _path from 'path';
import { Container } from "inversify";
import { ConfigFactory, ShamanExpressApp } from 'shaman-api';

import { AppConfig } from "./models/app.config";
import { Compose } from "./composition/app.composition";
import { ControlLoopTimer } from "./timers/control-loop.timer";
import { TYPES } from "./composition/app.composition.types";

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
  startControlLoopTimer(container);
}

bootstrap().catch(ex => {
  console.error(ex);
  process.exit(1);
});

function startControlLoopTimer(container: Container) {
  let timer = container.get<ControlLoopTimer>(TYPES.ControlLoopTimer);
  timer.start().catch(ex => {
    console.log('An error occured while starting control loop.')
    console.error(ex);
    process.exit(33);
  });
}