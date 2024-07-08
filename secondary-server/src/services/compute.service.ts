import { inject, injectable, multiInject } from "inversify";
import { ComputeRequestForm } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";
import { IServiceBus } from "service-bus";
import { ISkill } from "../skills/skill";

export interface IComputeService {
  scheduleJob(req: ComputeRequestForm): Promise<void>;
  startProcess(req: ComputeRequestForm): Promise<void>;
}

@injectable()
export class ComputeService implements IComputeService {

  constructor(
    @inject(TYPES.ServiceBus) private serviceBus: IServiceBus,
    @multiInject(TYPES.Skill) private skills: ISkill[]) {

  }

  scheduleJob(req: ComputeRequestForm): Promise<void> {
    return new Promise(res => {
      this.serviceBus.postMessage({
        path: 'jobs',
        body: req,
        args: []
      });
      res();
    })
  }

  startProcess(req: ComputeRequestForm): Promise<void> {
    let skill = this.skills.find(s => req.skill == s.name);
    if (!skill) return Promise.reject(`Skill not supported: ${req.skill}.`);
    // TODO: send update to primary server (started)
    return skill.execute(req);
    // TODO: send update to primary server (complete)
  }

}