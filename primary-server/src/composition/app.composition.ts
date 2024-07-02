/* istanbul ignore file */
import "reflect-metadata";
import * as _path from 'path';
import { Container } from "inversify";
import { TYPES } from "./app.composition.types";
import { AppConfig } from "../models/app.config";
import { HealthController } from "../controllers/health.controller";
import { SHAMAN_API_TYPES } from "shaman-api";
import { IShamanClusterDatabase, DatabaseContextFactory } from "shaman-cluster-database";
import { IRegistrationService, RegistrationService } from "../services/registration.service";
import { RegistrationController } from "../controllers/registration.controller";

export async function Compose(container: Container): Promise<Container> {
  const config = container.get<AppConfig>(SHAMAN_API_TYPES.AppConfig);
  await configureServices(container, config);
  await configureRouter(container);
  await configureDataContext(container, config);
  return container;
}

function configureServices(container: Container, config: AppConfig): Promise<Container> {
  container.bind<AppConfig>(TYPES.AppConfig).toConstantValue(config);
  container.bind<IRegistrationService>(TYPES.RegistrationService).to(RegistrationService);
  return Promise.resolve(container);
}

function configureRouter(container: Container): Promise<Container> {
  container.bind<HealthController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  container.bind<RegistrationController>(SHAMAN_API_TYPES.ApiController).to(RegistrationController);
  return Promise.resolve(container);
}

async function configureDataContext(container: Container, config: AppConfig): Promise<Container> {
  var context = await DatabaseContextFactory.Create();
  container.bind<IShamanClusterDatabase>(TYPES.ClusterDatabase).toConstantValue(context);
  return container;
}