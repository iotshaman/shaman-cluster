import { inject, injectable } from "inversify";
import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "../models/app.config";
import { IPlatformService, ITimerService, PlatformConfig } from "shaman-cluster-lib";
import { IServiceBusClient, WebhookRegistration } from "service-bus-client";
import { ILogger, SHAMAN_API_TYPES } from "shaman-api";

@injectable()
export class RegistrationTimer {

  constructor(
    @inject(SHAMAN_API_TYPES.Logger) private logger: ILogger,
    @inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.TimerService) private timer: ITimerService,
    @inject(TYPES.PlatformService) private platformService: IPlatformService,
    @inject(TYPES.ServiceBusClient) private serviceBus: IServiceBusClient) {
    
  }

  async start(): Promise<void> {
    let config = this.createPlatformConfigIfNotExists();
    await this.registerAll(config);
    this.timer.every(this.config.registrationInterval, async () => await this.registerAll(config));
    this.timer.registerErrorHandler(_ => {
      this.logger.write("Unable to register node (root node unavailable).", "warning");
      return Promise.resolve();
    })
  }

  private async registerAll(config: PlatformConfig): Promise<void> {
    await this.registerwebhooks(config).catch(_ => {
      this.logger.write("Unable to register node (root node unavailable).", "warning");
      return Promise.resolve();
    });
  }

  private createPlatformConfigIfNotExists(): PlatformConfig {
    let dataPath = this.config.storageFolderPath;
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
      speed: this.platformService.getSpeedScore(),
      platform: this.platformService.getPlatform(),
      processors: this.platformService.getprocessorCount()
    }
  }

  private async registerwebhooks(config: PlatformConfig): Promise<void> {
    let form: WebhookRegistration = {
      deviceId: this.config.deviceId,
      instanceId: this.config.port,
      webhookUrl: `http://${config.ip}:${this.config.port}/`,
      listeners: this.config.webhooks
    }
    await this.serviceBus.register(form);
  }
  
}