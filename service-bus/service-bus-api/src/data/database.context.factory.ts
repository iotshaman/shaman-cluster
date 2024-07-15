import * as _path from 'path';
import { IServiceBusDataContext, ServiceBusDataContext } from "./database.context";

export const DatabaseContextFactory = {
  Create: async (dataPath: string): Promise<IServiceBusDataContext> => {
    let context = new ServiceBusDataContext();
    context.initialize({
      databaseFilePath: _path.join(dataPath, 'database.sqlite'),
      schemaFilePath: _path.join(dataPath, 'schema.sql')
    });
    await context.createIfNotExists();
    return context;
  }
}