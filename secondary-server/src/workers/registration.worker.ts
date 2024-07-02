import { inject, injectable } from "inversify";
import { ITimerService } from "../services/timer.service";
import { TYPES } from "../composition/app.composition.types";
import { PrimaryNodeServiceClient, RegistrationForm } from "shaman-cluster-lib";

@injectable()
export class RegistrationWorker {
  constructor(
    @inject(TYPES.TimerService) private timer: ITimerService,
    @inject(TYPES.PrimaryNodeServiceClient) private client: PrimaryNodeServiceClient) {
    
  }

  start(): void {
    this.timer.every(5, () => { // TODO: change timer to longer interval
      console.log('Registering node');
      let form: RegistrationForm = {
        deviceId: "000000007ef60a48", // TODO: get device id
        nodeName: 'node-3', // TODO: get hostname
        ipAddress: "10.42.0.253" // TODO: get ip address
      }
      return this.client.registerNode(form);
    })
  }
}