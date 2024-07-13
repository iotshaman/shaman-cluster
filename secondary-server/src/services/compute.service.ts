import { inject, injectable, multiInject } from "inversify";
import { ComputeRequestForm } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";
import { IServiceBus } from "service-bus";
import { ISkill } from "../skills/skill";
import { IMonitorService } from "./monitor.service";

export interface IComputeService {
  scheduleJob(req: ComputeRequestForm): Promise<void>;
  startProcess(req: ComputeRequestForm): Promise<void>;
}

@injectable()
export class ComputeService implements IComputeService {

  constructor(
    @inject(TYPES.ServiceBus) private serviceBus: IServiceBus,
    @inject(TYPES.MonitorService) private monitorService: IMonitorService,
    @multiInject(TYPES.Skill) private skills: ISkill[]) {

  }

  async scheduleJob(req: ComputeRequestForm): Promise<void> {
    await this.monitorService.report(req.requestId, "Compute request has been queued.");
    this.serviceBus.postMessage({
      path: 'jobs',
      body: req,
      args: []
    });
  }

  async startProcess(req: ComputeRequestForm): Promise<void> {
    let skill = this.skills.find(s => req.skill == s.name);
    if (!skill) return Promise.reject(`Skill not supported: ${req.skill}.`);
    await this.monitorService.report(req.requestId, "Compute request has started.")
    await skill.execute(req);
    await this.monitorService.report(req.requestId, "Compute request complete.");
  }

}