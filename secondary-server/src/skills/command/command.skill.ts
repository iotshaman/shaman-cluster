import { injectable } from 'inversify';
import { ComputeRequestForm, spawnScript } from 'shaman-cluster-lib';
import { ISkill } from '../skill';
import { CommandArgs } from './command.args';

@injectable()
export class CommandSkill implements ISkill {

  name: string = 'command';

  async execute(req: ComputeRequestForm): Promise<void> {
    if (!this.validateArguments<CommandArgs>(req.body)) 
      return Promise.reject("Invalid arguments provided.");
    const rslt = await spawnScript(req.body.command, req.body.args);
  }

  validateArguments<T>(args: any): args is T {
    if (!(args as CommandArgs).command) return false;
    if (!(args as CommandArgs).args) return false;
    return true;
  }

}