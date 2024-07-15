CREATE TABLE IF NOT EXISTS message (
  messageId VARCHAR(64) NOT NULL PRIMARY KEY,
  lockId VARCHAR(64),
  messageDateTime TEXT NOT NULL,
  attempts INTEGER NOT NULL,
  path VARCHAR(64) NOT NULL,
  subpath VARCHAR(64),
  body TEXT NOT NULL,
  args TEXT NOT NULL,
  complete CHAR(1) NOT NULL,
  deadletter CHAR(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook (
  webhookId VARCHAR(128) NOT NULL PRIMARY KEY,
  deviceId VARCHAR(64) NOT NULL,
  instanceId VARCHAR(24) NOT NULL,
  webhookUrl VARCHAR(256) NOT NULL,
  listeners TEXT NOT NULL,
  registeredDateTime TEXT NOT NULL
);