/* istanbul ignore file */
import "reflect-metadata";
import * as _path from 'path';
import { MessagePort } from 'worker_threads';
import { Container } from "inversify";

import { TYPES } from "./service-bus.composition.types";
import { ServiceBusConfig } from "../models/service-bus-config";
import { IMessageService, MessageService } from "../services/message.service";
import { IMessageProcessor, MessageProcessor } from "../message-processor";
import { DatabaseContextFactory } from "../data/database.context.factory";
import { IServiceBusDataDatabase } from "../data/database.context";
import { IWebhookServiceClient, WebhookServiceClient } from "../services/webhook-service.client";

export async function Configure(config: ServiceBusConfig, port: MessagePort): Promise<Container> {
  let container = new Container();
  container.bind<MessagePort>(TYPES.MessagePort).toConstantValue(port);
  await configureServices(config, container);
  await configureDataContext(config, container);
  return container;
}

async function configureServices(config: ServiceBusConfig, container: Container): Promise<Container> {
  container.bind<ServiceBusConfig>(TYPES.ServiceBusConfig).to(ServiceBusConfig);
  container.bind<IMessageService>(TYPES.MessageService).to(MessageService);
  container.bind<IMessageProcessor>(TYPES.MessageProcessor).to(MessageProcessor);
  container.bind<IWebhookServiceClient>(TYPES.WebhookServiceClient).toConstantValue(
    new WebhookServiceClient(config.webhookApiBaseUri)
  );
  return container;
}

async function configureDataContext(config: ServiceBusConfig, container: Container): Promise<Container> {
  var context = await DatabaseContextFactory.Create(config.databaseFilePath);
  container.bind<IServiceBusDataDatabase>(TYPES.ServiceBusDataContext).toConstantValue(context);
  return container;
}