import { Agent } from 'https';

export interface IProxyService {
  getAgent(): Promise<Agent>;
}