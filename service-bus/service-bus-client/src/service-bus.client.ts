import { ServiceBusMessage } from "./models/service-bus-message";
import { WebhookRegistration } from "./models/webhook-registration";
import { HttpService } from "./services/http.service";

export interface IServiceBusClient {
	register(form: WebhookRegistration): Promise<void>;
	postMessage(message: ServiceBusMessage): Promise<void>;
	postMessages(messages: ServiceBusMessage[]): Promise<void>;
}

export class ServiceBusClient extends HttpService implements IServiceBusClient {

	register(form: WebhookRegistration): Promise<void> {
		return this.post('webhook/register', form);
	}

	postMessage(message: ServiceBusMessage): Promise<void> {
		return this.post('message', message);
	}

	postMessages(messages: ServiceBusMessage[]): Promise<void> {
		return this.post('message/batch', {messages});
	}

}