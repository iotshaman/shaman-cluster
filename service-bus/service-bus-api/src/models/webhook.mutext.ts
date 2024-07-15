import { injectable } from "inversify";
import { WebhookTarget } from "./webhook-target";

@injectable()
export class WebhookMutex {

  locks: {[deviceInstance: string]: boolean} = {};

  lockTarget(target: WebhookTarget): boolean {
    let deviceInstance = `${target.deviceId}:${target.instanceId}`;
    if (!!this.locks[deviceInstance]) return false;
    this.locks[deviceInstance] = true;
    return true;
  }

  releaseTargetLock(target: WebhookTarget) {
    let deviceInstance = `${target.deviceId}:${target.instanceId}`;
    this.locks[deviceInstance] = false;
  }

  hasLock(target: WebhookTarget): boolean {
    let deviceInstance = `${target.deviceId}:${target.instanceId}`;
    return !!this.locks[deviceInstance];
  }

}