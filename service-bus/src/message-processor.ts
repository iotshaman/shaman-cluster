import { inject, injectable } from "inversify";

import { TYPES } from "./composition/service-bus.composition.types";
import { IMessageService } from "./services/message.service";
import { ServiceBusConfig } from "./models/service-bus-config";
import { MessageModel } from "./data/message.model";
import { IWebhookServiceClient } from "./services/webhook-service.client";

export interface IMessageProcessor {
  processNextMessage(): Promise<void>;
}

@injectable()
export class MessageProcessor implements IMessageProcessor {

  constructor(
    @inject(TYPES.ServiceBusConfig) private config: ServiceBusConfig,
    @inject(TYPES.MessageService) private messageService: IMessageService, 
    @inject(TYPES.WebhookServiceClient) private webhookService: IWebhookServiceClient,) {}

  async processNextMessage(): Promise<void> {
    let lockId = this.messageService.acquireLock();
    if (!lockId) return;
    let message = await this.messageService.receiveNextMessage(lockId);
    if (!message) return this.releaseLock(lockId);
    if (!message.subpath) await this.processQueueMessage(message);
    else await this.processTopicMessage(message);
    this.releaseLock(lockId);
  }

  private releaseLock(lockId: string): void {
    this.messageService.releaseLock(lockId);
  }

  private async processQueueMessage(message: MessageModel): Promise<void> {
    let queue = this.config.queues.find(q => q.queueName == message.path);
    if (!queue) return Promise.reject(new Error(`Invalid queue name '${message.path}'.`));
    try {
      await this.webhookService.postMessage(queue.webhookUri, {
        path: queue.queueName,
        body: JSON.parse(message.body), 
        args: JSON.parse(message.args)
      });
      await this.messageService.messageDelivered(message.messageId);
    } catch(ex) {
      await this.handleFailedDelivery(message, queue.maxAttempts || 1);
    }
  }

  private async processTopicMessage(message: MessageModel): Promise<void> {
    let subscription = this.config.topics.find(q => q.topicName == message.path && q.subscription == message.subpath);
    if (!subscription) {
      let error = new Error(`Invalid subscription name '${message.subpath}' (topic = ${message.path}).`);
      return Promise.reject(error);
    }
    try {
      await this.webhookService.postMessage(subscription.webhookUri, {
        path: subscription.topicName,
        body: JSON.parse(message.body), 
        args: JSON.parse(message.args)
      });
      await this.messageService.messageDelivered(message.messageId);
    } catch(ex) {
      await this.handleFailedDelivery(message, subscription.maxAttempts || 1);
    }
  }

  private async handleFailedDelivery(message: MessageModel, maxAttempts: number): Promise<void> {
    let deadletter = message.attempts >= maxAttempts;
    if (deadletter) await this.messageService.deadletterMessage(message.messageId);
    else await this.messageService.messageNotDelivered(message.messageId);
  }
  
}