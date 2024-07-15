import { ProcessorRule } from "./processor-rule";

export type WebhookListener = {
  path: string;
  subpath?: string;
  webhookUri: string;
  failureUri: string;
  rules?: ProcessorRule[];
}