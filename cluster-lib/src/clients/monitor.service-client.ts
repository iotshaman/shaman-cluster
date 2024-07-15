import { HttpService } from "../services/http.service";
import { ComputeMessageForm } from "../forms/compute-message.form";
import { ComputeDataForm } from "../forms/compute-data.form";
import { ComputeErrorForm } from "../forms/compute-error.form";
import { CommandDataForm } from "../forms/command-data.form";

export interface IMonitorServiceClient {
  report(form: ComputeMessageForm): Promise<void>;
  store(form: ComputeDataForm): Promise<void>;
  logError(form: ComputeErrorForm): Promise<void>;
  updateChunkStatus(requestId: string, chunkId: string, status: string): Promise<void>;
  storeCommandData(form: CommandDataForm): Promise<void>;
  updateCommandStatus(requestId: string, deviceId: string, status: string): Promise<void>;
}

export class MonitorServiceClient extends HttpService implements IMonitorServiceClient {

  constructor(apiBaseUri: string) {
    super(apiBaseUri);
  }

  report(form: ComputeMessageForm): Promise<void> {
    return this.post('compute/message', form);
  }
  
  store(form: ComputeDataForm): Promise<void> {
    return this.post('compute/data', form);
  }

  logError(form: ComputeErrorForm): Promise<void> {
    return this.post('compute/error', form);
  }
  
  updateChunkStatus(requestId: string, chunkId: string, status: string): Promise<void> {
    return this.post('compute/chunk/status', {requestId, chunkId, status});
  }
  
  storeCommandData(form: CommandDataForm): Promise<void> {
    return this.post('command/data', form);
  }

  updateCommandStatus(requestId: string, deviceId: string, status: string): Promise<void> {
    return this.post('command/status', {requestId, deviceId, status});
  }

}