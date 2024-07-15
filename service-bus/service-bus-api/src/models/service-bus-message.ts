export type ServiceBusMessage = {
  path: string;
  body: any;
  args: any;
  ref?: string;
}