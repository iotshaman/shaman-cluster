export class MessageModel {
  messageId: string;
  lockId?: string;
  messageDateTime: Date;
  attempts: number;
  path: string;
  subpath?: string;
  body: string;
  args: string;
  complete: string;
  deadletter: string;
}