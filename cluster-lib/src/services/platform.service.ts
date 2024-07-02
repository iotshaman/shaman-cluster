import * as os from 'os';
import * as fs from 'fs';
import * as _path from 'path';
import { PlatformConfig } from '../types/platform-config';
import { combinations } from '../functions/math.functions';

export interface IPlatformService {
  getPlatformConfig(dataPath: string): PlatformConfig;
  savePlatformConfig(dataPath: string, config: PlatformConfig): void;
  getHostname(): string;
  getIpAddress(nic: string): string;
  getSpeedScore(): number;
}

export class PlatformService implements IPlatformService {

  getPlatformConfig(dataPath: string): PlatformConfig {
    let path = _path.join(dataPath, 'platform-config.json');
    if (!fs.existsSync(path)) return null;
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  }

  savePlatformConfig(dataPath: string, config: PlatformConfig): void {
    let content = JSON.stringify(config, null, 2);
    fs.writeFileSync(_path.join(dataPath, 'platform-config.json'), content);
  }

  getHostname(): string {
    return os.hostname();
  }

  getIpAddress(nic: string): string {
    let interfaces = os.networkInterfaces();
    if (!interfaces[nic]) return 'N/A';
    let addr = interfaces[nic].find(i => i.netmask == '255.255.255.0');
    return !addr ? 'N/A' : addr.address;
  }

  getSpeedScore(): number {
    let start = new Date().getTime();
    combinations(25, 10);
    let end = new Date().getTime();
    return end - start;
  }

}