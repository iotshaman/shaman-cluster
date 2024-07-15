export class CommandRequestDataModel {
  commandRequestMessageId?: number;
  requestId: string;
  deviceId: string;
  stdout: string;
  stderr: string;
  messageDateTime: Date;
}