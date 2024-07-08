import { injectable } from "inversify";
import { QueueFunction, TopicFunction } from "../functions";

@injectable()
export class ServiceBusConfig {
  databaseFilePath: string;
  webhookApiBaseUri: string;
  queues: QueueFunction[];
  topics: TopicFunction[];
  workerInterval?: number;
}