import { ComputeRequestForm } from "shaman-cluster-lib";

export interface ISkill {
  name: string;
  execute(req: any): Promise<void>;
  validateRequests<T>(req: any): req is T;
}