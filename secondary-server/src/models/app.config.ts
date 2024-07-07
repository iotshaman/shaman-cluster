import { ServiceBusConfig } from 'service-bus';

export class AppConfig {
  port: string;
  deviceId: string;
  nic: string;
  primaryNodeApiUri: string;
  dataPath: string;
  pingInterval: number;
  serviceBus: ServiceBusConfig;
}