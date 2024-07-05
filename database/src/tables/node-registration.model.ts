export class NodeRegistrationModel {
  nodeId?: number;
  deviceId: string;
  nodeName: string;
  ipAddress: string;
  port: string;
  speed: number;
  platform: string;
  processors: number;
  createdDateTime: Date;
  lastRegistrationDateTime: Date;
}