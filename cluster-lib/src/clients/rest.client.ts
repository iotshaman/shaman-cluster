import { HttpService } from "../services/http.service";
import { IProxyService } from "../services/proxy/proxy.service";
import { PublicProxyService } from "../services/proxy/public-proxy.service";
import { TorProxyService } from "../services/proxy/tor-proxy.service";
import { ProxyConfig } from "../types/proxy-config";

export interface IRestClient {
  Get<T = any>(uri: string, headers?: any): Promise<T>;
  GetHtml(uri: string, headers?: any): Promise<string>;
  Post<T>(webhookUri: string, message: T, headers?: any): Promise<void>;
}

export class RestClient extends HttpService implements IRestClient {

  constructor(apiBaseUri: string, proxyService?: IProxyService) {
    super(apiBaseUri, proxyService);
  }

  Get<T = any>(uri: string, headers?: any): Promise<T> {
    return super.get<T>(uri, headers);
  }

  GetHtml(uri: string, headers?: any): Promise<string> {
    return super.getHtml(uri, headers);
  }

  Post<T>(webhookUri: string, message: T, headers?: any): Promise<void> {
    return this.post<void>(webhookUri, message, headers);
  }

}

export function RestClientFactory(apiBaseUri: string, proxy?: boolean, proxyConfig?: ProxyConfig): IRestClient {
  if (!proxy) return new RestClient(apiBaseUri);
  switch (proxyConfig?.type) {
    case 'tor': return new RestClient(apiBaseUri, new TorProxyService(proxyConfig.proxyAddress));
    default: return new RestClient(apiBaseUri, new PublicProxyService());
  }
}