import * as fs from 'fs';
import * as _path from 'path';
import { FileService, IFileService, Interrogator, Prompt } from 'shaman-cluster-lib';
import { AppConfig } from '../models/app.config';

const appRoot = _path.join(__dirname, '..', '..');
const configPath = _path.join(appRoot, 'app', 'config', 'app.config.json');
const fileService: IFileService = new FileService();

async function Setup() {
  if (!fs.existsSync(configPath)) return Promise.reject(new Error("App config not found."));
  let responses = await Interrogate();
  await UpdateJsonConfig(responses);
  console.log("\r\nBrowser configuration is complete.");
}

function Interrogate(): Promise<{[key: string]: string}> {
  let interrogator = new Interrogator();
  let questions: Prompt[] = [
    {
      prompt: `What is the absolute path to your Chromium executable?\r\nEnter Selection: `,
      key: "chromiumPath",
      validator: (x: string) => !!fs.existsSync(x)
    }
  ]
  return interrogator.interrogate(questions);
}

async function UpdateJsonConfig(responses: {[key: string]: string}): Promise<void> {
  let json = await fileService.readJson<AppConfig>(configPath);
  json.chromiumPath = responses["chromiumPath"];
  await fileService.writeJson(configPath, json);
}

Setup().catch(console.error);