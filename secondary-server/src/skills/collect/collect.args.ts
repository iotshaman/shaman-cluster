export type CollectArgs = {
  apiBaseUri: string;
  requests: {
    requestUri: string;
    args?: any;
  }[];
  randomDelay?: boolean;
  proxy?: boolean;
}