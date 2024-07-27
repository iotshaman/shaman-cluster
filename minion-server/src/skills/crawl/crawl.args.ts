export type CrawlArgs = {
  requestId: string;
  apiBaseUri: string; 
  requestUri: string;
  args: any;
  proxy?: boolean;
  render?: boolean;
}