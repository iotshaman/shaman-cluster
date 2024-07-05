import { inject } from "inversify";
import { IShamanClusterDatabase } from "shaman-cluster-database";
import { ComputeRequestForm } from "shaman-cluster-lib";
import { TYPES } from "../../composition/app.composition.types";
import { ComputeStrategy } from "../compute.strategy";

export class BroadcastComputeStrategy extends ComputeStrategy {

  name: string = 'broadcast';

  constructor(@inject(TYPES.ClusterDatabase) context: IShamanClusterDatabase) {
    super(context);
  }
  
  async compute(req: ComputeRequestForm): Promise<void> {
    let nodes = await this.getHealthNodes();
    if (!nodes.length) return Promise.reject(new Error("No nodes available."));
    let computeTasks = nodes.map(n => n.client.startProcess(req));
    var results = await Promise.all(computeTasks);
  }

}