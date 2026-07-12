import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/server.ts"],
	outExtensions() {
		return {
			js: ".js",
		};
	},
});
