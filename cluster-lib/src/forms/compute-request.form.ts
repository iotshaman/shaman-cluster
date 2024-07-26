export type ComputeRequestForm = {
  skill: string;
  requestId: string;
  body: any;
  chunks: any[];
  webhook?: string;
}