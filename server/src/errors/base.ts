export abstract class BaseError extends Error {
  abstract StatusCode: number;

  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
  abstract serialize(): { message: string; path?: string }[];
}