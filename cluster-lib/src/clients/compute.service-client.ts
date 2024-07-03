import { HttpService } from "../services/http.service";
import { ComputeRequestForm } from "../forms/compute-request.form";

export interface IComputeServiceClient {
  isHealthy(): Promise<boolean>;
  startProcess(req: ComputeRequestForm): Promise<void>;
}

export class ComputeServiceClient extends HttpService implements IComputeServiceClient {

  constructor(apiBaseUri: string) {
    super(apiBaseUri);
  }

  async isHealthy(): Promise<boolean> {
    try {
      const rslt = await this.get('health');
      return rslt.status == 'healthy';
    } catch (_) {
      return false;
    }
  }

  startProcess(req: ComputeRequestForm): Promise<void> {
    return this.post('compute', req);
  }

}

export function ComputeServiceClientFactory(ip: string, port: string): IComputeServiceClient {
  let apiBaseUri = `http://${ip}:${port}/api`;
  return new ComputeServiceClient(apiBaseUri);
} 