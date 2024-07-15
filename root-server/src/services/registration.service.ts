import * as moment from 'moment';
import { injectable, inject } from "inversify";
import { RegistrationForm, sqliteDate } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";
import { NodeRegistrationModel } from "../data/models/node-registration.model";
import { IShamanClusterDatabase } from "../data/database.context";

export interface IRegistrationService {
  getRegisteredNodes(): Promise<NodeRegistrationModel[]>;
  registerNode(form: RegistrationForm): Promise<NodeRegistrationModel>;
  getActiveNodes(): Promise<NodeRegistrationModel[]>;
}

@injectable()
export class RegistrationService implements IRegistrationService {

  constructor(@inject(TYPES.ClusterDatabase) private context: IShamanClusterDatabase) {

  }

  getRegisteredNodes(): Promise<NodeRegistrationModel[]> {
    return this.context.models.registration.find({});
  }

  getActiveNodes(): Promise<NodeRegistrationModel[]> {
    var start = moment().add(-2, 'minutes').toDate().toISOString();
    return this.context.models.registration.find({
      conditions: ['lastRegistrationDateTime > ?'],
      args: [start]
    });
  }

  async registerNode(form: RegistrationForm): Promise<NodeRegistrationModel> {
    var existingNodes = await this.context.models.registration.find({
      conditions: ['deviceId = ?', 'instanceId = ?'],
      args: [form.deviceId, form.instanceId]
    });
    if (!existingNodes.length) {
      var node = NodeRegistrationModel.Create(form);
      node.nodeId = await this.context.models.registration.insert(node);
      return node;
    }
    let existingNode = existingNodes[0];
    existingNode.ipAddress = form.ipAddress;
    existingNode.lastRegistrationDateTime = sqliteDate();
    await this.context.models.registration.update(existingNode, {
      columns: ['ipAddress', 'port', 'nodeName', 'lastRegistrationDateTime'],
      conditions: ['deviceId = ?', 'instanceId = ?'],
      args: [form.deviceId, form.instanceId]
    });
    return existingNode;
  }

}