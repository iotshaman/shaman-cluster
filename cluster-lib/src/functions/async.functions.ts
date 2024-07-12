import { randomInteger } from "./math.functions";

export function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function randomDelay(): Promise<void> {
  return delay(randomInteger(1000, 3000));
}