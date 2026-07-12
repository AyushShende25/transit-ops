import type { Request, Response } from "express";
import { Router } from "express";
import { cookieOptions } from "../../constants";
import { loginSchema, signupSchema } from "./schema";
import { loginUser, registerUser } from "./service";
import { signAccessToken } from "./utils";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
	const { email, password, name, role } = signupSchema.parse(req.body);

	const { userId, role: userRole } = await registerUser({
		email,
		password,
		name,
		role,
	});

	const accessToken = signAccessToken({
		userId,
		role: userRole,
	});

	res.cookie("access_token", accessToken, cookieOptions);

	res.status(201).json({
		message: "Account created successfully",
	});
});

router.post("/login", async (req: Request, res: Response) => {
	const { email, password } = loginSchema.parse(req.body);

	const { userId, role } = await loginUser({
		email,
		password,
	});

	const accessToken = signAccessToken({
		userId,
		role,
	});

	res.cookie("access_token", accessToken, cookieOptions);

	res.json({
		message: "Login successful",
	});
});

router.post("/logout", (_req: Request, res: Response) => {
	res.clearCookie("access_token");

	res.status(204).end();
});

export default router;
