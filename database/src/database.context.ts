import { DatabaseContext, Collection } from 'sqlite-shaman';
import { NodeRegistrationModel } from './tables/node-registration.model';
import { ComputeRequestModel } from './tables/compute-request.model';
import { ComputeRequestMessageModel } from './tables/compute-request-message.model';
import { ComputeRequestDataModel } from './tables/compute-request-data.model';

export class IShamanClusterDatabase {
  models: {
    compute_request: Collection<ComputeRequestModel>,
    compute_request_data: Collection<ComputeRequestDataModel>,
    compute_request_message: Collection<ComputeRequestMessageModel>,
    registration: Collection<NodeRegistrationModel>
  }
  runQuery: <T>(query: string, args: any) => Promise<T[]>;
}

export class ShamanClusterDatabase extends DatabaseContext implements IShamanClusterDatabase {
  models = {
    compute_request: new Collection<ComputeRequestModel>(),
    compute_request_data: new Collection<ComputeRequestDataModel>(),
    compute_request_message: new Collection<ComputeRequestMessageModel>(),
    registration: new Collection<NodeRegistrationModel>(),
  }

  runQuery = <T>(query: string, args: any): Promise<T[]> => {
    return this.query<T>(query, args);
  }
}