/* istanbul ignore file */
import "reflect-metadata";
import * as _path from 'path';
import { Container, decorate, injectable } from "inversify";
import { SHAMAN_API_TYPES } from "shaman-api";
import { IServiceBusClient, ServiceBusClient } from "service-bus-client";
import { IPlatformService, PlatformService, ITimerService, TimerService } from "shaman-cluster-lib";
import { IMonitorServiceClient, MonitorServiceClient } from "shaman-cluster-lib";
import { IRegistrationServiceClient, RegistrationServiceClient } from "shaman-cluster-lib";
import { TYPES } from "./app.composition.types";
import { AppConfig } from "../models/app.config";
import { HealthController } from "../controllers/health.controller";
import { RegistrationTimer } from "../timers/registration.timer";
import { ComputeService, IComputeService } from "../services/compute.service";
import { ISkill } from "../skills/skill";
import { CollectSkill } from "../skills/collect/collect.skill";
import { IMonitorService, MonitorService } from "../services/monitor.service";
import { ComputeController } from "../controllers/compute.controller";
import { CommandController } from "../controllers/command.controller";
import { CommandService, ICommandService } from "../services/command.service";
import { ScrapeSkill } from "../skills/scrape/scrape.skill";
import { CrawlSkill } from "../skills/crawl/crawl.skill";

export async function Compose(container: Container, config: AppConfig): Promise<Container> {
  decorateLibraryClasses();
  await configureServices(container, config);
  await configureServiceClients(container, config);
  await configureSkills(container, config);
  await configureTimers(container);
  await configureRouter(container);
  return container;
}

function decorateLibraryClasses() {  
  decorate(injectable(), TimerService);
  decorate(injectable(), PlatformService);
}

function configureServices(container: Container, config: AppConfig): Promise<Container> {
  container.bind<AppConfig>(TYPES.AppConfig).toConstantValue(config);
  container.bind<IPlatformService>(TYPES.PlatformService).to(PlatformService);
  container.bind<ITimerService>(TYPES.TimerService).to(TimerService);
  container.bind<IComputeService>(TYPES.ComputeService).to(ComputeService);
  container.bind<IMonitorService>(TYPES.MonitorService).to(MonitorService);
  container.bind<ICommandService>(TYPES.CommandService).to(CommandService)
  return Promise.resolve(container);
}

function configureServiceClients(container: Container, config: AppConfig): Promise<Container> {
  container.bind<IServiceBusClient>(TYPES.ServiceBusClient).toConstantValue(
    new ServiceBusClient(config.serviceBusApiUrl)
  );
  container.bind<IMonitorServiceClient>(TYPES.MonitorServiceClient).toConstantValue(
    new MonitorServiceClient(config.rootNodeApiUri)
  );
  container.bind<IRegistrationServiceClient>(TYPES.RegistrationServiceClient).toConstantValue(
    new RegistrationServiceClient(config.rootNodeApiUri)
  );
  return Promise.resolve(container);
}

function configureSkills(container: Container, config: AppConfig): Promise<Container> {
  return new Promise(res => {
    container.bind<ISkill>(TYPES.Skill).to(CollectSkill);
    container.bind<ISkill>(TYPES.Skill).to(ScrapeSkill);
    container.bind<ISkill>(TYPES.Skill).to(CrawlSkill);
    res(container);
  });
}

function configureTimers(container: Container): Promise<Container> {
  container.bind<RegistrationTimer>(TYPES.RegistrationTimer).to(RegistrationTimer);
  return Promise.resolve(container);
}

function configureRouter(container: Container): Promise<Container> {
  container.bind<HealthController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  container.bind<ComputeController>(SHAMAN_API_TYPES.ApiController).to(ComputeController);
  container.bind<CommandController>(SHAMAN_API_TYPES.ApiController).to(CommandController);
  return Promise.resolve(container);
}