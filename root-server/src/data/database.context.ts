import { DatabaseContext, Collection } from 'sqlite-shaman';
import { NodeRegistrationModel } from './models/node-registration.model';
import { ComputeRequestModel } from './models/compute-request.model';
import { ComputeRequestMessageModel } from './models/compute-request-message.model';
import { ComputeRequestDataModel } from './models/compute-request-data.model';
import { CommandRequestModel } from './models/command-request.model';
import { CommandRequestDataModel } from './models/command-request-data.model';
import { ComputeRequestFileModel } from './models/compute-request-file.model';
import { RequestWebhookModel } from './models/request-webhook.model';

export class IShamanClusterDatabase {
  models: {
    command_request: Collection<CommandRequestModel>,
    command_request_data: Collection<CommandRequestDataModel>,
    compute_request: Collection<ComputeRequestModel>,
    compute_request_data: Collection<ComputeRequestDataModel>,
    compute_request_file: Collection<ComputeRequestFileModel>,
    compute_request_message: Collection<ComputeRequestMessageModel>,
    registration: Collection<NodeRegistrationModel>,
    request_webhook: Collection<RequestWebhookModel>
  }
  runQuery: <T>(query: string, args: any) => Promise<T[]>;
}

export class ShamanClusterDatabase extends DatabaseContext implements IShamanClusterDatabase {
  models = {
    command_request: new Collection<CommandRequestModel>(),
    command_request_data: new Collection<CommandRequestDataModel>(),
    compute_request: new Collection<ComputeRequestModel>(),
    compute_request_data: new Collection<ComputeRequestDataModel>(),
    compute_request_file: new Collection<ComputeRequestFileModel>(),
    compute_request_message: new Collection<ComputeRequestMessageModel>(),
    registration: new Collection<NodeRegistrationModel>(),
    request_webhook: new Collection<RequestWebhookModel>()
  }

  runQuery = <T>(query: string, args: any): Promise<T[]> => {
    return this.query<T>(query, args);
  }
}