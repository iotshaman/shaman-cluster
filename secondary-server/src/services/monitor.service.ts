import { inject, injectable } from "inversify";
import { IMonitorServiceClient } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "../models/app.config";

export interface IMonitorService {
  postComputeMessage(requestId: string, message: string): Promise<void>;
}

@injectable()
export class MonitorService implements IMonitorService {

  constructor(@inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.MonitorServiceClient) private monitorClient: IMonitorServiceClient) {

  }

  async postComputeMessage(requestId: string, message: string): Promise<void> {
    await this.monitorClient.postComputeMessage({
      requestId: requestId,
      deviceId: this.config.deviceId,
      messageText: message
    })
  }

}