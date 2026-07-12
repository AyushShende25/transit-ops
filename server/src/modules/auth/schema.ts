import * as z from "zod";
import { ROLES } from "../../constants";

const emailSchema = z.object({
	email: z.email().trim().toLowerCase(),
});

const passwordSchema = z.object({
	password: z.string().trim().min(8).max(72),
});

export const signupSchema = z.object({
	...emailSchema.shape,
	...passwordSchema.shape,
	name: z.string().trim().min(3).max(30).toLowerCase(),
	role: z.enum(ROLES),
});

export const loginSchema = emailSchema.extend({
	password: z.string().trim(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
