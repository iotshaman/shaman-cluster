import * as moment from 'moment';
import { inject, injectable } from "inversify";
import { WebhookRegistrationForm } from "../forms/webhook-registration.form";
import { TYPES } from "../composition/app.composition.types";
import { sqliteDate } from "../functions/sqlite.functions";
import { IServiceBusDataContext } from "../data/database.context";
import { WebhookModel } from "../data/models/webhook.model";
import { WebhookTarget } from '../models/webhook-target';
import { RestClientFactory } from '../clients/rest.client';
import { WebhookMutex } from '../models/webhook.mutext';
import { sortDate } from '../functions/date.functions';
import { ProcessorRule } from '../models/processors/processor-rule';

export interface IWebhookService {
  registerWebhook(form: WebhookRegistrationForm): Promise<void>;
  getWebhookTargets(entityPath: string, args: any, entitySubPath?: string): Promise<WebhookTarget[]>;
  getWebhookTarget(entityPath: string, args: any, entitySubPath?: string): Promise<WebhookTarget>;
  releaseWebhookTargetLock(target: WebhookTarget): void;
}

@injectable() 
export class WebhookService implements IWebhookService {

  constructor(
    @inject(TYPES.WebhookMutex) private mutex: WebhookMutex,
    @inject(TYPES.ServiceBusDataContext) private context: IServiceBusDataContext) {
    
  }

  async registerWebhook(form: WebhookRegistrationForm): Promise<void> {
    let model = WebhookModel.Create(form);
    let existingWebhook = await this.context.models.webhook.findOne({
      identity: 'webhookId',
      args: [model.webhookId]
    });
    if (!!existingWebhook) return this.updateWebhook(form);
    model.registeredDateTime = sqliteDate();
    await this.context.models.webhook.insert(model);
  }

  async updateWebhook(form: WebhookRegistrationForm): Promise<void> {
    let model = WebhookModel.Create(form);
    model.registeredDateTime = sqliteDate();
    await this.context.models.webhook.update(model, {
      columns: ['webhookUrl', 'listeners', 'registeredDateTime'],
      conditions: ['webhookId = ?'],
      args: [model.webhookId]
    });
  }

  async getWebhookTargets(entityPath: string, args: any, entitySubPath?: string): Promise<WebhookTarget[]> {
    var start = moment().add(-2, 'minutes').toDate().toISOString();
    let query = {
      conditions: ['registeredDateTime >= ?'],
      args: [start]
    };
    let webhooks = await this.context.models.webhook.find(query);
    webhooks = sortDate(webhooks, 'registeredDateTime');
    let forms = webhooks.map(WebhookModel.ToForm);
    let targets = forms.map(WebhookTarget.Create).reduce((a, b) => [...b, ...a], []);
    return targets.filter(t => {
      if (this.mutex.hasLock(t)) return false;
      if (t.path != entityPath) return false;
      if (!entitySubPath && !!t.subpath) return false;
      if (!!entitySubPath && t.subpath != entitySubPath) return false;
      if (!t.rules?.length) return true;
      return ProcessorRule.matches(t.rules, args);
    });
  }
  
  async getWebhookTarget(entityPath: string, args: any, entitySubPath?: string): Promise<WebhookTarget> {
    let targets = await this.getWebhookTargets(entityPath, args, entitySubPath);
    if (!targets.length) return null;
    for (let target of targets) {
      try {
        if (!this.mutex.lockTarget(target)) continue;
        let client = RestClientFactory(target.webhookUrl.slice(0, -1));
        let result = await client.Get<{status: string}>('api/health');
        if (result.status == "healthy") return target;
        this.mutex.releaseTargetLock(target);
      } catch(_) {
        this.mutex.releaseTargetLock(target);
      }
    }
    return null;
  }

  releaseWebhookTargetLock(target: WebhookTarget): void {
    this.mutex.releaseTargetLock(target);
  }
  
}