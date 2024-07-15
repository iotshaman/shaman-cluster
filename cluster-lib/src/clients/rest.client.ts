import { HttpService } from "../services/http.service";

export interface IRestClient {
  Get<T = any>(uri: string, headers?: any): Promise<T>;
  Post<T>(webhookUri: string, message: T, headers?: any): Promise<void>;
}

export class RestClient extends HttpService implements IRestClient {

  constructor(apiBaseUri: string, proxy?: boolean) {
    super(apiBaseUri, proxy);
  }

  Get<T = any>(uri: string, headers?: any): Promise<T> {
    return super.get<T>(uri, headers);
  }

  Post<T>(webhookUri: string, message: T, headers?: any): Promise<void> {
    return this.post<void>(webhookUri, message);
  }

}

export function RestClientFactory(apiBaseUri: string, proxy?: boolean): IRestClient {
  return new RestClient(apiBaseUri, proxy);
}