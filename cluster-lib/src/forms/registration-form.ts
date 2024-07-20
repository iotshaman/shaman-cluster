export type RegistrationForm = {
  deviceId: string;
  instanceId: string;
  nodeName: string;
  ipAddress: string;
  port: string;
  nodeUrl?: string;
  speed: number;
  platform: string;
  processors: number;
}