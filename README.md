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

Once these command are complete you should be ready to start any of the given services. 