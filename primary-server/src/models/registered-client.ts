import { NodeRegistrationModel } from "shaman-cluster-database";
import { IComputeServiceClient, ComputeServiceClientFactory } from "shaman-cluster-lib";

export class RegisteredClient {
  node: NodeRegistrationModel;
  client: IComputeServiceClient
  healthy: boolean;

  constructor(node: NodeRegistrationModel) {
    this.node = node;
    this.client = ComputeServiceClientFactory(node.ipAddress, node.port);
    this.healthy = false;
  }
}