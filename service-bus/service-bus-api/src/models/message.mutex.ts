import { inject, injectable } from "inversify";
import { v4 } from "uuid";
import { TYPES } from "../composition/app.composition.types";
import { AppConfig } from "./app.config";

@injectable()
export class MessageMutex {

  private lockTokens: string[] = [];

  constructor(@inject(TYPES.AppConfig) private config: AppConfig) {}

  acquireLock(): string {
    if (this.lockTokens.length >= this.config.maxConcurrentMessages) return null;
    let token = v4();
    this.lockTokens.push(token);
    return token;
  }

  lockExists(lockToken: string): boolean {
    return this.lockTokens.includes(lockToken);
  }

  releaseLock(lockToken: string) {
    this.lockTokens = this.lockTokens.filter(t => t != lockToken);
  }

}