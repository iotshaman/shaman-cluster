import { inject, injectable } from "inversify";
import { IMonitorServiceClient } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "../models/app.config";

export interface IMonitorService {
  report(requestId: string, message: string): Promise<void>;
  store(requestId: string, data: any, args: any): Promise<void>;
  logError(equestId: string, error: string, stack: string, args: any): Promise<void>;
  updateChunkStatus(requestId: string, chunkId: string, status: string): Promise<void>;
  storeCommandData(requestId: string, stdout: string, stderr: string): Promise<void>;
  updateCommandStatus(requestId: string, status: string): Promise<void>;
}

@injectable()
export class MonitorService implements IMonitorService {

  constructor(@inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.MonitorServiceClient) private monitorClient: IMonitorServiceClient) {

  }

  report(requestId: string, message: string): Promise<void> {
    return this.monitorClient.report({
      requestId: requestId,
      deviceId: this.config.deviceId,
      messageText: message
    });
  }

  store(requestId: string, data: any, args: any): Promise<void> {
    return this.monitorClient.store({
      requestId: requestId,
      deviceId: this.config.deviceId,
      data: data,
      args: args
    });
  }

  logError(requestId: string, error: string, stack: string, args: any): Promise<void> {
    return this.monitorClient.logError({
      requestId: requestId,
      deviceId: this.config.deviceId,
      error: error,
      stack: stack,
      args: args
    });
  }

  updateChunkStatus(requestId: string, chunkId: string, status: string): Promise<void> {
    return this.monitorClient.updateChunkStatus(requestId, chunkId, status);
  }
  
  storeCommandData(requestId: string, stdout: string, stderr: string): Promise<void> {
    return this.monitorClient.storeCommandData({
      requestId: requestId,
      deviceId: this.config.deviceId,
      stdout: stdout,
      stderr: stderr
    });
  }

  updateCommandStatus(requestId: string, status: string): Promise<void> {
    let deviceId = this.config.deviceId;
    return this.monitorClient.updateCommandStatus(requestId, deviceId, status);
  }

}