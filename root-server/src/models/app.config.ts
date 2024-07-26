import { WebhookListener } from "service-bus-client";

export class AppConfig {
  port: string;
  serviceBusApiUrl: string;
  storageFolderPath: string;
  registrationInterval: number;
  nic: string;
  deviceId: string;
  webhooks: WebhookListener[];
}