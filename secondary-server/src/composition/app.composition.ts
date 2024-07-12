/* istanbul ignore file */
import "reflect-metadata";
import * as _path from 'path';
import { Container, decorate, injectable } from "inversify";
import { IRegistrationServiceClient, RegistrationServiceClient } from "shaman-cluster-lib";
import { HttpService, IMonitorServiceClient, MonitorServiceClient } from "shaman-cluster-lib";
import { IPlatformService, PlatformService } from "shaman-cluster-lib";
import { IServiceBus, ServiceBus } from "service-bus";
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
import { JobWebhookController } from "../webhooks/job.webhook";
import { IMonitorService, MonitorService } from "../services/monitor.service";
import { CollectSkill } from "../skills/collect/collect.skill";

export async function Compose(container: Container): Promise<Container> {
  const config = container.get<AppConfig>(SHAMAN_API_TYPES.AppConfig);
  await configureServices(container, config);
  await configureServiceClients(container, config);
  await configureRouter(container);
  await configureWorkers(container, config);
  await configureSkills(container, config);
  await configureServiceBus(container, config);
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
  container.bind<IComputeService>(TYPES.ComputeService).to(ComputeService);
  container.bind<IMonitorService>(TYPES.MonitorService).to(MonitorService);
  return Promise.resolve(container);
}

function configureServiceClients(container: Container, config: AppConfig): Promise<Container> {
  container.bind<IRegistrationServiceClient>(TYPES.RegistrationServiceClient).toConstantValue(
    new RegistrationServiceClient(config.primaryNodeApiUri)
  );
  container.bind<IMonitorServiceClient>(TYPES.MonitorServiceClient).toConstantValue(
    new MonitorServiceClient(config.primaryNodeApiUri)
  );
  return Promise.resolve(container);
}

function configureRouter(container: Container): Promise<Container> {
  container.bind<HealthController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  container.bind<ComputeController>(SHAMAN_API_TYPES.ApiController).to(ComputeController);
  container.bind<JobWebhookController>(SHAMAN_API_TYPES.ApiController).to(JobWebhookController);
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
    container.bind<ISkill>(TYPES.Skill).to(CollectSkill);
    res(container);
  });
}

function configureServiceBus(container: Container, config: AppConfig): Promise<Container> {
  return new Promise(res => {
    container.bind<IServiceBus>(TYPES.ServiceBus).toConstantValue(new ServiceBus(config.serviceBus));
    res(container);
  });
}

function configureDataContext(container: Container, config: AppConfig): Promise<Container> {
  return new Promise(res => {
    res(container);
  });
}