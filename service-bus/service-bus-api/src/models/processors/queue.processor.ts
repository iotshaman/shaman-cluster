import { ProcessorRule } from "./processor-rule";

export type QueueProcessor = {
  queueName: string;
  maxAttempts?: number;
  rules?: ProcessorRule[];
}