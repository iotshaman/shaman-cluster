import * as _path from 'path';
import * as fs from 'fs';
import { AppConfig } from './models/app.config';
import { FileService } from './services/file.service';

async function Setup() {
  let path = _path.join(__dirname, '..', 'app', 'data');
  if (!fs.existsSync(path)) throw new Error("Unable to locate data path.");
  await UpdateJson(_path.join(__dirname, '..', 'app', 'data'));
  console.log("Configuration is complete, you can now run 'npm start' to start your service bus.")
}

async function UpdateJson(dataPath: string): Promise<void> {
  let path = _path.join(__dirname, '..', 'app', 'config', 'app.config.json');
  let fileService = new FileService();
  let json = await fileService.readJson<AppConfig>(path);
  json.databaseFilePath = dataPath;
  await fileService.writeJson(path, json);
}

Setup().catch(console.error);