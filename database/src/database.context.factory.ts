import * as _path from 'path';
import { IShamanClusterDatabase, ShamanClusterDatabase } from "./database.context";

export const DatabaseContextFactory = {
  Create: async (): Promise<IShamanClusterDatabase> => {
    let folderPath = _path.join(__dirname, '..', '.db');
    let context = new ShamanClusterDatabase();
    context.initialize({
      databaseFilePath: _path.join(folderPath, 'database.sqlite'),
      schemaFilePath: _path.join(folderPath, 'schema.sql')
    });
    await context.createIfNotExists();
    return context;
  }
}