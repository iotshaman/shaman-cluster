import { DatabaseContext, Collection } from 'sqlite-shaman';
import { NodeRegistrationModel } from './tables/node-registration.model';

export class IShamanClusterDatabase {
  models: {
    registration: Collection<NodeRegistrationModel>
  }
  runQuery: <T>(query: string, args: any) => Promise<T[]>;
}

export class ShamanClusterDatabase extends DatabaseContext implements IShamanClusterDatabase {
  models = {
    registration: new Collection<NodeRegistrationModel>(),
  }

  runQuery = <T>(query: string, args: any): Promise<T[]> => {
    return this.query<T>(query, args);
  }
}