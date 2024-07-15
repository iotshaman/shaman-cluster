import { inject, injectable } from "inversify";
import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "../models/app.config";
import { IMessageProcessor } from "../services/message-processor.service";

@injectable()
export class ControlLoopTimer {

  constructor(
    @inject(TYPES.AppConfig) private config: AppConfig,
    @inject(TYPES.MessageProcessor) private processor: IMessageProcessor) {
    
  }

  async start(): Promise<void> {
    setImmediate(async () => {
      await this.processor.processNextMessage();
    })
    setInterval(async _ => {
      try {
        await this.processor.processNextMessage();
        await this.processor.processNextDeadletterMessage();
      } catch(ex) {
        console.dir(ex); // TODO: properly log error
      }
    }, this.config.workerInterval)
  }
  
}