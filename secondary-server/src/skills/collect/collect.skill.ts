import { inject, injectable } from 'inversify';
import { ComputeRequestForm, randomDelay } from 'shaman-cluster-lib';
import { ISkill } from '../skill';
import { CollectArgs } from './collect.args';
import { TYPES } from '../../composition/app.composition.types';
import { IMonitorService } from '../../services/monitor.service';
import { RestClientService } from '../../services/rest-client.service';

@injectable()
export class CollectSkill implements ISkill {

  name: string = 'collect';

  constructor(@inject(TYPES.MonitorService) private monitorService: IMonitorService) {}

  async execute(req: ComputeRequestForm): Promise<void> {
    if (!this.validateArguments<CollectArgs>(req.body)) 
      return Promise.reject("Invalid arguments provided.");
    await this.sendProcessStartedMessges(req.requestId, req.body.requests.length);
    let client = new RestClientService(req.body.apiBaseUri, !!req.body.proxy);
    for (let request of req.body.requests) {
      try {
        var result = await client.get(request.requestUri);
        await this.monitorService.store(req.requestId, result, request.args);
      } catch(ex) {
        let error = ex as Error;
        let message = error.message || 'Unkown error';
        let stack = error.stack || 'No stack trace available';
        await this.monitorService.logError(req.requestId, message, stack, request.args);
      }
      if (!!req.body.randomDelay) await randomDelay();
    }
    await this.monitorService.report(req.requestId, "All requests have completed.");
  }

  validateArguments<T>(args: any): args is T {
    if (!(args as CollectArgs).apiBaseUri) return false;
    if (!(args as CollectArgs).requests) return false;
    return true;
  }

  private sendProcessStartedMessges(requestId: string, count: number): Promise<void> {
    let message = `Collect skill has started (request count = ${count})`;
    return this.monitorService.report(requestId, message);
  }

}