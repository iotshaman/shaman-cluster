import { inject, injectable } from "inversify";
import { IPlatformService, PrimaryNodeServiceClient, RegistrationForm } from "shaman-cluster-lib";
import { AppConfig } from "../models/app.config";
import { ITimerService } from "../services/timer.service";
import { TYPES } from "../composition/app.composition.types";
import { PlatformConfig } from "shaman-cluster-lib/dist/types/platform-config";

@injectable()
export class RegistrationWorker {
  constructor(
    @inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.TimerService) private timer: ITimerService,
    @inject(TYPES.PlatformService) private platformService: IPlatformService,
    @inject(TYPES.PrimaryNodeServiceClient) private client: PrimaryNodeServiceClient) {
    
  }

  start(): void {
    let config = this.createPlatformConfigIfNotExists();
    this.registerNode(config);
    let ping = this.config.pingInterval;
    this.timer.every(ping, async () => this.registerNode(config));
  }

  private createPlatformConfigIfNotExists(): PlatformConfig {
    let dataPath = this.config.dataPath;
    let config = this.platformService.getPlatformConfig(dataPath);
    if (!!config) return config;
    config = this.platformConfigFactory();
    this.platformService.savePlatformConfig(dataPath, config);
    return config;
  }

  private platformConfigFactory(): PlatformConfig {
    return {
      hostname: this.platformService.getHostname(),
      ip: this.platformService.getIpAddress(this.config.nic),
      port: this.config.port,
      speed: this.platformService.getSpeedScore()
    }
  }

  private registerNode(config: PlatformConfig): Promise<void> {
    let form: RegistrationForm = {
      deviceId: this.config.deviceId,
      nodeName: config.hostname,
      ipAddress: config.ip,
      port: this.config.port,
      speed: config.speed
    }
    return this.client.registerNode(form);
  }
}