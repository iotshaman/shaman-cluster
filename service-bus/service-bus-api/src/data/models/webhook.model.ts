import { WebhookRegistrationForm } from "../../forms/webhook-registration.form";

export class WebhookModel {
  webhookId: string;
  deviceId: string;
  instanceId: string;
  webhookUrl: string;
  listeners: string;
  registeredDateTime: Date;

  public static Create(form: WebhookRegistrationForm): WebhookModel {
    let model = new WebhookModel();
    model.webhookId = `${form.deviceId}:${form.instanceId}`;
    model.deviceId = form.deviceId;
    model.instanceId = form.instanceId;
    model.webhookUrl = form.webhookUrl;
    model.listeners = JSON.stringify(form.listeners);
    return model;
  }

  public static ToForm(model: WebhookModel): WebhookRegistrationForm {
    return {
      deviceId: model.deviceId,
      instanceId: model.instanceId,
      webhookUrl: model.webhookUrl,
      listeners: JSON.parse(model.listeners)
    };
  }

}