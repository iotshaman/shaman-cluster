import { inject, injectable } from 'inversify';
import { ComputeRequestForm, spawnScript } from 'shaman-cluster-lib';
import { ISkill } from '../skill';
import { CommandArgs } from './command.args';
import { TYPES } from '../../composition/app.composition.types';
import { IMonitorService } from '../../services/monitor.service';

@injectable()
export class CommandSkill implements ISkill {

  name: string = 'command';

  constructor(@inject(TYPES.MonitorService) private monitorService: IMonitorService) {}

  async execute(req: ComputeRequestForm): Promise<void> {
    if (!this.validateArguments<CommandArgs>(req.body)) 
      return Promise.reject("Invalid arguments provided.");
    const rslt = await spawnScript(req.body.command, req.body.args);
    if (!!rslt.stderr)
      await this.monitorService.report(req.requestId, `Error: ${rslt.stderr}`);
    else 
      await this.monitorService.report(req.requestId, `Success: ${rslt.stdout}`);
  }

  validateArguments<T>(args: any): args is T {
    if (!(args as CommandArgs).command) return false;
    if (!(args as CommandArgs).args) return false;
    return true;
  }

}