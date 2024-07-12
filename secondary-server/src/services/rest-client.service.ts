import { HttpService } from "shaman-cluster-lib";

export class RestClientService extends HttpService {

  constructor(apiBaseUri: string, proxy: boolean) {
    super(apiBaseUri, proxy);
  }

  public get<T = any>(uri: string, headers?: any): Promise<T> {
    return super.get<T>(uri, headers);
  }

}