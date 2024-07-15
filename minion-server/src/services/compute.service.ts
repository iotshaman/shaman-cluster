import { inject, injectable, multiInject } from "inversify";
import { TYPES } from "../composition/app.composition.types";
import { ISkill } from "../skills/skill";
import { IMonitorService } from "./monitor.service";

export interface IComputeService {
  compute(requestId: string, chunkId: string, skill: string, body: any): Promise<void>;
  handleComputeFailure(requestId: string, chunkId: string): Promise<void>;
}

@injectable()
export class ComputeService implements IComputeService {

  constructor(
    @multiInject(TYPES.Skill) private skills: ISkill[],
    @inject(TYPES.MonitorService) private monitor: IMonitorService) {}

  async compute(requestId: string, chunkId: string, skillName: string, body: any): Promise<void> {
    let skill = this.skills.find(s => s.name == skillName);
    if (!skill) return Promise.reject(new Error(`Invalid skill provided: ${skillName}.`));
    await skill.execute(body);
    await this.monitor.updateChunkStatus(requestId, chunkId, 'Success');
  }

  handleComputeFailure(requestId: string, chunkId: string): Promise<void> {
    return this.monitor.updateChunkStatus(requestId, chunkId, 'Error');
  }

}