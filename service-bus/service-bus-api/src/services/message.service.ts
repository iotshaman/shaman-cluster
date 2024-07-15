import { v4 } from "uuid";
import { inject, injectable } from "inversify";
import { TYPES } from '../composition/app.composition.types';
import { MessageModel } from "../data/models/message.model";
import { IServiceBusDataContext } from '../data/database.context';
import { AppConfig } from '../models/app.config';
import { ProcessorRule } from '../models/processors/processor-rule';
import { sqliteDate } from '../functions/sqlite.functions';
import { MessageMutex } from '../models/message.mutex';
import { ServiceBusMessage } from '../models/service-bus-message';
import { sortDate } from '../functions/date.functions';

export interface IMessageService {
  acquireLock():  string;
  releaseLock(lockToken: string): void;
  addMessage(message: ServiceBusMessage): Promise<void>;
  addMessages(messages: ServiceBusMessage[]): Promise<void>;
  receiveNextMessage(lockToken: string): Promise<MessageModel>;
  receiveNextDeadletterMessage(lockToken: string): Promise<MessageModel>;
  messageDelivered(messageId: string): Promise<void>;
  messageNotDelivered(messageId: string): Promise<void>;
  deadletterMessage(messageId: string): Promise<void>;
  deferMessage(messageId: string): Promise<void>;
}

@injectable()
export class MessageService implements IMessageService {

  constructor(
    @inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.MessageMutex) private mutex: MessageMutex,
    @inject(TYPES.ServiceBusDataContext) private context: IServiceBusDataContext) {
      
  }

  acquireLock(): string {
    let token = this.mutex.acquireLock();
    return token;
  }

  releaseLock(lockToken: string): void {
    this.mutex.releaseLock(lockToken);
  }

  async addMessage(message: ServiceBusMessage): Promise<void> {
    let model = MessageModel.Scaffold(message);
    await this.addQueueMessage(model);
    await this.addTopicMessages(model);
  }
  
  async addMessages(messages: ServiceBusMessage[]): Promise<void> {
    for (let message of messages) await this.addMessage(message);
  }

  async receiveNextMessage(lockToken: string): Promise<MessageModel> {
    if (!this.mutex.lockExists(lockToken)) return Promise.reject(new Error("Invalid lock token."));
    let messages = await this.context.models.message.find({
      conditions: ['complete <> ?', 'deadletter <> ?', 'lockId IS NULL'], 
      args: ['Y', 'Y']
    });
    let message = sortDate(messages, 'messageDateTime').pop();
    if (!message) return null;
    message.lockId = lockToken;
    await this.context.models.message.update(message, {
      columns: ['lockId'],
      conditions: ['messageId = ?'],
      args: [message.messageId]
    });
    return message;
  }

  async receiveNextDeadletterMessage(lockToken: string): Promise<MessageModel> {
    if (!this.mutex.lockExists(lockToken)) return Promise.reject(new Error("Invalid lock token."));
    let messages = await this.context.models.message.find({
      conditions: ['deadletter = ?', 'complete <> ?'], 
      args: ['Y', 'Y']
    });
    let message = sortDate(messages, 'messageDateTime').pop();
    if (!message) return null;
    message.complete = 'Y';
    await this.context.models.message.update(message, {
      columns: ['complete'],
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

  async deferMessage(messageId: string): Promise<void> {
    let message = await this.context.models.message.findOne({identity: 'messageId', args: [messageId]});
    if (!message) return Promise.reject(new Error(`Invalid message id '${messageId}'.`));
    message.lockId = null;
    message.messageDateTime = sqliteDate();
    this.context.models.message.update(message, {
      columns: ['lockId', 'messageDateTime'],
      conditions: ['messageId = ?'],
      args: [messageId]
    });
  }

  private async addQueueMessage(message: MessageModel): Promise<void> {
    let queue = this.config.queues.find(q => q.queueName == message.path);
    if (!queue || !ProcessorRule.matches(queue.rules, JSON.parse(message.args))) return;
    message.messageId = v4();
    message.messageDateTime = sqliteDate();
    message.attempts = 1;
    message.complete = 'N';
    message.deadletter = 'N';
    await this.context.models.message.insert(message);
  }

  private async addTopicMessages(message: MessageModel): Promise<void> {
    let topics = this.config.topics.filter(q => q.topicName == message.path);
    topics = topics.filter(t => ProcessorRule.matches(t.rules, JSON.parse(message.args)));
    if (!topics.length) return;
    let messages = topics.map(topic => {
      let topicMessage = Object.assign({}, message) as MessageModel;
      topicMessage.messageId = v4();
      topicMessage.messageDateTime = sqliteDate();
      topicMessage.attempts = 1;
      topicMessage.complete = 'N'
      topicMessage.deadletter = 'N';
      topicMessage.subpath = topic.subscription;
      return topicMessage;
    });
    for(var i = 0; i < messages.length; i++) 
      await this.context.models.message.insert(messages[i])
  }

}