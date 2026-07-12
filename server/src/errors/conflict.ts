import { BaseError } from "./base";

export class ConflictError extends BaseError {
	StatusCode = 409;

	constructor(public message = "Entity already exists") {
		super(message);
	}

	serialize() {
		return [{ message: this.message }];
	}
}
