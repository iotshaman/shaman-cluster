import { inject, injectable } from "inversify";
import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "../models/app.config";
import { IPlatformService, IRegistrationServiceClient, ITimerService, PlatformConfig } from "shaman-cluster-lib";
import { IServiceBusClient, WebhookRegistration } from "service-bus-client";

@injectable()
export class RegistrationTimer {

  constructor(
    @inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.TimerService) private timer: ITimerService,
    @inject(TYPES.PlatformService) private platformService: IPlatformService,
    @inject(TYPES.ServiceBusClient) private serviceBus: IServiceBusClient,
    @inject(TYPES.RegistrationServiceClient) private registrationService: IRegistrationServiceClient) {
    
  }

  async start(): Promise<void> {
    let config = this.createPlatformConfigIfNotExists();
    await this.registerNode(config);
    await this.registerwebhooks(config);
    this.timer.every(this.config.registrationInterval, async () => {
      await Promise.all([this.registerwebhooks(config), this.registerNode(config)]);
    });
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
      speed: this.platformService.getSpeedScore(),
      platform: this.platformService.getPlatform(),
      processors: this.platformService.getprocessorCount()
    }
  }

  private async registerNode(config: PlatformConfig): Promise<void> {
    try {
      await this.registrationService.registerNode({
        deviceId: this.config.deviceId,
        instanceId: this.config.port,
        nodeName: config.hostname,
        ipAddress: config.ip,
        port: this.config.port,
        nodeUrl: this.config.url || `http://${config.ip}:${this.config.port}/`,
        speed: config.speed,
        platform: config.platform,
        processors: config.processors
      });
    } catch(ex) {
      console.error(ex); // TODO: handle error
    }
  }

  private async registerwebhooks(config: PlatformConfig): Promise<void> {
    try {
      let form: WebhookRegistration = {
        deviceId: this.config.deviceId,
        instanceId: this.config.port,
        webhookUrl: this.config.url || `http://${config.ip}:${this.config.port}/`,
        listeners: this.config.webhooks
      }
      await this.serviceBus.register(form);
    } catch(ex) {
      console.error(ex); // TODO: handle error
    }
  }
  
}