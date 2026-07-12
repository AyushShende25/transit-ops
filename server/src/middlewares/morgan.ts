import morgan, { type StreamOptions } from "morgan";
import { config } from "../config/env";
import { logger } from "../libs/logger";

const stream: StreamOptions = {
	write: (message) => logger.http(message.trim()),
};

export default morgan(":method :url :status :response-time ms", {
	stream,
	skip: () => config.NODE_ENV !== "development",
});
