import { ComputeRequestForm } from "shaman-cluster-lib";

export class ComputeArgumentFactory {
  public static GetArguments(req: ComputeRequestForm, chunkId: string): any {
    switch (req.skill) {
      case 'scrape': return {
        skill: req.skill, 
        chunkId: chunkId, 
        requestId: req.requestId,
        render: String(!!req.body.render),
        proxy: String(!!req.body.proxy)
      };
      default: return {
        skill: req.skill, 
        chunkId: chunkId, 
        requestId: req.requestId,
        proxy: String(!!req.body.proxy)
      };
    }
  }
}