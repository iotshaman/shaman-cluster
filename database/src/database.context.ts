import { DatabaseContext, Collection } from 'sqlite-shaman';
import { NodeRegistrationModel } from './tables/node-registration.model';
import { ComputeRequestModel } from './tables/compute-request.model';

export class IShamanClusterDatabase {
  models: {
    compute_request: Collection<ComputeRequestModel>,
    registration: Collection<NodeRegistrationModel>
  }
  runQuery: <T>(query: string, args: any) => Promise<T[]>;
}

export class ShamanClusterDatabase extends DatabaseContext implements IShamanClusterDatabase {
  models = {
    compute_request: new Collection<ComputeRequestModel>(),
    registration: new Collection<NodeRegistrationModel>(),
  }

  runQuery = <T>(query: string, args: any): Promise<T[]> => {
    return this.query<T>(query, args);
  }
}