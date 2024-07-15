import { inject, injectable } from 'inversify';
import { RestClientFactory } from 'shaman-cluster-lib';
import { TYPES } from '../../composition/app.composition.types';
import { CollectArgs } from './collect.args';
import { ISkill } from '../skill';
import { IMonitorService } from '../../services/monitor.service';

@injectable()
export class CollectSkill implements ISkill {

  name: string = 'collect';

  constructor(@inject(TYPES.MonitorService) private monitor: IMonitorService) {

  }

  async execute(req: any): Promise<void> {
    if (!this.validateRequests<CollectArgs>(req)) 
      return Promise.reject("Invalid arguments provided.");
    let client = RestClientFactory(req.apiBaseUri, req.proxy);
    try {
      var result = await client.Get(req.requestUri);
      await this.monitor.store(req.requestId, result, req.args);
    } catch(ex) {
      let error = ex as Error;
      let message = error.message || 'Unkown error';
      let stack = error.stack || 'No stack trace available';
      await this.monitor.logError(req.requestId, message, stack, req.args);
      throw ex;
    }
  }

  validateRequests<T>(req: any): req is T {
    if (!(req as CollectArgs).apiBaseUri) return false;
    if (!(req as CollectArgs).requestUri) return false;
    if (!(req as CollectArgs).args) return false;
    if (!(req as CollectArgs).requestId) return false;
    return true;
  }

}