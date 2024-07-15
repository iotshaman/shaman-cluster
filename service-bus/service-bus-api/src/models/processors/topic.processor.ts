import { ProcessorRule } from "./processor-rule";

export type TopicProcessor = {
  topicName: string;
  subscription: string;
  maxAttempts?: number;
  rules?: ProcessorRule[];
}