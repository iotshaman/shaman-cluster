import { DatabaseContext, Collection } from 'sqlite-shaman';
import { MessageModel } from './message.model';

export class IServiceBusDataDatabase {
  models: {
    message: Collection<MessageModel>
  }
  runQuery: <T>(query: string, args: any) => Promise<T[]>;
}

export class ServiceBusDataDatabase extends DatabaseContext implements IServiceBusDataDatabase {
  models = {
    message: new Collection<MessageModel>()
  }

  runQuery = <T>(query: string, args: any): Promise<T[]> => {
    return this.query<T>(query, args);
  }
}