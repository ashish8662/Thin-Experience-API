export class Clock {
  now(): number {
    return Date.now();
  }
}

export const defaultClock = new Clock();
