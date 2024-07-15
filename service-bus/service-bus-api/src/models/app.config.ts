import { QueueProcessor } from "./processors/queue.processor";
import { TopicProcessor } from "./processors/topic.processor";

export class AppConfig {
  port: string;
  databaseFilePath: string;
  queues: QueueProcessor[];
  topics: TopicProcessor[];
  workerInterval?: number;
  maxConcurrentMessages?: number;
}