import * as fs from 'fs';
import { URL } from 'url';
import { Agent } from 'https';
import fetch, { Response, RequestInit } from 'node-fetch';
import { IProxyService } from './proxy/proxy.service';

export abstract class HttpService {

  constructor(private apiBaseUri: string, private proxyService?: IProxyService) {}

  protected async getHtml(uri: string, headers: any = {}): Promise<string> {
    let url = this.buildUrl(uri);
    let data: RequestInit = {
      method: "GET",
      headers: {
        'Accept': 'text/html',
        'Content-Type': 'text/html',
        ...headers
      },
      agent: await this.getProxyAgent()
    }
    const response = await fetch(url, data);
    return this.handleApiTextResponse(response);
  }

  protected async get<T = any>(uri: string, headers: any = {}): Promise<T> {
    let url = this.buildUrl(uri);
    let data: RequestInit = {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      agent: await this.getProxyAgent()
    }
    const response = await fetch(url, data);
    return this.handleApiResponse(response);
  }

  protected async post<T = any>(uri: string, body: any, headers: any = {}): Promise<T> {
    let url = this.buildUrl(uri);
    let data: RequestInit = {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      agent: await this.getProxyAgent()
    }
    const response = await fetch(url, data);
    return this.handleApiResponse(response);
  }

  protected async patch<T = any>(uri: string, body: any, headers: any = {}): Promise<T> {
    let url = this.buildUrl(uri);
    let data: RequestInit = {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      agent: await this.getProxyAgent()
    }
    const response = await fetch(url, data);
    return this.handleApiResponse(response);
  }

  protected async put<T = any>(uri: string, body: any, headers: any = {}): Promise<T> {
    let url = this.buildUrl(uri);
    let data: RequestInit = {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      agent: await this.getProxyAgent()
    }
    const response = await fetch(url, data);
    return this.handleApiResponse(response);
  }

  protected async delete<T = any>(uri: string, headers: any = {}): Promise<T> {
    let url = this.buildUrl(uri);
    let data: RequestInit = {
      method: "DELETE",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      agent: await this.getProxyAgent()
    }
    const response = await fetch(url, data);
    return this.handleApiResponse(response);
  }

  protected downloadFile(uri: string, outputPath: string): Promise<void> {
    return new Promise((res, err) => {
      let url = `${this.apiBaseUri}/${uri}`;
      fetch(url).then((response: Response) => {
        const fileStream = fs.createWriteStream(outputPath);
        response.body.pipe(fileStream);
        response.body.on("error", err);
        fileStream.on("finish", res);
      });
    });
  }

  private buildUrl(uri: string): string {
    let url = new URL(this.apiBaseUri);
    if (!url.pathname) url.pathname = uri;
    else {
      if (url.pathname.endsWith('/')) url.pathname += uri;
      else url.pathname += `/${uri}`;
    }
    return url.toString();
  }

  private handleApiResponse<T = any>(response: Response): Promise<T> {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    if (response.status === 202 || response.status == 204) 
      return Promise.resolve(undefined);
    return response.json() as Promise<T>;
  }

  private handleApiTextResponse(response: Response): Promise<string> {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    if (response.status === 202 || response.status == 204) 
      return Promise.resolve(undefined);
    return response.text() as Promise<string>;
  }

  private getProxyAgent(): Promise<Agent> {
    if (!this.proxyService) return null;
    return this.proxyService.getAgent();
  }

}