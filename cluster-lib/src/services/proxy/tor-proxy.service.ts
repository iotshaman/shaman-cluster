import { Agent } from "https";
import fetch, { RequestInit } from 'node-fetch';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { IProxyService } from "./proxy.service";
import { delay } from "../../functions/async.functions";

export class TorProxyService implements IProxyService {

  constructor(private proxyAddress: string) {}

  async getAgent(): Promise<Agent> {
    let attempt = 0;
    while (attempt < 10) {
      let agent = new SocksProxyAgent(this.proxyAddress);
      let ok = await this.validateProxy(agent);
      if (!!ok) return agent;
      attempt++;
      await delay(500);
    }
    return Promise.reject(new Error("Proxy not available."));
  }

  private async validateProxy(agent: Agent): Promise<boolean> {
    try {
      let url = `https://check.torproject.org/api/ip`;
      let data: RequestInit = {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
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

}