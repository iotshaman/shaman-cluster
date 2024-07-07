import { injectable } from "inversify";
import { HttpService } from "./http.service";
import { ServiceBusMessage } from "../models/service-bus-message";

export interface IWebhookServiceClient {
  postMessage(webhookUri: string, message: ServiceBusMessage): Promise<void>;
}

@injectable()
export class WebhookServiceClient extends HttpService implements IWebhookServiceClient {

  constructor(apiBaseUri: string) {
    super(apiBaseUri);
  }

  postMessage(webhookUri: string, message: ServiceBusMessage): Promise<void> {
    return this.post(webhookUri, message);
  }

}