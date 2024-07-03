import { injectable, multiInject } from "inversify";
import { ComputeRequestForm } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";
import { ISkill } from "../skills/skill";

export interface IComputeService {
  startProcess(req: ComputeRequestForm): Promise<void>;
}

@injectable()
export class ComputeService implements IComputeService {

  constructor(@multiInject(TYPES.Skill) private skills: ISkill[]) {

  }

  startProcess(req: ComputeRequestForm): Promise<void> {
    let skill = this.skills.find(s => req.skill == s.name);
    if (!skill) return Promise.reject(`Skill not supported: ${req.skill}.`);
    return skill.execute(req);
  }

}