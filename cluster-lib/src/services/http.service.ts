import * as fs from 'fs';
import fetch, { Response } from 'node-fetch';

export abstract class HttpService {

  constructor(private apiBaseUri: string) {}

  protected async getHtml(uri: string, headers: any = {}): Promise<string> {
    let url = `${this.apiBaseUri}/${uri}`;
    let data = {
      method: "GET",
      headers: {
        'Accept': 'text/html',
        'Content-Type': 'text/html',
        ...headers
      }
    }
    const response = await fetch(url, data);
    return this.handleApiTextResponse(response);
  }

  protected async get<T = any>(uri: string, headers: any = {}): Promise<T> {
    let url = `${this.apiBaseUri}/${uri}`;
    let data = {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    }
    const response = await fetch(url, data);
    return this.handleApiResponse(response);
  }

  protected async post<T = any>(uri: string, body: any, headers: any = {}): Promise<T> {
    let url = `${this.apiBaseUri}/${uri}`;
    let data = {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    }
    const response = await fetch(url, data);
    return this.handleApiResponse(response);
  }

  protected async patch<T = any>(uri: string, body: any, headers: any = {}): Promise<T> {
    let url = `${this.apiBaseUri}/${uri}`;
    let data = {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    }
    const response = await fetch(url, data);
    return this.handleApiResponse(response);
  }

  protected async put<T = any>(uri: string, body: any, headers: any = {}): Promise<T> {
    let url = `${this.apiBaseUri}/${uri}`;
    let data = {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    }
    const response = await fetch(url, data);
    return this.handleApiResponse(response);
  }

  protected async delete<T = any>(uri: string, headers: any = {}): Promise<T> {
    let url = `${this.apiBaseUri}/${uri}`;
    let data = {
      method: "DELETE",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
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

}