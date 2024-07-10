import { inject, injectable, multiInject } from "inversify";
import { ComputeMessageForm, ComputeRequestForm, newGuid } from "shaman-cluster-lib";
import { ComputeRequestMessageModel, ComputeRequestModel, IShamanClusterDatabase, sqliteDate } from "shaman-cluster-database";
import { TYPES } from "../composition/app.composition.types";
import { IComputeStrategy } from "../strategies/compute.strategy";

export interface IComputeService {
  startProcess(req: ComputeRequestForm): Promise<string>;
  logMessage(message: ComputeMessageForm): Promise<void>;
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
    model.messageText = message.messageText;
    model.messageDateTime = sqliteDate();
    await this.context.models.compute_request_message.insert(model);
  }

}