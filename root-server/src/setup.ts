import * as os from 'os';
import * as fs from 'fs';
import * as _path from 'path';
import { Interrogator, Prompt, RestClientFactory, FileService, newGuid } from "shaman-cluster-lib";
import { AppConfig } from './models/app.config';

async function Setup() {
  let responses = await Interrogate();
  let serviceBusUrl = responses['serviceBusUrl'] || "http://localhost:9399/api";
  let serviceBusHealthy = await CheckServiceHealth(serviceBusUrl);
  if (!serviceBusHealthy) return Promise.reject(new Error("Service bus not available."));
  await UpdateJson(responses);
  console.log("\r\nConfiguration is complete, you can now run 'npm start' to start your root server.")
}

function Interrogate(): Promise<{[key: string]: string}> {
  let interfaces = os.networkInterfaces();
  let interfaceKeys = Object.keys(interfaces);
  let interfaceList = interfaceKeys.join('\r\n');

  let interrogator = new Interrogator();
  let questions: Prompt[] = [
    {
      prompt: `What network interface would you like to use?\r\n${interfaceList}\r\n\r\nEnter Selection: `,
      key: "nic",
      validator: (x: string) => !!interfaces[x]
    },
    {
      prompt: `\r\nWhere you would like to store app data?\r\nEnter a Directory: `,
      key: "dataPath",
      validator: (x: string) => !!fs.existsSync(x)
    },
    {
      prompt: "\r\nEnter the URL to your Service Bus API (default: http://localhost:9399/api)\r\nEnter URL (or leave blank): ",
      key: "serviceBusUrl"
    }
  ]
  return interrogator.interrogate(questions);
}

async function CheckServiceHealth(apiBaseUri: string): Promise<boolean> {
  let client = RestClientFactory(apiBaseUri);
  try {
    const rslt = await client.Get<{ status: string; }>('health');
    return rslt.status == "healthy";
  } catch (_) {
    return false;
  }
}

async function UpdateJson(responses: {[key: string]: string}): Promise<void> {
  let path = _path.join(__dirname, '..', 'app', 'config', 'app.config.json');
  let fileService = new FileService();
  let json = await fileService.readJson<AppConfig>(path);
  json.nic = responses['nic'];
  json.deviceId = newGuid();
  json.storageFolderPath = responses['dataPath'];
  json.serviceBusApiUrl = responses['serviceBusUrl'] || "http://localhost:9399/api";
  await fileService.writeJson(path, json);
}

Setup().catch(console.error);