import { WebhookListener } from "./webhook-listener";

export type WebhookRegistration = {
  deviceId: string;
  instanceId: string;
  webhookUrl: string;
  listeners: WebhookListener[];
}