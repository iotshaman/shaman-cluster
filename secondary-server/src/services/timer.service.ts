import { inject, injectable } from "inversify";
import { ILogger, SHAMAN_API_TYPES } from "shaman-api";

export interface ITimerService {
  every: (seconds: number, action: () => Promise<void>) => void;
}

@injectable()
export class TimerService implements ITimerService {

  constructor(@inject(SHAMAN_API_TYPES.Logger) private logger: ILogger) { }

  every = (seconds: number, action: () => Promise<void>): void => {
    setInterval(_ => {
      action().catch(ex => {
        this.logger.write(`An error occured while executing timer: ${ex}`, 'error');
      })
    }, seconds * 1000);
  }

}