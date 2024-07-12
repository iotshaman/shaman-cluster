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
      var result = await client.get(request.requestUri);
      // TODO: send response to monitor
      if (!!req.body.randomDelay) await randomDelay();
    }
    await this.monitorService.postComputeMessage(req.requestId, "All requests have completed.");
  }

  validateArguments<T>(args: any): args is T {
    if (!(args as CollectArgs).apiBaseUri) return false;
    if (!(args as CollectArgs).requests) return false;
    return true;
  }

  private sendProcessStartedMessges(requestId: string, count: number): Promise<void> {
    let message = `Collect skill has started (request count = ${count})`;
    return this.monitorService.postComputeMessage(requestId, message);
  }

}