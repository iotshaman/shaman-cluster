import { WebhookRegistrationForm } from "../forms/webhook-registration.form";
import { ProcessorRule } from "./processors/processor-rule";

export class WebhookTarget {

  deviceId: string;
  instanceId: string;
  webhookUrl: string;
  webhookPath: string;
  webhookFailurePath: string;
  path: string;
  subpath: string;
  rules?: ProcessorRule[];

  public static Create(form: WebhookRegistrationForm): WebhookTarget[] {
    return form.listeners.map(l => {
      let target = new WebhookTarget();
      target.deviceId = form.deviceId;
      target.instanceId = form.instanceId;
      target.webhookUrl = form.webhookUrl;
      target.webhookPath = l.webhookUri;
      target.webhookFailurePath = l.failureUri;
      target.path = l.path;
      target.subpath = l.subpath;
      target.rules = l.rules || [];
      return target;
    });
  }

}