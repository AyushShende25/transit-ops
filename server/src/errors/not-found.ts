import { BaseError } from "./base";

export class NotFoundError extends BaseError {
	StatusCode = 404;

	constructor(public message = "Resource not found") {
		super(message);
	}

	serialize() {
		return [{ message: this.message }];
	}
}
