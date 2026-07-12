import morgan, { type StreamOptions } from "morgan";
import { logger } from "../libs/logger";
import { config } from "../config/env";

const stream: StreamOptions = {
	write: (message) => logger.http(message.trim()),
};

export default morgan(
	":method :url :status :response-time ms",
	{
		stream,
		skip: () => config.NODE_ENV !== "development",
	},
);