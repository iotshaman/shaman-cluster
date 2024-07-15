import { inject, injectable } from "inversify";
import { ComputeDataForm, ComputeErrorForm, ComputeMessageForm, ComputeRequestForm } from "shaman-cluster-lib";
import { newGuid, sqliteDate } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";
import { IServiceBusClient, ServiceBusMessage } from "service-bus-client";
import { IShamanClusterDatabase } from "../data/database.context";
import { ComputeRequestMessageModel } from "../data/models/compute-request-message.model";
import { ComputeRequestDataModel } from "../data/models/compute-request-data.model";
import { ComputeRequestModel } from "../data/models/compute-request.model";

export interface IComputeService {
  startProcess(req: ComputeRequestForm): Promise<string>;
  logMessage(message: ComputeMessageForm): Promise<void>;
  logError(message: ComputeErrorForm): Promise<void>;
  storeData(message: ComputeDataForm): Promise<void>;
  updateChunkStatus(requestId: string, chunkId: string, status: string): Promise<void>;
}

@injectable()
export class ComputeService implements IComputeService {

  constructor(
    @inject(TYPES.ServiceBusClient) private serviceBus: IServiceBusClient,
    @inject(TYPES.ClusterDatabase) private context: IShamanClusterDatabase) {}

  async startProcess(req: ComputeRequestForm): Promise<string> {
    req.requestId = newGuid();
    let messages: ServiceBusMessage[] = req.chunks.map(chunk => {
      let chunkId = newGuid();
      return {
        path: 'compute',
        body: Object.assign({}, req.body, chunk, {
          requestId: req.requestId,
          chunkId: chunkId
        }),
        args: {skill: req.skill, chunkId, requestId: req.requestId}
      }
    });
    await this.saveComputeRequests(req.requestId, messages);
    await this.serviceBus.postMessages(messages);
    return req.requestId;
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

  async updateChunkStatus(requestId: string, chunkId: string, status: string): Promise<void> {
    let chunks = await this.context.models.compute_request.find({
      conditions: ['requestId = ?', 'chunkId = ?'],
      args: [requestId, chunkId]
    });
    if (!chunks.length) return Promise.reject(new Error("Chunk not found."));
    let chunk = chunks[0];
    chunk.status = status;
    chunk.complete = 'Y';
    await this.context.models.compute_request.update(chunk, {
      columns: ['status', 'complete'],
      conditions: ['requestId = ?', 'chunkId = ?'],
      args: [requestId, chunkId]
    });
  }

  private async saveComputeRequests(requestId: string, messages: ServiceBusMessage[]): Promise<void> {
    for (let m of messages) {
      let model = new ComputeRequestModel();
      model.requestId = requestId;
      model.requestDate = sqliteDate();
      model.skill = m.args.skill;
      model.chunkId = m.args.chunkId;
      model.body = JSON.stringify(m.body);
      model.complete = 'N';
      model.status = 'Pending';
      await this.context.models.compute_request.insert(model);
    }
  }

}