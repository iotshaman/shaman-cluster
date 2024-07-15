/* istanbul ignore file */
import "reflect-metadata";
import * as _path from 'path';
import { Container } from "inversify";
import { SHAMAN_API_TYPES } from "shaman-api";
import { TYPES } from "./app.composition.types";
import { AppConfig } from "../models/app.config";
import { HealthController } from "../controllers/health.controller";
import { DatabaseContextFactory } from "../data/database.context.factory";
import { IServiceBusDataContext } from "../data/database.context";
import { WehbookController } from "../controllers/wehbook.controller";
import { IWebhookService, WebhookService } from "../services/webhook.service";
import { WebhookMutex } from "../models/webhook.mutext";
import { IMessageService, MessageService } from "../services/message.service";
import { IMessageProcessor, MessageProcessor } from "../services/message-processor.service";
import { MessageMutex } from "../models/message.mutex";
import { MessageController } from "../controllers/message.controller";
import { ControlLoopTimer } from "../timers/control-loop.timer";

export async function Compose(container: Container): Promise<Container> {
  const config = container.get<AppConfig>(SHAMAN_API_TYPES.AppConfig);
  await configureServices(container, config);
  await configureTimers(container);
  await configureRouter(container);
  await configureDataContext(container, config);
  return container;
}

function configureServices(container: Container, config: AppConfig): Promise<Container> {
  container.bind<AppConfig>(TYPES.AppConfig).toConstantValue(config);
  container.bind<IWebhookService>(TYPES.WebhookService).to(WebhookService);
  container.bind<WebhookMutex>(TYPES.WebhookMutex).to(WebhookMutex).inSingletonScope();
  container.bind<MessageMutex>(TYPES.MessageMutex).to(MessageMutex).inSingletonScope();
  container.bind<IMessageService>(TYPES.MessageService).to(MessageService);
  container.bind<IMessageProcessor>(TYPES.MessageProcessor).to(MessageProcessor);
  return Promise.resolve(container);
}

function configureTimers(container: Container): Promise<Container> {
  container.bind<ControlLoopTimer>(TYPES.ControlLoopTimer).to(ControlLoopTimer);
  return Promise.resolve(container);
}

function configureRouter(container: Container): Promise<Container> {
  container.bind<HealthController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  container.bind<WehbookController>(SHAMAN_API_TYPES.ApiController).to(WehbookController);
  container.bind<MessageController>(SHAMAN_API_TYPES.ApiController).to(MessageController);
  return Promise.resolve(container);
}

async function configureDataContext(container: Container, config: AppConfig): Promise<Container> {
  var context = await DatabaseContextFactory.Create(config.databaseFilePath);
  container.bind<IServiceBusDataContext>(TYPES.ServiceBusDataContext).toConstantValue(context);
  return container;
}