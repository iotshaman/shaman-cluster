import { QueueFunction, TopicFunction } from "../functions";

export class ServiceBusConfig {
  databaseFilePath: string;
  webhookApiBaseUri: string;
  queues: QueueFunction[];
  topics: TopicFunction[];
}