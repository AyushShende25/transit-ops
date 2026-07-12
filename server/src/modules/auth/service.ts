import { DrizzleQueryError, eq } from "drizzle-orm";
import { db } from "../../db";
import { usersTable } from "./../../db/schema";
import { ConflictError } from "../../errors/conflict";
import { UnAuthorizedError } from "../../errors/un-authorized";
import type { LoginInput, SignupInput } from "./schema";
import { hashPassword, verifyPassword } from "./utils";

export const registerUser = async (input: SignupInput) => {
	const { email, password } = input;

	const passwordHash = await hashPassword(password);

	try {
		const [user] = await db
			.insert(usersTable)
			.values({
				email,
				passwordHash,
				name: input.name,
				role: input.role,
			})
			.returning();

		if (!user) {
			throw new Error("Failed to create account");
		}

		return {
			userId: user.id,
			role: user.role,
		};
	} catch (error) {
		if (error instanceof DrizzleQueryError) {
			const pgError = error.cause as { code: string } | undefined;
			if (pgError?.code === "23505") {
				throw new ConflictError("Account already exists");
			}
		}
		throw error;
	}
};

export const loginUser = async (input: LoginInput) => {
	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, input.email));

	if (!user) {
		throw new UnAuthorizedError("Invalid credentials");
	}
	if (!user.passwordHash) {
		throw new UnAuthorizedError("Invalid credentials");
	}

	const valid = await verifyPassword(user.passwordHash, input.password);

	if (!valid) {
		throw new UnAuthorizedError("Invalid credentials");
	}

	return {
		userId: user.id,
		role: user.role,
	};
};
