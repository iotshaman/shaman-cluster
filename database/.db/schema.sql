-- TABLES
CREATE TABLE IF NOT EXISTS registration (
  nodeId INTEGER NOT NULL PRIMARY KEY,
  deviceId VARCHAR(64) NOT NULL,
  nodeName VARCHAR(32) NOT NULL,
  ipAddress VARCHAR(16) NOT NULL,
  port VARCHAR(5) NOT NULL,
  speed INTEGER NOT NULL,
  platform VARCHAR(8) NOT NULL,
  processors INTEGER NOT NULL,
  createdDateTime TEXT NOT NULL,
  lastRegistrationDateTime TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS compute_request (
  computeRequestId INTEGER NOT NULL PRIMARY KEY,
  requestId VARCHAR(64) NOT NULL,
  requestDate TEXT NOT NULL,
  skill VARCHAR(32) NOT NULL,
  strategy VARCHAR(16) NOT NULL,
  body TEXT NOT NULL
)