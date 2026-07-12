import { BaseError } from "./base";

export class BadRequestError extends BaseError {
  StatusCode = 400;

  constructor(public message = "Bad Request") {
    super(message);
  }

  serialize() {
    return [{ message: this.message }];
  }
}