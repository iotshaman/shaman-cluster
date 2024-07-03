import { ComputeRequestForm } from "shaman-cluster-lib";

export interface ISkill {
  name: string;
  execute(req: ComputeRequestForm): Promise<void>;
  validateArguments<T>(args: any): args is T;
}