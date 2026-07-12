import { BaseError } from "./base";

export class UnAuthorizedError extends BaseError {
	StatusCode = 401;

	constructor(public message = "Unauthorized") {
		super(message);
	}

	serialize() {
		return [{ message: this.message }];
	}
}
