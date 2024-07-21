import { inject, injectable } from "inversify";
import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "../models/app.config";
import { IMessageProcessor } from "../services/message-processor.service";
import { ILogger, SHAMAN_API_TYPES } from "shaman-api";

@injectable()
export class ControlLoopTimer {

  constructor(
    @inject(SHAMAN_API_TYPES.Logger) private logger: ILogger,
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
        this.onError(ex);
      }
    }, this.config.workerInterval)
  }

  private onError(ex: any): void {
    let message = typeof ex === 'string' || ex instanceof String ? ex : (ex.message || "Unkown error.");
    this.logger.write(message, "error");
  }
  
}