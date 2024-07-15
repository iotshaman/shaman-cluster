import { injectable } from "inversify";
import { HttpService } from "shaman-api";

export interface IRestClient {
  Get<T = any>(uri: string, headers?: any): Promise<T>;
  Post<T>(webhookUri: string, message: T, headers?: any): Promise<void>;
}

@injectable()
export class RestClient extends HttpService implements IRestClient {

  constructor(apiBaseUri: string) {
    super(apiBaseUri);
  }

  Get<T = any>(uri: string, headers?: any): Promise<T> {
    return super.get<T>(uri, headers);
  }

  Post<T>(webhookUri: string, message: T, headers?: any): Promise<void> {
    return this.post<void>(webhookUri, message);
  }

}

export function RestClientFactory(apiBaseUri: string): IRestClient {
  return new RestClient(apiBaseUri);
}