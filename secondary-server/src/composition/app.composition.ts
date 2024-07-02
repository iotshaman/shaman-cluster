/* istanbul ignore file */
import "reflect-metadata";
import * as _path from 'path';
import { Container, decorate, injectable } from "inversify";
import { PrimaryNodeServiceClient, HttpService } from "shaman-cluster-lib";
import { SHAMAN_API_TYPES } from "shaman-api";
import { TYPES } from "./app.composition.types";
import { AppConfig } from "../models/app.config";
import { HealthController } from "../controllers/health.controller";
import { ITimerService, TimerService } from "../services/timer.service";
import { RegistrationWorker } from "../workers/registration.worker";

export async function Compose(container: Container): Promise<Container> {
  const config = container.get<AppConfig>(SHAMAN_API_TYPES.AppConfig);
  await configureServices(container, config);
  await configureRouter(container);
  await configureWorkers(container, config);
  await configureDataContext(container, config);
  return container;
}

function configureServices(container: Container, config: AppConfig): Promise<Container> {
  decorate(injectable(), PrimaryNodeServiceClient);
  decorate(injectable(), HttpService);
  container.bind<AppConfig>(TYPES.AppConfig).toConstantValue(config);
  container.bind<ITimerService>(TYPES.TimerService).to(TimerService);
  container.bind<PrimaryNodeServiceClient>(TYPES.PrimaryNodeServiceClient).toConstantValue(
    new PrimaryNodeServiceClient(config.primaryNodeApiUri)
  );
  return Promise.resolve(container);
}

function configureRouter(container: Container): Promise<Container> {
  container.bind<HealthController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  return Promise.resolve(container);
}

function configureWorkers(container: Container, config: AppConfig): Promise<Container> {
  return new Promise(res => {
    container.bind<RegistrationWorker>(TYPES.RegistrationWorker).to(RegistrationWorker).inSingletonScope();
    res(container);
  });
}

function configureDataContext(container: Container, config: AppConfig): Promise<Container> {
  return new Promise(res => {
    res(container);
  });
}