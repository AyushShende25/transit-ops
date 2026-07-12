import type { Role } from "./index";

export type AccessTokenPayload = {
	sub: string;
	role: Role;
};
