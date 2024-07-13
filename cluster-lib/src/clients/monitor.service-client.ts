import { HttpService } from "../services/http.service";
import { ComputeMessageForm } from "../forms/compute-message.form";
import { ComputeDataForm } from "../forms/compute-data.form";
import { ComputeErrorForm } from "../forms/compute-error.form";

export interface IMonitorServiceClient {
  report(form: ComputeMessageForm): Promise<void>;
  store(form: ComputeDataForm): Promise<void>;
  logError(form: ComputeErrorForm): Promise<void>;
}

export class MonitorServiceClient extends HttpService implements IMonitorServiceClient {

  constructor(apiBaseUri: string) {
    super(apiBaseUri);
  }

  report(form: ComputeMessageForm): Promise<void> {
    return this.post('compute/message', form);
  }
  
  store(form: ComputeDataForm): Promise<void> {
    return this.post('compute/data', form);
  }

  logError(form: ComputeErrorForm): Promise<void> {
    return this.post('compute/error', form);
  }

}