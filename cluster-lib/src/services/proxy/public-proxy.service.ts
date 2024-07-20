import { Agent } from "https";
import fetch, { Response, RequestInit } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { IProxyService } from "./proxy.service";

export class PublicProxyService implements IProxyService {

  async getAgent(): Promise<Agent> {
    var list = await this.getProxyList();
    for (let proxy of list) {
      let agent = new HttpsProxyAgent(`http://${proxy}`);
      var ok = await this.validateProxy(agent);
      if (!!ok) return agent;
    }
    return Promise.reject(new Error("No available proxy found."));
  }

  private async getProxyList(): Promise<string[]> {
    let url = `https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all`;
    let data: RequestInit = {
      method: "GET",
      headers: {
        'Accept': 'text/html',
        'Content-Type': 'text/html'
      }
    }
    const response = await fetch(url, data);
    var text = await this.handleApiTextResponse(response);
    return text.split('\r\n');
  }

  private async validateProxy(agent: Agent): Promise<boolean> {
    try {
      let url = `https://google.com/`;
      let data: RequestInit = {
        method: "GET",
        headers: {
          'Accept': 'text/html',
          'Content-Type': 'text/html'
        },
        agent: agent,
        timeout: 3000
      }
      const response = await fetch(url, data);
      return response.ok;
    } catch(_) {
      return false;
    }
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