import { injectable } from "inversify";
import { IShamanClusterDatabase } from "shaman-cluster-database";
import { ComputeRequestForm } from "shaman-cluster-lib";
import { RegisteredClient } from "../models/registered-client";

export interface IComputeStrategy {
  name: string;
  compute(req: ComputeRequestForm): Promise<void>;
}

@injectable()
export abstract class ComputeStrategy implements IComputeStrategy {

  abstract name: string;
  abstract compute(req: ComputeRequestForm): Promise<void>;

  constructor(private context: IShamanClusterDatabase) {}

  public async getHealthNodes(): Promise<RegisteredClient[]> {
    let nodes = await this.context.models.registration.find({});
    if (!nodes.length) return [];
    let clients = nodes.map(n => new RegisteredClient(n));
    let healthCheckTasks = clients.map(c => 
      c.client.isHealthy().then(rslt => {c.healthy = rslt; return c;})
    );
    var results = await Promise.all(healthCheckTasks)
    return results.filter(c => c.healthy);
  }

}