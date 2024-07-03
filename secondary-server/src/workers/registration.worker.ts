import { inject, injectable } from "inversify";
import { IPlatformService, IRegistrationServiceClient, RegistrationForm, PlatformConfig } from "shaman-cluster-lib";
import { AppConfig } from "../models/app.config";
import { ITimerService } from "../services/timer.service";
import { TYPES } from "../composition/app.composition.types";

@injectable()
export class RegistrationWorker {
  constructor(
    @inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.TimerService) private timer: ITimerService,
    @inject(TYPES.PlatformService) private platformService: IPlatformService,
    @inject(TYPES.PrimaryNodeServiceClient) private client: IRegistrationServiceClient) {
    
  }

  start(): void {
    let config = this.createPlatformConfigIfNotExists();
    this.registerNode(config);
    this.timer.every(this.config.pingInterval, () => this.registerNode(config));
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
      speed: this.platformService.getSpeedScore(),
      platform: this.platformService.getPlatform(),
      processors: this.platformService.getprocessorCount()
    }
  }

  private registerNode(config: PlatformConfig): Promise<void> {
    let form: RegistrationForm = {
      deviceId: this.config.deviceId,
      nodeName: config.hostname,
      ipAddress: config.ip,
      port: this.config.port,
      speed: config.speed,
      platform: config.platform,
      processors: config.processors
    }
    return this.client.registerNode(form);
  }
}