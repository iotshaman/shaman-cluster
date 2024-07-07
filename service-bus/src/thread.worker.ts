import { Worker as BackgroundWorker } from "worker_threads";

export class ThreadWorker {

  worker: BackgroundWorker;

  constructor(workerPath: string, data: any) {
    this.worker = new BackgroundWorker(workerPath, {workerData: data});
    this.worker.on("error", (msg) => console.error(msg));
  }

  postMessage = (message: any): void => {
    this.worker.postMessage(message);
  }

}