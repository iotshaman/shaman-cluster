import { URL } from "url";

export function buildUrl(apiBaseUri: string, uri: string) {
  uri = !uri ? "" : (uri.startsWith('/') ? uri.slice(1) : uri);
  let url = new URL(apiBaseUri);
  if (!url.pathname) url = new URL(uri, apiBaseUri);
  else {
    if (url.pathname.endsWith('/')) 
      url = new URL(url.pathname += uri, apiBaseUri);
    else url = new URL(url.pathname += `/${uri}`, apiBaseUri);
  }
  return url.toString();
}