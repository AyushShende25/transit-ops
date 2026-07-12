import type { NextFunction, Request, Response } from "express";
import type { Role } from "../constants";
import { ForbiddenError } from "../errors/forbidden";
import { UnAuthorizedError } from "../errors/un-authorized";

export const authorize =
	async (roles: Role[]) =>
	(req: Request, _res: Response, next: NextFunction) => {
		if (!req.user) throw new UnAuthorizedError();

		if (!roles.includes(req.user.role)) {
			throw new ForbiddenError();
		}

		next();
	};
