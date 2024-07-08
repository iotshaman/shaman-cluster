import { parentPort, workerData } from 'worker_threads';
import { Configure } from './composition/service-bus.composition';
import { TYPES } from './composition/service-bus.composition.types';
import { MessageModel } from './data/message.model';
import { IMessageProcessor } from './message-processor';
import { IMessageService } from './services/message.service';
import { ServiceBusConfig } from './models/service-bus-config';
import { ServiceBusMessage } from './models/service-bus-message';

// TODO: handle outer-error
initialize().catch(ex => console.dir(ex))

async function initialize() {
  const config = workerData.config as ServiceBusConfig;
  if (!config) throw new Error("Service bus config not provided.");
  let container = await Configure(config, parentPort);
  let messageService = container.get<IMessageService>(TYPES.MessageService);
  let processor = container.get<IMessageProcessor>(TYPES.MessageProcessor);
  let interval = config.workerInterval || 50;
  startMessageHandler(messageService);
  startServiceBusControlLoop(interval, processor);
}

function startMessageHandler(context: IMessageService) {
  parentPort.on("message", async (data: ServiceBusMessage) => {
    let message = new MessageModel();
    message.path = data.path;
    message.body = JSON.stringify(data.body);
    message.args = JSON.stringify(data.args);
    context.addMessage(message).catch(ex => console.dir(ex)); // TODO: properly log error
  });
}

function startServiceBusControlLoop(interval: number, processor: IMessageProcessor) {
  setInterval(async _ => {
    try {
      await processor.processNextMessage()
    } catch(ex) {
      console.dir(ex); // TODO: properly log error
    }
  }, interval)
}
