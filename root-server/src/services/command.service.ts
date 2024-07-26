import { inject, injectable } from "inversify";
import { TYPES } from "../composition/app.composition.types";
import { IServiceBusClient, ServiceBusMessage } from "service-bus-client";
import { CommandDataForm, CommandForm, newGuid, sqliteDate } from "shaman-cluster-lib";
import { IRegistrationService } from "./registration.service";
import { CommandRequestModel } from "../data/models/command-request.model";
import { IShamanClusterDatabase } from "../data/database.context";
import { CommandRequestDataModel } from "../data/models/command-request-data.model";
import { CommandStatus } from "../models/command-status";

export interface ICommandService {
  scheduleCommand(form: CommandForm): Promise<void>;
  storeData(form: CommandDataForm): Promise<void>;
  updateCommandStatus(requestId: string, deviceId: string, status: string): Promise<void>;
  getCommandStatus(requestId: string): Promise<CommandStatus>;
}

@injectable()
export class CommandService implements ICommandService {

  constructor(
    @inject(TYPES.RegistrationService) private registrationService: IRegistrationService,
    @inject(TYPES.ServiceBusClient) private serviceBus: IServiceBusClient,
    @inject(TYPES.ClusterDatabase) private context: IShamanClusterDatabase) {

  }

  async scheduleCommand(form: CommandForm): Promise<void> {
    let args = {requestId: newGuid()};
    let targets = await this.registrationService.getActiveNodes();
    if (!!form.targetId) targets = [targets.find(t => t.deviceId == form.targetId)];
    if (!targets.length) return Promise.reject(new Error("No active targets found."));
    let targetIds = targets.map(t => t.deviceId);
    let uniqueTargets = [...new Set(targetIds)];
    let messages: ServiceBusMessage[] = uniqueTargets.map(t => ({
      path: 'command',
      body: form,
      args: Object.assign({targetId: t}, args)
    }));
    await this.saveCommandRequests(args.requestId, messages);
    return this.serviceBus.postMessages(messages);
  }

  async storeData(message: CommandDataForm): Promise<void> {
    let model = new CommandRequestDataModel();
    model.requestId = message.requestId;
    model.deviceId = message.deviceId;
    model.stdout = message.stdout;
    model.stderr = message.stderr;
    model.messageDateTime = sqliteDate();
    await this.context.models.command_request_data.insert(model);
  }

  async updateCommandStatus(requestId: string, deviceId: string, status: string): Promise<void> {
    let commands = await this.context.models.command_request.find({
      conditions: ['requestId = ?', 'deviceId = ?'],
      args: [requestId, deviceId]
    });
    if (!commands.length) return Promise.reject(new Error("Command request not found."));
    let command = commands[0];
    command.status = status;
    command.complete = 'Y';
    await this.context.models.command_request.update(command, {
      columns: ['status', 'complete'],
      conditions: ['requestId = ?', 'deviceId = ?'],
      args: [requestId, deviceId]
    });
  }

  async getCommandStatus(requestId: string): Promise<CommandStatus> {
    let chunks = await this.context.models.command_request.find({
      conditions: ['requestId = ?'],
      args: [requestId]
    });
    return {
      success: chunks.filter(c => c.status == 'Success').length,
      pending: chunks.filter(c => c.status == 'Pending').length,
      error: chunks.filter(c => c.status == 'Error').length
    }
  }

  private async saveCommandRequests(requestId: string, messages: ServiceBusMessage[]): Promise<void> {
    for (let m of messages) {
      let model = new CommandRequestModel();
      model.requestId = requestId;
      model.requestDate = sqliteDate();
      model.deviceId = m.args.targetId;
      model.body = JSON.stringify(m.body);
      model.complete = 'N';
      model.status = 'Pending';
      await this.context.models.command_request.insert(model);
    }
  }

}