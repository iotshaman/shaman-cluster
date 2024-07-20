import { RegistrationForm, sqliteDate } from "shaman-cluster-lib";

export class NodeRegistrationModel {
  nodeId?: number;
  deviceId: string;
  instanceId: string;
  nodeName: string;
  ipAddress: string;
  port: string;
  nodeUrl?: string;
  speed: number;
  platform: string;
  processors: number;
  createdDateTime: Date;
  lastRegistrationDateTime: Date;

  public static Create(form: RegistrationForm): NodeRegistrationModel {
    var node = new NodeRegistrationModel();
    node.deviceId = form.deviceId;
    node.instanceId = form.instanceId;
    node.nodeName = form.nodeName;
    node.ipAddress = form.ipAddress;
    node.port = form.port;
    node.nodeUrl = form.nodeUrl;
    node.speed = form.speed;
    node.platform = form.platform;
    node.processors = form.processors;
    node.createdDateTime = sqliteDate();
    node.lastRegistrationDateTime = node.createdDateTime;
    return node;
  }
}