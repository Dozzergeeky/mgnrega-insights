import type { PlaywrightTestConfig } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);

const config: PlaywrightTestConfig = {
	testDir: "./tests",
	timeout: 30_000,
	expect: {
		timeout: 5_000,
	},
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? "github" : [["list"]],
	use: {
		baseURL: `http://127.0.0.1:${PORT}`,
		trace: "retain-on-failure",
		headless: true,
	},
	webServer: {
		command: `npm run dev -- --port ${PORT}`,
		url: `http://127.0.0.1:${PORT}`,
		timeout: 120_000,
		reuseExistingServer: !process.env.CI,
		stderr: "pipe",
		stdout: "pipe",
	},
};

export default config;
