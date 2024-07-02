import { injectable, inject } from "inversify";
import { IShamanClusterDatabase, NodeRegistrationModel } from "shaman-cluster-database";
import { RegistrationForm } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";

export interface IRegistrationService {
  getRegisteredNodes(): Promise<NodeRegistrationModel[]>;
  registerNode(form: RegistrationForm): Promise<NodeRegistrationModel>;
}

@injectable()
export class RegistrationService implements IRegistrationService {

  constructor(@inject(TYPES.ClusterDatabase) private context: IShamanClusterDatabase) {

  }

  getRegisteredNodes(): Promise<NodeRegistrationModel[]> {
    return this.context.models.registration.find({});
  }

  async registerNode(form: RegistrationForm): Promise<NodeRegistrationModel> {
    var existingNode = await this.context.models.registration.findOne({
      identity: 'deviceId',
      args: [form.deviceId]
    });
    if (!!existingNode) {
      existingNode.ipAddress = form.ipAddress;
      await this.context.models.registration.update(existingNode, {
        columns: ['ipAddress', 'nodeName'],
        conditions: ['deviceId = ?'],
        args: [form.deviceId]
      });
      return existingNode;
    }
    var node = new NodeRegistrationModel();
    node.deviceId = form.deviceId;
    node.nodeName = form.nodeName;
    node.ipAddress = form.ipAddress;
    node.nodeId = await this.context.models.registration.insert(node);
    return node;
  }

}