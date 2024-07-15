export interface ITimerService {
  every(seconds: number, action: () => Promise<void>): NodeJS.Timer;
  stop(timer: NodeJS.Timer): void;
}

export class TimerService implements ITimerService {

  every(seconds: number, action: () => Promise<void>): NodeJS.Timer {
    return setInterval(_ => {
      action().catch(ex => {
        // TODO: bubble error
       })
    }, seconds * 1000);
  }

  stop(timer: NodeJS.Timer): void {
    clearInterval(timer);
  }

}