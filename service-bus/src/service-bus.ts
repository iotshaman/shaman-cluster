import * as _path from 'path';
import { ServiceBusConfig } from "./models/service-bus-config";
import { ThreadWorker } from './thread.worker';
import { ServiceBusMessage } from './models/service-bus-message';

export interface IServiceBus {
  postMessage(message: ServiceBusMessage): void;
}

export class ServiceBus implements IServiceBus {

  private worker: ThreadWorker;

  constructor(config: ServiceBusConfig) {
    let scriptPath = _path.join(__dirname, 'service-bus.worker.js');
    this.worker = new ThreadWorker(scriptPath, {config});
  }

  postMessage(message: ServiceBusMessage): void {
    this.worker.postMessage(message);
  }

}