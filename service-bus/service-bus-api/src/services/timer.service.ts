export interface ITimerService {
  every(seconds: number, action: () => Promise<void>): NodeJS.Timer;
  stop(timer: NodeJS.Timer): void;
  registerErrorHandler(onError: (ex: any) => Promise<void>): void;
}

export class TimerService implements ITimerService {

  private errorHandler: (ex: any) => Promise<void>;

  every(seconds: number, action: () => Promise<void>): NodeJS.Timer {
    return setInterval(_ => { action().catch(this.onError); }, seconds * 1000);
  }

  stop(timer: NodeJS.Timer): void {
    clearInterval(timer);
  }

  registerErrorHandler(onError: (ex: any) => Promise<void>): void {
    this.errorHandler = onError;
  }

  private onError(ex: any): Promise<void> {
    if (!!this.errorHandler) return this.errorHandler(ex);
    let message = typeof ex === 'string' || ex instanceof String ? ex : (ex.message || "Unkown error.");
    console.log(`${new Date().toISOString()} ERROR: ${message}`);
    return Promise.resolve();
  }

}