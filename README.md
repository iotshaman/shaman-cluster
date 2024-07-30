# Shaman Cluster
This application is built to support large-scale data collection operations. The solution is broken into 2 distinct roles: root and minion; configure multiple minions concurrently on one machine, or multiple machines (or both!), and they will perform data collection and computation on your behalf, then report back to the root server.

## Requirements
The only requirement to run this application is Node JS >= 18.x.x.

## Installation
This document is only for running in development mode; for information related to installing in production mode, please refer to our releases page. 

To install (full development mode) simply clone the repo, open a terminal in the solution's root folder, and run the following commands:
```sh
npm install
npm run restore
npm run build
```

Once these command are complete, please refer to the "Quick Start" section (below) to finish configuring your application.

## Quick Start
Once you have finished cloning the repo and installing the dependencies, you will need to setup the configuraiton for 3 services

* Service Bus API
* Root Server API
* Minion Server API

This can be accomplished by running 1 command, then responding to a few questions. To start, open the solution's root folder in a command line terminal and enter the following command:
```sh
npm run setup:debug
```

It will prompt you to answer the following:
1. **What network interface would you like to use (root server)**: A list of given network interfaces should come after the prompt; find the one you wish to use and type the name.
2. **Where you would like to store app data (root server)?**: Enter an absolute path to the directory where you wish to store data for the root server. 
3. **Enter the URL to your Service Bus API (default: http://localhost:9399/api)**: Either enter a full URL to your service bus API, or leave blank to use the default (recommended). 
4. **What network interface would you like to use (minion)**: A list of given network interfaces should come after the prompt; find the one you wish to use and type the name.
5. **Where you would like to store app data (root server)?**: Enter an absolute path to the directory where you wish to store data for the minion server(s). 
6. **Enter the URL to your Service Bus API (default: http://localhost:9399/api)**: Either enter a full URL to your Service Bus API, or leave blank to use the default (recommended). 
7. **Enter the URL to your Root Server API (default: http://localhost:9301/api)**: Either enter a full URL to your Root Server API, or leave blank to use the default (recommended). 

After entering all requested data, you should be ready to start. Please see the below sections to learn how to start the Root Server, as well as the Minion Server.

### Starting the Root Server
To start the Root Server (including the Service Bus API) simply open a command line terminal in the solution's root directory and enter the following command:
```sh
npm run serve:root
```

This command will first start the Service Bus API, then (if successful) it will start the Root Server.

If you have made changes to the source code, and have not independently ran `npm run build` (at the solution level) you can instead run the following command, which will build the source before starting:
```sh
npm run debug:root
```

### Starting the Minion Server
To start the Minion Server simply open a command line terminal in the solution's root directory and enter the following command:
```sh
npm run serve:minion
```

If you have made changes to the source code, and have not independently ran `npm run build` (at the solution level) you can instead run the following command, which will build the source before starting:
```sh
npm run debug:minion
```

## API Reference
Once you have your root server (plus service bus) and at least 1 minion running, your system is ready to start doing work. The system is currently capable of performing the following operations:
1. Collect data from an API.
2. Scrape data from a webpage.
3. Crawl a webpage to get all links.
4. Run command (exe / bash / etc.) on all minion devices.
5. Run command (exe / bash / etc.) on specific minion device.

To begin making requests, please refer to the below specs. 

*NOTE*: All API requests should be made to the root server. 

### Collect Data from API
To perform API requests in bulk you can use the "compute" API endpoint (skill = "collect"). Here is an example request, using the fetch library:
```ts
let request = fetch("http://localhost:9301/api/compute", {
  method: "POST",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    skill: "collect",
    body: {
      apiBaseUri: "https://www.example.com/api",
      proxy: false // optional
    },
    webhook: "http://localhost:3000/api/compute/response", // optional
    chunks: [
      {
        requestUri: "endpoint1",
        args: {refId: 0}
      },
      {
        requestUri: "endpoint2",
        args: {refId: 1}
      }
    ]
  })
});
```

**Request Body**
|Property|Description|
|---|---|
|skill|The specific skill required. The value "collect" instructs the minion server(s) to use the body / chunk parts of the request to make RESTful API requests.|
|body|The high-level information for your request. Provide an "apiBaseUri" representing the entry point to your target API. You can optionally provide a boolean value for "proxy"; when set to `true` the application will attempt to make the request through a configured proxy (see [Proxy Configuration](#proxy-configuration)).|
|chunks|Each chunk represents a different API request. So, if you wish to make 2 API requests to the configured "apiBaseUri", you would provide 2 "chunks" and for each you would provide the relative path to the API endpoint. For each chunk you should also provide an "args" object; this object is not used internally, but is stored with your request chunks so you can link them back to your source dataset (in the above example we have a "refId" value that would hypothetically refer to identities in the source dataset). |
|webhook|(optional) If you wish to be notified when all chunks have completed you can provide a URL here and the root server will send a notification to the provided URL (see [Receiving Status Notifications](#receiving-status-notifications)).|

### Scrape Website HTML
To scrape webpages in bulk you can use the "compute" API endpoint (skill = "scrape"). Please note this scrape skill is only to collect HTML, not parse it; you will need to handle the resulting dataset and provide your own HTML parsing logic. 

Here is an example request, using the fetch library:
```ts
let request = fetch("http://localhost:9301/api/compute", {
  method: "POST",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    skill: "scrape",
    body: {
      apiBaseUri: "https://www.iotshaman.com",
      proxy: false, // optional
      render: false // optional
    },
    webhook: "http://localhost:3000/api/compute/response", // optional
    chunks: [
      {
        requestUri: "/",
        args: {refId: 0}
      }
    ]
  })
});
```

**Request Body**
|Property|Description|
|---|---|
|skill|The specific skill required. The value "scrape" instructs the minion server(s) to use the body / chunk parts of the request to download all requested HTML files.|
|body|The high-level information for your request. Provide an "apiBaseUri" representing the root URL of your target website. You can optionally provide a boolean value for "proxy"; when set to `true` the application will attempt to make the request through a configured proxy (see [Proxy Configuration](#proxy-configuration)). You can optionally provide a boolean value for "render"; when set to `true` the application will attempt to fully render the webpage, including javascript, before scraping the HTML (see [Browser Configuration](#browser-configuration)).|
|chunks|Each chunk represents a different webpage. So, if you wish to scrape 2 different webpage relative to the configured "apiBaseUri", you would provide 2 "chunks" and for each you would provide the relative path to the webpage. For each chunk you should also provide an "args" object; this object is not used internally, but is stored with your request chunks so you can link them back to your source dataset (in the above example we have a "refId" value that would hypothetically refer to identities in the source dataset). |
|webhook|(optional) If you wish to be notified when all chunks have completed you can provide a URL here and the root server will send a notification to the provided URL (see [Receiving Status Notifications](#receiving-status-notifications)).|

### Crawl Webpage
To crawl webpages in bulk you can use the "compute" API endpoint (skill = "crawl"). Here is an example request, using the fetch library:
```ts
let request = fetch("http://localhost:9301/api/compute", {
  method: "POST",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    skill: "crawl",
    body: {
      apiBaseUri: "https://www.iotshaman.com",
      proxy: false, // optional
      render: false // optional
    },
    webhook: "http://localhost:3000/api/compute/response", // optional
    chunks: [
      {
        requestUri: "/",
        args: {refId: 0}
      }
    ]
  })
});
```

**Request Body**
|Property|Description|
|---|---|
|skill|The specific skill required. The value "crawl" instructs the minion server(s) to use the body / chunk parts of the request to crawl all provided webpages.|
|body|The high-level information for your request. Provide an "apiBaseUri" representing the root URL of your target website. You can optionally provide a boolean value for "proxy"; when set to `true` the application will attempt to make the request through a configured proxy (see [Proxy Configuration](#proxy-configuration)). You can optionally provide a boolean value for "render"; when set to `true` the application will attempt to fully render the webpage, including javascript, before scraping the HTML (see [Browser Configuration](#browser-configuration)).|
|chunks|Each chunk represents a different webpage. So, if you wish to scrape 2 different webpage relative to the configured "apiBaseUri", you would provide 2 "chunks" and for each you would provide the relative path to the webpage. For each chunk you should also provide an "args" object; this object is not used internally, but is stored with your request chunks so you can link them back to your source dataset (in the above example we have a "refId" value that would hypothetically refer to identities in the source dataset). |
|webhook|(optional) If you wish to be notified when all chunks have completed you can provide a URL here and the root server will send a notification to the provided URL (see [Receiving Status Notifications](#receiving-status-notifications)).|

### Perform Command
To run a command on all (or a specific) minion nodes you can use the "command" API endpoint. Here is an example request, using the fetch library:
```ts
let request = fetch("http://localhost:9301/api/command", {
  method: "POST",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: "echo",
    args: ["Test echo command..."],
    targetId: "32da1c76-6b77-4e2e-9e4f-78dc76e7c7d1" // optional
  })
});
```

**Request Body**
|Property|Description|
|---|---|
|command|The executable or bash command to run.|
|args|The command's argument array.|
|targetId|(optional) The minion node's device id (from minion app config). If left blank / null, all minion nodes will receive the command.|

### Querying Compute Data
Each of the above "skills" will result in some form of presistent data (HTML files, API responses, etc). Use the below API endpoints to check on the progress of requests and access the corresponding data.

|Uri|Description|
|---|---|
|api/compute/{requestId}/status|Uses the provided `requestId` to return a status object.|
|api/compute/{requestId}/data|Uses the provided `requestId` to return all corresponding chunk data.|
|api/compute/{requestId}/files|Not yet implemented|
|api/compute/{requestId}/messages|Not yet implemented|

## Proxy Configuration
When performing mass data collection you will sometimes run into access limitations; for example, a website may limit the amount of webpages a given IP address can access during a 10 minute time interval (this is just one example, many other access-limiting techniques exist). In order to work around this Shaman Cluster minions have built-in access to public reverse proxy services, simply set the "proxy" value to true on compute requests and the app will try to find an available proxy to do the work on your behalf.

One important thing to note, however, is public proxy services are notoriously slow and experience an uncomfortably high rate of failure. Because of this inherent limitation, we have added a way for you to configure a [Tor proxy](https://en.wikipedia.org/wiki/Tor_(network)) for improved performance and experience. When properly configured your Tor proxy can change its "circuit" on a regular interval, thereby changing your outgoing IP address, making it harder for websites to know who you are.

Before continuing, you will first need to install Tor on your minion machine(s). For more information, please see our [Guide to Setting Up Tor on a Raspberry Pi](https://github.com/iotshaman/shaman-cluster/blob/main/documents/pi-stack.md#setup-tor-raspberry-pi) (please note that installation will be different for other operating systems).

To configure your minion(s) to use a Tor proxy, first open a command line terminal and navigate to the "minion-server" project directory, then enter the following command:
```sh
npm run setup:tor
```

Next, it will prompt you to enter the URL for your Tor proxy URL; provide a value, then click `Enter`. Once complete, simply restart any minion processes that are currently running and any requests with `proxy: true` will now route through your Tor proxy. 

## Browser Configuration
Many websites pre-render their HTML pages before serving them, allowing us to simply make a GET HTTP request to the webpage URL and retrieve all pertinent data. However, some webpages dynamically render their HTML pages per-request, meaning a simple GET request will only yield partial information; when this occurs you need to "render" the content in order scrape it. 

To make it as simple as possible certain compute requests accept a `render: boolean` property in the `body` section to allow users to specify that a webpage needs to be rendered before scraping. Before doing so, however, you must first have a Chromium-based browser installed (Chrome / Edge / Chromium should all work), and you must tell the minion server(s) where to find the executable. 

Once you have a browser installed on your minion machine(s), open a command line terminal and navigate to the "minion-server" project directory, then enter the following command:
```sh
npm run setup:browser
```

Next, it will prompt you to enter the path to your browser's executable (please check back later for additional documentation on finding the executable path); provide a value, then click `Enter`. Once complete, simply restart any minion processes that are currently running and any requests with `render: true` will now render your webpage before returning the scrape results.

## Receiving Status Notifications
All "compute" skills accept a `body` parameter of `webhook`, and when provided the root server will send an HTTP POST request to the provided URL when all chunks are complete (including failures). Below is the type definition for the POST's payload:
```ts
export type StatusNotification = {
  requestId: string;
  status: {
    success: number;
    pending: number;
    error: number;
  }
}
```

Please ensure any URL's provided as "webhook" values (in compute requests) accept this data structure. 