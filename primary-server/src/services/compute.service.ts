import { inject, injectable, multiInject } from "inversify";
import { ComputeDataForm, ComputeErrorForm, ComputeMessageForm, ComputeRequestForm, newGuid } from "shaman-cluster-lib";
import { IShamanClusterDatabase, sqliteDate } from "shaman-cluster-database";
import { ComputeRequestDataModel, ComputeRequestMessageModel, ComputeRequestModel } from "shaman-cluster-database";
import { TYPES } from "../composition/app.composition.types";
import { IComputeStrategy } from "../strategies/compute.strategy";

export interface IComputeService {
  startProcess(req: ComputeRequestForm): Promise<string>;
  logMessage(message: ComputeMessageForm): Promise<void>;
  logError(message: ComputeErrorForm): Promise<void>;
  storeData(message: ComputeDataForm): Promise<void>;
}

@injectable()
export class ComputeService implements IComputeService {

  constructor(
    @inject(TYPES.ClusterDatabase) private context: IShamanClusterDatabase,
    @multiInject(TYPES.ComputeStrategy) private strategies: IComputeStrategy[]) {

  }

  async startProcess(req: ComputeRequestForm): Promise<string> {
    let strategy = this.strategies.find(s => s.name == req.strategy);
    if (!strategy) return Promise.reject(new Error(`Invalid strategy: ${req.strategy}.`));
    req.requestId = newGuid();
    let computeRequest = new ComputeRequestModel();
    computeRequest.requestId = req.requestId;
    computeRequest.requestDate = sqliteDate();
    computeRequest.skill = req.skill;
    computeRequest.strategy = req.strategy;
    computeRequest.body = JSON.stringify(req.body);
    await this.context.models.compute_request.insert(computeRequest);
    await strategy.compute(req);
    return computeRequest.requestId;
  }

  async logMessage(message: ComputeMessageForm): Promise<void> {
    let model = new ComputeRequestMessageModel();
    model.requestId = message.requestId;
    model.deviceId = message.deviceId;
    model.messageType = 'Status';
    model.messageText = message.messageText;
    model.messageDateTime = sqliteDate();
    await this.context.models.compute_request_message.insert(model);
  }

  async logError(message: ComputeErrorForm): Promise<void> {
    let model = new ComputeRequestMessageModel();
    model.requestId = message.requestId;
    model.deviceId = message.deviceId;
    model.messageType = 'Error';
    model.messageText = message.error;
    model.messageDateTime = sqliteDate();
    model.trace = message.stack;
    model.args = JSON.stringify(message.args || {});
    await this.context.models.compute_request_message.insert(model);
  }

  async storeData(message: ComputeDataForm): Promise<void> {
    let model = new ComputeRequestDataModel();
    model.requestId = message.requestId;
    model.deviceId = message.deviceId;
    model.args = JSON.stringify(message.args || {});
    model.data = JSON.stringify(message.data || {});
    model.messageDateTime = sqliteDate();
    await this.context.models.compute_request_data.insert(model);
  }

}