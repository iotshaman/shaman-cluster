export type ScrapeArgs = {
  requestId: string;
  apiBaseUri: string; 
  requestUri: string;
  args: any;
  proxy?: boolean;
  render?: boolean;
}