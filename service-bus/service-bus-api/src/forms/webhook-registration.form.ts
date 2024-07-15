import { ProcessorRule } from "../models/processors/processor-rule";

export type WebhookRegistrationForm = {
  deviceId: string;
  instanceId: string;
  webhookUrl: string;
  listeners: WebhookListenerRegistration[];
}

export type WebhookListenerRegistration = {
  path: string;
  subpath?: string;
  webhookUri: string;
  failureUri: string;
  rules?: ProcessorRule[];
}