import { HttpService } from "../services/http.service";
import { ComputeMessageForm } from "../forms/compute-message.form";

export interface IMonitorServiceClient {
  postComputeMessage(form: ComputeMessageForm): Promise<void>;
}

export class MonitorServiceClient extends HttpService implements IMonitorServiceClient {

  constructor(apiBaseUri: string) {
    super(apiBaseUri);
  }

  postComputeMessage(form: ComputeMessageForm): Promise<void> {
    return this.post('compute/message', form);
  }

}