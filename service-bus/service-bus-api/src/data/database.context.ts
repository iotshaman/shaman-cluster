import { DatabaseContext, Collection } from 'sqlite-shaman';
import { MessageModel } from './models/message.model';
import { WebhookModel } from './models/webhook.model';

export class IServiceBusDataContext {
  models: {
    message: Collection<MessageModel>,
    webhook: Collection<WebhookModel>
  }
  runQuery: <T>(query: string, args: any) => Promise<T[]>;
}

export class ServiceBusDataContext extends DatabaseContext implements IServiceBusDataContext {
  models = {
    message: new Collection<MessageModel>(),
    webhook: new Collection<WebhookModel>()
  }

  runQuery = <T>(query: string, args: any): Promise<T[]> => {
    return this.query<T>(query, args);
  }
}