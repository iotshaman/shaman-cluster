import * as os from 'os';
import * as fs from 'fs';
import * as _path from 'path';
import { Interrogator, Prompt, FileService, newGuid } from "shaman-cluster-lib";
import { AppConfig } from './models/app.config';

async function Setup(debug?: boolean) {
  let responses = await Interrogate();
  if (!!debug) await CreateJsonConfig();
  await UpdateJsonConfig(responses);
  console.log("\r\nConfiguration is complete, you can now run 'npm start' to start a minion server.")
}

function Interrogate(): Promise<{[key: string]: string}> {
  let interfaces = os.networkInterfaces();
  let interfaceKeys = Object.keys(interfaces);
  let interfaceList = interfaceKeys.join('\r\n');

  let interrogator = new Interrogator();
  let questions: Prompt[] = [
    {
      prompt: `What network interface would you like to use (minion)?\r\n${interfaceList}\r\n\r\nEnter Selection: `,
      key: "nic",
      validator: (x: string) => !!interfaces[x]
    },
    {
      prompt: `\r\nWhere you would like to store app data (minion)?\r\nEnter a Directory: `,
      key: "dataPath",
      validator: (x: string) => !!fs.existsSync(x)
    },
    {
      prompt: "\r\nEnter the URL to your Service Bus API (default: http://localhost:9399/api)\r\nEnter URL (or leave blank): ",
      key: "serviceBusUrl"
    },
    {
      prompt: "\r\nEnter the URL to your Root Server API (default: http://localhost:9301/api)\r\nEnter URL (or leave blank): ",
      key: "rootServerUrl"
    }
  ]
  return interrogator.interrogate(questions);
}

function CreateJsonConfig(): Promise<void> {
  let path = _path.join(__dirname, '..', 'app', 'config', 'app.config.json');
  if (fs.existsSync(path)) return Promise.resolve();
  let samplePath = _path.join(__dirname, '..', 'app', 'config', 'app.config.sample.json');
  if (!fs.existsSync(samplePath)) return Promise.reject(new Error("No sample config file found."));
  let fileService = new FileService();
  return fileService.copyFile(samplePath, path);
}

async function UpdateJsonConfig(responses: {[key: string]: string}): Promise<void> {
  let path = _path.join(__dirname, '..', 'app', 'config', 'app.config.json');
  let fileService = new FileService();
  let json = await fileService.readJson<AppConfig>(path);
  json.nic = responses['nic'];
  json.deviceId = newGuid();
  json.dataPath = responses['dataPath'];
  json.serviceBusApiUrl = responses['serviceBusUrl'] || "http://localhost:9399/api";
  json.rootNodeApiUri = responses['rootServerUrl'] || "http://localhost:9301/api";
  json.webhooks[1].rules[0].value = json.deviceId;
  await fileService.writeJson(path, json);
}

console.log("Starting configuration utility for Shaman Cluster Minion Server API:");
let debug = process.argv.some(a => a == "--debug");
Setup(debug).catch(console.error);