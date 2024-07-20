import { WebhookListener } from "service-bus-client";
import { ProxyConfig } from "shaman-cluster-lib";

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
  proxy?: ProxyConfig;
}