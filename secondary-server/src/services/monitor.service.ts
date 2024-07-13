import { inject, injectable } from "inversify";
import { IMonitorServiceClient } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "../models/app.config";

export interface IMonitorService {
  report(requestId: string, message: string): Promise<void>;
  store(requestId: string, data: any, args: any): Promise<void>;
  logError(equestId: string, error: string, stack: string, args: any): Promise<void>;
}

@injectable()
export class MonitorService implements IMonitorService {

  constructor(@inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.MonitorServiceClient) private monitorClient: IMonitorServiceClient) {

  }

  async report(requestId: string, message: string): Promise<void> {
    await this.monitorClient.report({
      requestId: requestId,
      deviceId: this.config.deviceId,
      messageText: message
    });
  }

  async store(requestId: string, data: any, args: any): Promise<void> {
    await this.monitorClient.store({
      requestId: requestId,
      deviceId: this.config.deviceId,
      data: data,
      args: args
    });
  }

  async logError(requestId: string, error: string, stack: string, args: any): Promise<void> {
    await this.monitorClient.logError({
      requestId: requestId,
      deviceId: this.config.deviceId,
      error: error,
      stack: stack,
      args: args
    });
  }

}