import { Application } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "./config/env";
import morgan from './middlewares/morgan'
import { NotFoundError } from "./errors/not-found";
import { errorHandler } from "./middlewares/error-handler";

export const createApp = (): Application => {
	const app = express();

	app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
	app.use(cookieParser());
	app.use(morgan);
	app.use(express.json({ limit: "100kb" }));
	app.get("/health", (_req, res) => {
		res.json({ success: true, message: "OK" });
	});

	app.all("*splat", () => {
		throw new NotFoundError("Resource not found");
	});
	app.use(errorHandler);

	return app;
};