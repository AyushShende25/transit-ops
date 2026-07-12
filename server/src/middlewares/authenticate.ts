import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import type { Role } from "../constants";
import type { AccessTokenPayload } from "../constants/types";
import { UnAuthorizedError } from "../errors/un-authorized";

declare global {
	namespace Express {
		interface User {
			id: string;
			role: Role;
		}

		interface Request {
			user?: User;
		}
	}
}

export const authenticate = (req: Request, _: Response, next: NextFunction) => {
	const accessToken =
		req.cookies?.access_token || req.headers.authorization?.split(" ")[1];

	if (!accessToken) {
		throw new UnAuthorizedError("Authentication required");
	}

	try {
		const payload = jwt.verify(
			accessToken,
			config.JWT_ACCESS_SECRET,
		) as AccessTokenPayload;

		req.user = {
			id: payload.sub,
			role: payload.role,
		};

		next();
	} catch {
		throw new UnAuthorizedError("Invalid or expired access token");
	}
};
