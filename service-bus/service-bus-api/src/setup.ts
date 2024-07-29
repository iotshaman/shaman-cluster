import * as _path from 'path';
import * as fs from 'fs';
import { AppConfig } from './models/app.config';
import { FileService } from './services/file.service';

async function Setup(debug?: boolean) {
  let path = _path.join(__dirname, '..', 'app', 'data');
  if (!fs.existsSync(path)) throw new Error("Unable to locate data path.");
  if (!!debug) await CreateJsonConfig();
  await UpdateJsonConfig(_path.join(__dirname, '..', 'app', 'data'));
  console.log("Configuration is complete, you can now run 'npm start' to start your service bus.")
}

function CreateJsonConfig(): Promise<void> {
  let path = _path.join(__dirname, '..', 'app', 'config', 'app.config.json');
  if (fs.existsSync(path)) return Promise.resolve();
  let samplePath = _path.join(__dirname, '..', 'app', 'config', 'app.config.sample.json');
  if (!fs.existsSync(samplePath)) return Promise.reject(new Error("No sample config file found."));
  let fileService = new FileService();
  return fileService.copyFile(samplePath, path);
}

async function UpdateJsonConfig(dataPath: string): Promise<void> {
  let path = _path.join(__dirname, '..', 'app', 'config', 'app.config.json');
  let fileService = new FileService();
  let json = await fileService.readJson<AppConfig>(path);
  json.databaseFilePath = dataPath;
  await fileService.writeJson(path, json);
}

console.log("Starting configuration utility for Shaman Cluster Service Bus API:");
let debug = process.argv.some(a => a == "--debug");
Setup(debug).catch(console.error);