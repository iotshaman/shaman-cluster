export class CommandRequestModel {
  commandRequestId?: number;
  requestId: string;
  requestDate: Date;
  deviceId: string;
  body: string;
  complete: string;
  status: string;
}