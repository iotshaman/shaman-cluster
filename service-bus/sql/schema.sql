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