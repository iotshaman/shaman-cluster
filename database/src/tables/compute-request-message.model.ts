export class ComputeRequestMessageModel {
  computeRequestMessageId?: number;
  requestId: string;
  deviceId: string;
  messageType: string;
  messageText: string;
  messageDateTime: Date;
  trace?: string;
  args?: string;
}