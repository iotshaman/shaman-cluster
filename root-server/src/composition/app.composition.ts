/* istanbul ignore file */
import "reflect-metadata";
import * as _path from 'path';
import { Container, decorate, injectable } from "inversify";
import { SHAMAN_API_TYPES } from "shaman-api";
import { IServiceBusClient, ServiceBusClient } from "service-bus-client";
import { IPlatformService, ITimerService, PlatformService, TimerService } from "shaman-cluster-lib";
import { TYPES } from "./app.composition.types";
import { AppConfig } from "../models/app.config";
import { HealthController } from "../controllers/health.controller";
import { RegistrationController } from "../controllers/registration.controller";
import { ComputeController } from "../controllers/compute.controller";
import { CommandController } from "../controllers/command.controller";
import { DatabaseContextFactory } from "../data/database.context.factory";
import { IShamanClusterDatabase } from "../data/database.context";
import { IRegistrationService, RegistrationService } from "../services/registration.service";
import { ComputeService, IComputeService } from "../services/compute.service";
import { CommandService, ICommandService } from "../services/command.service";

export async function Compose(container: Container): Promise<Container> {
  const config = container.get<AppConfig>(SHAMAN_API_TYPES.AppConfig);
  decorateLibraryClasses();
  await configureServices(container, config);
  await configureServiceClients(container, config);
  await configureRouter(container);
  await configureDataContext(container, config);
  return container;
}

function decorateLibraryClasses() {  
  decorate(injectable(), TimerService);
  decorate(injectable(), PlatformService);
}

function configureServices(container: Container, config: AppConfig): Promise<Container> {
  container.bind<AppConfig>(TYPES.AppConfig).toConstantValue(config);
  container.bind<IComputeService>(TYPES.ComputeService).to(ComputeService);
  container.bind<IRegistrationService>(TYPES.RegistrationService).to(RegistrationService);
  container.bind<ITimerService>(TYPES.TimerService).to(TimerService);
  container.bind<IPlatformService>(TYPES.PlatformService).to(PlatformService);
  container.bind<ICommandService>(TYPES.CommandService).to(CommandService);
  return Promise.resolve(container);
}

function configureServiceClients(container: Container, config: AppConfig): Promise<Container> {
  container.bind<IServiceBusClient>(TYPES.ServiceBusClient).toConstantValue(new ServiceBusClient(config.serviceBusApiUrl));
  return Promise.resolve(container);
}

function configureRouter(container: Container): Promise<Container> {
  container.bind<HealthController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  container.bind<RegistrationController>(SHAMAN_API_TYPES.ApiController).to(RegistrationController);
  container.bind<ComputeController>(SHAMAN_API_TYPES.ApiController).to(ComputeController);
  container.bind<CommandController>(SHAMAN_API_TYPES.ApiController).to(CommandController);
  return Promise.resolve(container);
}

async function configureDataContext(container: Container, config: AppConfig): Promise<Container> {
  var context = await DatabaseContextFactory.Create();
  container.bind<IShamanClusterDatabase>(TYPES.ClusterDatabase).toConstantValue(context);
  return container;
}