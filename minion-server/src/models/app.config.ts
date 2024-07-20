import { WebhookListener } from "service-bus-client";

export class AppConfig {
  port: string;
  dataPath: string;
  registrationInterval: number;
  serviceBusApiUrl: string;
  deviceId: string;
  url?: string;
  nic: string;
  rootNodeApiUri: string;
  webhooks: WebhookListener[];
}