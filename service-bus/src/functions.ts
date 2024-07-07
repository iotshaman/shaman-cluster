import { ProcessorRule } from "./models/processor-rule";

export type QueueFunction = {
  queueName: string;
  maxAttempts?: number;
  rules?: ProcessorRule[];
  webhookUri: string;
}

export type TopicFunction = {
  topicName: string;
  subscription: string;
  maxAttempts?: number;
  rules?: ProcessorRule[];
  webhookUri: string;
}