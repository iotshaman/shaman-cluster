export interface ISkill {
  name: string;
  execute(req: any): Promise<void>;
  validateRequests<T>(req: any): req is T;
}