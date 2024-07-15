import "reflect-metadata";
import * as _path from 'path';
import { Container } from "inversify";
import { ConfigFactory, ShamanExpressApp } from 'shaman-api';

import { AppConfig } from "./models/app.config";
import { TYPES } from "./composition/app.composition.types";
import { Compose } from "./composition/app.composition";
import { CommandLineArguments } from "./models/command-line-args";
import { RegistrationTimer } from "./timers/registration.timer";

let bootstrap = async () => {
  let configPath = _path.join(__dirname, '..', 'app', 'config', 'app.config.json');
  let config = await ConfigFactory.GenerateConfig<AppConfig>(configPath);
  let args = new CommandLineArguments(process.argv);
  config.port = args.getValueOrDefault('port', config.port);
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
  await Compose(container, config);
  await app.configureRouter([]);
  await app.startApplication();
  startRegistrationTimer(container);
}

bootstrap().catch(ex => {
  console.error(ex);
  process.exit(1);
});

function startRegistrationTimer(container: Container) {
  let timer = container.get<RegistrationTimer>(TYPES.RegistrationTimer);
  timer.start().catch(ex => {
    console.log('An error occured while starting registration timer.')
    console.error(ex);
    process.exit(99);
  });
}