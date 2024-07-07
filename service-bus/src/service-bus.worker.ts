import { parentPort, workerData } from 'worker_threads';
import { Configure } from './composition/service-bus.composition';
import { TYPES } from './composition/service-bus.composition.types';
import { MessageModel } from './data/message.model';
import { IMessageProcessor } from './message-processor';
import { IMessageService } from './services/message.service';

// TODO: handle outer-error
initialize().catch(ex => console.dir(ex))

async function initialize() {
  if (!!workerData.config) {
    let container = await Configure(workerData.config, parentPort);
    let messageService = container.get<IMessageService>(TYPES.MessageService);
    let processor = container.get<IMessageProcessor>(TYPES.MessageProcessor);
    let interval = workerData.config.workerInterval || 50;
    startMessageHandler(messageService);
    startServiceBusControlLoop(interval, processor);
  }
}

function startMessageHandler(context: IMessageService) {
  parentPort.on("message", async (message: MessageModel) => {
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
