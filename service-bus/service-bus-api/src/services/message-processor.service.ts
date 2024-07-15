import { inject, injectable } from "inversify";

import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "../models/app.config";
import { IMessageService } from "./message.service";
import { MessageModel } from "../data/models/message.model";
import { IWebhookService } from "./webhook.service";
import { RestClientFactory } from "../clients/rest.client";
import { ServiceBusMessage } from "../models/service-bus-message";

export interface IMessageProcessor {
  processNextMessage(): Promise<void>;
  processNextDeadletterMessage(): Promise<void>;
}

@injectable()
export class MessageProcessor implements IMessageProcessor {

  constructor(
    @inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.MessageService) private messageService: IMessageService,
    @inject(TYPES.WebhookService) private webhookService: IWebhookService) {}

  async processNextMessage(): Promise<void> {
    let lockId = this.messageService.acquireLock();
    if (!lockId) return;
    let message = await this.messageService.receiveNextMessage(lockId);
    if (!message) return this.releaseLock(lockId);
    try {
      if (!message.subpath) await this.processQueueMessage(message);
      else await this.processTopicMessage(message);
      this.releaseLock(lockId);
    } catch(_) {
      this.releaseLock(lockId);
    }
  }

  async processNextDeadletterMessage(): Promise<void> {
    let lockId = this.messageService.acquireLock();
    if (!lockId) return;
    let message = await this.messageService.receiveNextDeadletterMessage(lockId);
    if (!message) return this.releaseLock(lockId);
    try {
      if (!message.subpath) await this.processDeadletterQueueMessage(message);
      else await this.processDeadletterTopicMessage(message);
      this.releaseLock(lockId);
    } catch(_) {
      this.releaseLock(lockId);
    }
  }

  private releaseLock(lockId: string): void {
    this.messageService.releaseLock(lockId);
  }

  private async processQueueMessage(message: MessageModel): Promise<void> {
    let queue = this.config.queues.find(q => q.queueName == message.path);
    if (!queue) return Promise.reject(new Error(`Invalid queue name '${message.path}'.`));
    let args = JSON.parse(message.args);
    let target = await this.webhookService.getWebhookTarget(queue.queueName, args);
    if (!target) return this.messageService.deferMessage(message.messageId);
    try {
      let client = RestClientFactory(target.webhookUrl.slice(0, -1));
      await client.Post<ServiceBusMessage>(target.webhookPath, {
        path: queue.queueName,
        body: JSON.parse(message.body), 
        args: JSON.parse(message.args)
      });
      this.webhookService.releaseWebhookTargetLock(target);
      await this.messageService.messageDelivered(message.messageId);
    } catch(ex) {
      this.webhookService.releaseWebhookTargetLock(target);
      await this.handleFailedDelivery(message, queue.maxAttempts || 1);
    }
  }

  private async processDeadletterQueueMessage(message: MessageModel): Promise<void> {
    let queue = this.config.queues.find(q => q.queueName == message.path);
    if (!queue) return Promise.reject(new Error(`Invalid queue name '${message.path}'.`));
    let args = JSON.parse(message.args);
    let target = await this.webhookService.getWebhookTarget(queue.queueName, args);
    if (!target) return this.messageService.deferMessage(message.messageId);
    try {
      let client = RestClientFactory(target.webhookUrl.slice(0, -1));
      await client.Post<ServiceBusMessage>(target.webhookFailurePath, {
        path: queue.queueName,
        body: JSON.parse(message.body), 
        args: JSON.parse(message.args)
      });
      this.webhookService.releaseWebhookTargetLock(target);
    } catch(ex) {
      this.webhookService.releaseWebhookTargetLock(target);
    }
  }

  private async processTopicMessage(message: MessageModel): Promise<void> {
    let entity = this.config.topics.find(q => q.topicName == message.path && q.subscription == message.subpath);
    if (!entity) {
      let error = new Error(`Invalid subscription name '${message.subpath}' (topic = ${message.path}).`);
      return Promise.reject(error);
    }
    let {topicName, subscription} = entity;
    let args = JSON.parse(message.args);
    let target = await this.webhookService.getWebhookTarget(topicName, args, subscription);
    if (!target) return this.messageService.deferMessage(message.messageId);
    try {
      let client = RestClientFactory(target.webhookUrl.slice(0, -1));
      await client.Post<ServiceBusMessage>(target.webhookPath, {
        path: topicName,
        body: JSON.parse(message.body), 
        args: JSON.parse(message.args)
      });
      this.webhookService.releaseWebhookTargetLock(target);
      await this.messageService.messageDelivered(message.messageId);
    } catch(ex) {
      this.webhookService.releaseWebhookTargetLock(target);
      await this.handleFailedDelivery(message, entity.maxAttempts || 1);
    }
  }

  private async processDeadletterTopicMessage(message: MessageModel): Promise<void> { 
    let entity = this.config.topics.find(q => q.topicName == message.path && q.subscription == message.subpath);
    if (!entity) {
      let error = new Error(`Invalid subscription name '${message.subpath}' (topic = ${message.path}).`);
      return Promise.reject(error);
    }
    let {topicName, subscription} = entity;
    let args = JSON.parse(message.args);
    let target = await this.webhookService.getWebhookTarget(topicName, args, subscription);
    if (!target) return this.messageService.deferMessage(message.messageId);
    try {
      let client = RestClientFactory(target.webhookUrl.slice(0, -1));
      await client.Post<ServiceBusMessage>(target.webhookFailurePath, {
        path: topicName,
        body: JSON.parse(message.body), 
        args: JSON.parse(message.args)
      });
      this.webhookService.releaseWebhookTargetLock(target);
    } catch(ex) {
      this.webhookService.releaseWebhookTargetLock(target);
    }
  }

  private async handleFailedDelivery(message: MessageModel, maxAttempts: number): Promise<void> {
    let deadletter = message.attempts >= maxAttempts;
    if (deadletter) await this.messageService.deadletterMessage(message.messageId);
    else await this.messageService.messageNotDelivered(message.messageId);
  }
  
}