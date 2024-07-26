import * as url from 'url';
import { injectable, inject } from "inversify";
import { IShamanClusterDatabase } from "../data/database.context";
import { TYPES } from "../composition/app.composition.types";
import { ComputeStatus } from "../models/compute-status";
import { CommandStatus } from "../models/command-status";
import { RestClientFactory } from "shaman-cluster-lib";
import { ILogger } from 'shaman-api';

export interface INotificationService {
  notify(requestId: string, requestType: string, status: ComputeStatus | CommandStatus): Promise<void>;
}

@injectable()
export class NotificationService implements INotificationService {

  constructor(
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.ClusterDatabase) private context: IShamanClusterDatabase) {

  }

  async notify(requestId: string, requestType: string, status: ComputeStatus | CommandStatus): Promise<void> {
    var webhooks = await this.context.models.request_webhook.find({
      conditions: ['requestId = ?', 'requestType = ?'],
      args: [requestId, requestType]
    });
    if (!webhooks.length) return Promise.resolve();
    let webhook = webhooks[0];
    var urlx = url.parse(webhook.webhook);
    var baseUri = `${urlx.protocol}//${urlx.host}`
    var client = RestClientFactory(baseUri);
    await client.Post(urlx.pathname, {requestId, requestType, status}).catch(ex => {
      let message = typeof ex === 'string' || ex instanceof String ? ex : (ex.message || "Unkown error.");
      this.logger.write(`Unable to send status notification: ${message}`);
    })
  }

}