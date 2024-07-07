import * as _path from 'path';
import { IServiceBusDataDatabase, ServiceBusDataDatabase } from "./database.context";

export const DatabaseContextFactory = {
  Create: async (dataPath: string): Promise<IServiceBusDataDatabase> => {
    let context = new ServiceBusDataDatabase();
    context.initialize({
      databaseFilePath: _path.join(dataPath, 'database.sqlite'),
      schemaFilePath: _path.join(__dirname, '..', '..', 'sql', 'schema.sql')
    });
    await context.createIfNotExists();
    return context;
  }
}