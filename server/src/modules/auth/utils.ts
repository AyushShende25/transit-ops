import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { config } from "../../config/env";
import type { Role } from "../../constants";

export const hashPassword = async (password: string) => {
	return argon2.hash(password);
};

export const verifyPassword = async (hash: string, password: string) => {
	return argon2.verify(hash, password);
};

export const signAccessToken = ({
	userId,
	role,
}: {
	userId: string;
	role: Role;
}) => {
	return jwt.sign(
		{
			sub: userId,
			role,
		},
		config.JWT_ACCESS_SECRET,
		{
			expiresIn: config.JWT_ACCESS_TOKEN_TTL_SECONDS,
		},
	);
};
