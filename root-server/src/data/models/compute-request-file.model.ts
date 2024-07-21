export class ComputeRequestFileModel {
  computeRequestMessageId?: number;
  requestId: string;
  deviceId: string;
  filePath: string;
  fileName: string;
  fileExtension: string;
  args: string;
  messageDateTime: Date;
}