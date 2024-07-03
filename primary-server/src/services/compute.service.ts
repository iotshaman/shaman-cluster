import { injectable, multiInject } from "inversify";
import { TYPES } from "../composition/app.composition.types";
import { IComputeStrategy } from "../strategies/compute.strategy";
import { ComputeRequestForm } from "shaman-cluster-lib";

export interface IComputeService {
  startProcess(req: ComputeRequestForm): Promise<void>;
}

@injectable()
export class ComputeService implements IComputeService {

  constructor(@multiInject(TYPES.ComputeStrategy) private strategies: IComputeStrategy[]) {

  }

  startProcess(req: ComputeRequestForm): Promise<void> {
    let strategy = this.strategies.find(s => s.name == req.strategy);
    if (!strategy) return Promise.reject(`Invalid strategy: ${req.strategy}.`);
    return strategy.compute(req);
  }

}