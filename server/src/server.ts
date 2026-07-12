import { createApp } from "./app";
import { config } from "./config/env";
import { logger } from "./libs/logger";

const bootstrap = async () => {
	const app = createApp();

	const server = app.listen(config.PORT, () => {
		logger.info(`Server running on port ${config.PORT} (${config.NODE_ENV})`);
	});

	function shutdown(code: number) {
		logger.info("Shutting down server...");

		server.close(() => {
			logger.info("HTTP server closed.");
			process.exit(code);
		});

		// Force-exit if it hangs
		setTimeout(() => {
			logger.error("Force shutdown");
			process.exit(code);
		}, 5000).unref();
	}

	process.on("uncaughtException", (err) => {
		logger.error("Uncaught Exception:", err);
		shutdown(1);
	});
	process.on("unhandledRejection", (reason) => {
		logger.error("Unhandled Promise Rejection:", reason);
		shutdown(1);
	});
	process.on("SIGINT", () => shutdown(0));
	process.on("SIGTERM", () => shutdown(0));
};

bootstrap().catch((err) => {
	console.error("Failed to bootstrap server", err);
	process.exit(1);
});
