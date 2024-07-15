export type ComputeErrorForm = {
  requestId: string;
  deviceId: string;
  error: string;
  stack?: string;
  args: any;
}