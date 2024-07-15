import { ServiceBusMessage } from "../../models/service-bus-message";

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

  public static Scaffold(message: ServiceBusMessage): MessageModel {
    let model = new MessageModel();
    model.path = message.path;
    model.body = JSON.stringify(message.body);
    model.args = JSON.stringify(message.args || {});
    return model;
  }
}