import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import { config } from "./config/env";
import { NotFoundError } from "./errors/not-found";
import { errorHandler } from "./middlewares/error-handler";
import morgan from "./middlewares/morgan";
import authRoutes from "./modules/auth/router";

export const createApp = (): Application => {
	const app = express();

	app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
	app.use(cookieParser());
	app.use(morgan);
	app.use(express.json({ limit: "100kb" }));
	app.get("/health", (_req, res) => {
		res.json({ success: true, message: "OK" });
	});

	app.use("/api/auth", authRoutes);

	app.all("*splat", () => {
		throw new NotFoundError("Resource not found");
	});
	app.use(errorHandler);

	return app;
};
