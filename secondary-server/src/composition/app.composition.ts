/* istanbul ignore file */
import "reflect-metadata";
import * as _path from 'path';
import { Container, decorate, injectable } from "inversify";
import { IRegistrationServiceClient, RegistrationServiceClient, HttpService } from "shaman-cluster-lib";
import { IPlatformService, PlatformService } from "shaman-cluster-lib";
import { SHAMAN_API_TYPES } from "shaman-api";
import { TYPES } from "./app.composition.types";
import { AppConfig } from "../models/app.config";
import { HealthController } from "../controllers/health.controller";
import { ITimerService, TimerService } from "../services/timer.service";
import { RegistrationWorker } from "../workers/registration.worker";
import { ISkill } from "../skills/skill";
import { CommandSkill } from "../skills/command/command.skill";
import { ComputeService, IComputeService } from "../services/compute.service";
import { ComputeController } from "../controllers/compute.controller";

export async function Compose(container: Container): Promise<Container> {
  const config = container.get<AppConfig>(SHAMAN_API_TYPES.AppConfig);
  await configureServices(container, config);
  await configureRouter(container);
  await configureWorkers(container, config);
  await configureSkills(container, config);
  await configureDataContext(container, config);
  return container;
}

function configureServices(container: Container, config: AppConfig): Promise<Container> {
  decorate(injectable(), RegistrationServiceClient);
  decorate(injectable(), HttpService);
  decorate(injectable(), PlatformService);
  container.bind<AppConfig>(TYPES.AppConfig).toConstantValue(config);
  container.bind<ITimerService>(TYPES.TimerService).to(TimerService);
  container.bind<IPlatformService>(TYPES.PlatformService).to(PlatformService);
  container.bind<IRegistrationServiceClient>(TYPES.PrimaryNodeServiceClient).toConstantValue(
    new RegistrationServiceClient(config.primaryNodeApiUri)
  );
  container.bind<IComputeService>(TYPES.ComputeService).to(ComputeService);
  return Promise.resolve(container);
}

function configureRouter(container: Container): Promise<Container> {
  container.bind<HealthController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  container.bind<ComputeController>(SHAMAN_API_TYPES.ApiController).to(ComputeController);
  return Promise.resolve(container);
}

function configureWorkers(container: Container, config: AppConfig): Promise<Container> {
  return new Promise(res => {
    container.bind<RegistrationWorker>(TYPES.RegistrationWorker).to(RegistrationWorker).inSingletonScope();
    res(container);
  });
}

function configureSkills(container: Container, config: AppConfig): Promise<Container> {
  return new Promise(res => {
    container.bind<ISkill>(TYPES.Skill).to(CommandSkill);
    res(container);
  });
}

function configureDataContext(container: Container, config: AppConfig): Promise<Container> {
  return new Promise(res => {
    res(container);
  });
}