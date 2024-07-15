-- TABLES
CREATE TABLE IF NOT EXISTS registration (
  nodeId INTEGER NOT NULL PRIMARY KEY,
  deviceId VARCHAR(64) NOT NULL,
  instanceId VARCHAR(64) NOT NULL,
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
  chunkId VARCHAR(64) NOT NULL,
  body TEXT NOT NULL,
  complete CHAR(1) NOT NULL,
  status VARCHAR(12) NOT NULL
);

CREATE TABLE IF NOT EXISTS compute_request_message (
  computeRequestMessageId INTEGER NOT NULL PRIMARY KEY,
  requestId VARCHAR(64) NOT NULL,
  deviceId VARCHAR(64) NOT NULL,
  messageType VARCHAR(6) NOT NULL,
  messageText TEXT NOT NULL,
  messageDateTime TEXT NOT NULL,
  trace TEXT NULL,
  args TEXT NULL
);

CREATE TABLE IF NOT EXISTS compute_request_data (
  computeRequestMessageId INTEGER NOT NULL PRIMARY KEY,
  requestId VARCHAR(64) NOT NULL,
  deviceId VARCHAR(64) NOT NULL,
  args TEXT NOT NULL,
  data TEXT NOT NULL,
  messageDateTime TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS command_request (
  commandRequestId INTEGER NOT NULL PRIMARY KEY,
  requestId VARCHAR(64) NOT NULL,
  requestDate TEXT NOT NULL,
  deviceId VARCHAR(64) NOT NULL,
  body TEXT NOT NULL,
  complete CHAR(1) NOT NULL,
  status VARCHAR(12) NOT NULL
);

CREATE TABLE IF NOT EXISTS command_request_data (
  commandRequestMessageId INTEGER NOT NULL PRIMARY KEY,
  requestId VARCHAR(64) NOT NULL,
  deviceId VARCHAR(64) NOT NULL,
  stdout TEXT NULL,
  stderr TEXT NULL,
  messageDateTime TEXT NOT NULL
);