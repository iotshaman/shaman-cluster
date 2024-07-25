import * as _path from "path";
import { inject, injectable } from "inversify";
import { ComputeDataForm, ComputeErrorForm, IFileService  } from "shaman-cluster-lib";
import { ComputeMessageForm, ComputeRequestForm, ComputeFileForm } from "shaman-cluster-lib";
import { newGuid, sqliteDate } from "shaman-cluster-lib";
import { IServiceBusClient, ServiceBusMessage } from "service-bus-client";
import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "../models/app.config";
import { IShamanClusterDatabase } from "../data/database.context";
import { ComputeRequestMessageModel } from "../data/models/compute-request-message.model";
import { ComputeRequestDataModel } from "../data/models/compute-request-data.model";
import { ComputeRequestModel } from "../data/models/compute-request.model";
import { ComputeStatus } from "../models/comput-status";
import { ComputeRequestFileModel } from "../data/models/compute-request-file.model";
import { ComputeArgumentFactory } from "../factories/compute-argument.factory";

export interface IComputeService {
  startProcess(req: ComputeRequestForm): Promise<string>;
  logMessage(message: ComputeMessageForm): Promise<void>;
  logError(message: ComputeErrorForm): Promise<void>;
  storeData(message: ComputeDataForm): Promise<void>;
  storeFile(message: ComputeFileForm): Promise<void>;
  updateChunkStatus(requestId: string, chunkId: string, status: string): Promise<void>;
  getComputeStatus(requestId: string): Promise<ComputeStatus>;
  getComputeData(requestId: string): Promise<ComputeRequestDataModel[]>;
}

@injectable()
export class ComputeService implements IComputeService {

  constructor(
    @inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.ServiceBusClient) private serviceBus: IServiceBusClient,
    @inject(TYPES.ClusterDatabase) private context: IShamanClusterDatabase,
    @inject(TYPES.FileService) private fileService: IFileService) {}

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
        args: ComputeArgumentFactory.GetArguments(req, chunkId)
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

  async storeFile(message: ComputeFileForm): Promise<void> {
    let dataFolder = _path.join(this.config.storageFolderPath, 'files');
    let path = _path.join(dataFolder, message.requestId);
    await this.fileService.ensureFolderExists(dataFolder, message.requestId);
    await this.fileService.writeFile(_path.join(path, message.fileName), message.contents);
    let model = new ComputeRequestFileModel();
    model.requestId = message.requestId;
    model.deviceId = message.deviceId;
    model.filePath = path;
    model.fileName = message.fileName;
    model.fileExtension = message.extension || this.fileService.getFileExtension(message.fileName);
    model.args = JSON.stringify(message.args || {});
    model.messageDateTime = sqliteDate();
    await this.context.models.compute_request_file.insert(model);
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

  async getComputeStatus(requestId: string): Promise<ComputeStatus> {
    let chunks = await this.context.models.compute_request.find({
      conditions: ['requestId = ?'],
      args: [requestId]
    });
    return {
      success: chunks.filter(c => c.status == 'Success').length,
      pending: chunks.filter(c => c.status == 'Pending').length,
      error: chunks.filter(c => c.status == 'Error').length
    }
  }

  getComputeData(requestId: string): Promise<ComputeRequestDataModel[]> {
    return this.context.models.compute_request_data.find({
      conditions: ['requestId = ?'],
      args: [requestId]
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