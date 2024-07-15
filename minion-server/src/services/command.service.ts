import { inject, injectable } from "inversify";
import { CommandForm, spawnScript } from "shaman-cluster-lib";
import { TYPES } from "../composition/app.composition.types";
import { IMonitorService } from "./monitor.service";

export interface ICommandService {
  runCommand(requestId: string, command: CommandForm): Promise<void>;
  handleCommandFailure(requestId: string): Promise<void>;
}

@injectable()
export class CommandService implements ICommandService {

  constructor(@inject(TYPES.MonitorService) private monitor: IMonitorService) {
    
  }

  async runCommand(requestId: string, command: CommandForm): Promise<void> {
    const rslt = await spawnScript(command.command, command.args);
    await this.monitor.storeCommandData(requestId, rslt.stdout, rslt.stderr);
    await this.monitor.updateCommandStatus(requestId, 'Success');
  }

  handleCommandFailure(requestId: string): Promise<void> {
    return this.monitor.updateCommandStatus(requestId, 'Error');
  }

}