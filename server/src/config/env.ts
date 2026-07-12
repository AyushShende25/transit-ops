import * as z from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]),
	PORT: z.coerce.number().default(5000),
	LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),
	DATABASE_URL: z.url(),
	CLIENT_URL: z.url(),
});

const parsedSchema = envSchema.safeParse(process.env);

if (!parsedSchema.success) {
	console.error("Invalid environment variables");
	console.error(z.prettifyError(parsedSchema.error));
	process.exit(1);
}

export const config = parsedSchema.data;
