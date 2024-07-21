export type ComputeFileForm = {
  requestId: string;
  deviceId: string;
  args: any;
  fileName: string;
  extension?: string;
  contents: string;
}