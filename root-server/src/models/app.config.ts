export class AppConfig {
  port: string;
  serviceBusApiUrl: string;
  storageFolderPath: string;
  bodyParser?: {
    limit: string;
    extended?: boolean;
    parameters?: number;
  };
}