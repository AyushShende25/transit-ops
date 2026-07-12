import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express";
import { ZodError } from "zod";
import { config } from "../config/env";
import { BaseError } from "../errors/base";
import { logger } from "../libs/logger";

export const errorHandler: ErrorRequestHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (err instanceof ZodError) {
		return res.status(422).json(
			err.issues.map((issue) => ({
				message: issue.message,
				...(issue.path.length > 0 && { path: issue.path.join(".") }),
			})),
		);
	}
	if (err instanceof BaseError) {
		return res.status(err.StatusCode).json(err.serialize());
	}

	config.NODE_ENV === "development" && logger.error(`Error:${err}`);
	res.status(500).json([
		{
			message: "Something went wrong",
		},
	]);
};
