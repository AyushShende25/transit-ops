import { BaseError } from "./base";

export class ForbiddenError extends BaseError {
  StatusCode = 403;

  constructor(public message = "forbidden access") {
    super(message);
  }

  serialize() {
    return [{ message: this.message }];
  }
}