import * as _path from 'path';
import * as fs from 'fs';
import { AppConfig } from '../models/app.config';
import { FileService } from '../services/file.service';

const appRoot = _path.join(__dirname, '..', '..');
const dataPath = _path.join(appRoot, 'app', 'data');
const configPath = _path.join(appRoot, 'app', 'config', 'app.config.json');
const sampleConfigPath = _path.join(appRoot, 'app', 'config', 'app.config.sample.json');

async function Setup(debug?: boolean) {
  let path = dataPath;
  if (!fs.existsSync(path)) throw new Error("Unable to locate data path.");
  if (!!debug) await CreateJsonConfig();
  await UpdateJsonConfig(dataPath);
  console.log("Configuration is complete, you can now run 'npm start' to start your service bus.")
}

function CreateJsonConfig(): Promise<void> {
  if (fs.existsSync(configPath)) return Promise.resolve();
  if (!fs.existsSync(sampleConfigPath)) return Promise.reject(new Error("No sample config file found."));
  let fileService = new FileService();
  return fileService.copyFile(sampleConfigPath, configPath);
}

async function UpdateJsonConfig(dataPath: string): Promise<void> {
  let fileService = new FileService();
  let json = await fileService.readJson<AppConfig>(configPath);
  json.databaseFilePath = dataPath;
  await fileService.writeJson(configPath, json);
}

console.log("Starting configuration utility for Shaman Cluster Service Bus API:");
let debug = process.argv.some(a => a == "--debug");
Setup(debug).catch(console.error);