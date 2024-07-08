import * as moment from 'moment';
import { v4 } from "uuid";
import { inject, injectable } from "inversify";
import { TYPES } from "../composition/service-bus.composition.types";
import { MessageModel } from "../data/message.model";
import { IServiceBusDataDatabase } from "../data/database.context";
import { ServiceBusConfig } from '../models/service-bus-config';
import { sqliteDate } from '../functions/date.functions';
import { RulesProcessor } from '../rules-processor';

export interface IMessageService {
  acquireLock():  string;
  releaseLock(lockToken: string): void;
  addMessage(message: MessageModel): Promise<void>;
  receiveNextMessage(lockToken: string): Promise<MessageModel>;
  messageDelivered(messageId: string): Promise<void>;
  messageNotDelivered(messageId: string): Promise<void>;
  deadletterMessage(messageId: string): Promise<void>;
}

@injectable()
export class MessageService implements IMessageService {
  
  private lockToken: string;

  constructor(
    @inject(TYPES.ServiceBusConfig) private config: ServiceBusConfig,
    @inject(TYPES.ServiceBusDataContext) private context: IServiceBusDataDatabase) {

  }

  acquireLock(): string {
    if (!!this.lockToken) return null;
    this.lockToken = v4();
    return this.lockToken;
  }

  releaseLock(lockToken: string): void {
    if (this.lockToken != lockToken) return;
    this.lockToken = null;
  }

  async addMessage(message: MessageModel): Promise<void> {
    await this.addQueueMessage(message);
    await this.addTopicMessages(message);
  }

  async receiveNextMessage(lockToken: string): Promise<MessageModel> {
    if (lockToken != this.lockToken) return Promise.reject(new Error("Invalid lock token."));
    let messages = await this.context.models.message.find({
      conditions: ['complete <> ?', 'deadletter <> ?'], 
      args: ['Y', 'Y']
    });
    let message = messages
      .sort((a, b) => {
        let dateA = moment(a.messageDateTime);
        let dateB = moment(b.messageDateTime);
        if (dateA.isSame(dateB)) return 0;
        return dateA.isBefore(dateB) ? -1 : 1;
      }).pop();
    if (!message) return null;
    message.lockId = lockToken;
    await this.context.models.message.update(message, {
      columns: ['lockId'],
      conditions: ['messageId = ?'],
      args: [message.messageId]
    });
    return message;
  }

  async messageDelivered(messageId: string): Promise<void> {
    let message = await this.context.models.message.findOne({identity: 'messageId', args: [messageId]});
    if (!message) return Promise.reject(new Error(`Invalid message id '${messageId}'.`));
    message.complete = 'Y';
    message.lockId = null;
    await this.context.models.message.update(message, {
      columns: ['complete', 'lockId'],
      conditions: ['messageId = ?'],
      args: [messageId]
    });
  }

  async messageNotDelivered(messageId: string): Promise<void> {
    let message = await this.context.models.message.findOne({identity: 'messageId', args: [messageId]});
    if (!message) return Promise.reject(new Error(`Invalid message id '${messageId}'.`));
    message.lockId = null;
    message.attempts++;
    await this.context.models.message.update(message, {
      columns: ['lockId', 'attempts'],
      conditions: ['messageId = ?'],
      args: [messageId],
    });
    this.lockToken = null;
  }

  async deadletterMessage(messageId: string): Promise<void> {
    let message = await this.context.models.message.findOne({identity: 'messageId', args: [messageId]});
    if (!message) return Promise.reject(new Error(`Invalid message id '${messageId}'.`));
    message.deadletter = 'Y';
    message.lockId = null;
    await this.context.models.message.update(message, {
      columns: ['lockId', 'deadletter'],
      conditions: ['messageId = ?'],
      args: [message.messageId]
    });
  }

  private async addQueueMessage(message: MessageModel): Promise<void> {
    let queue = this.config.queues.find(q => q.queueName == message.path);
    if (!queue || !RulesProcessor.matches(queue.rules, JSON.parse(message.args))) return;
    message.messageId = v4();
    message.messageDateTime = sqliteDate();
    message.attempts = 0;
    message.complete = 'N';
    message.deadletter = 'N';
    await this.context.models.message.insert(message);
  }

  private async addTopicMessages(message: MessageModel): Promise<void> {
    let topics = this.config.topics.filter(q => q.topicName == message.path);
    topics = topics.filter(t => RulesProcessor.matches(t.rules, JSON.parse(message.args)));
    if (!topics.length) return;
    let messages = topics.map(topic => {
      let topicMessage = Object.assign({}, message) as MessageModel;
      topicMessage.messageId = v4();
      topicMessage.messageDateTime = sqliteDate();
      topicMessage.attempts = 0;
      topicMessage.complete = 'N'
      topicMessage.deadletter = 'N';
      topicMessage.subpath = topic.subscription;
      return topicMessage;
    });
    for(var i = 0; i < messages.length; i++) 
      await this.context.models.message.insert(messages[i])
  }

}