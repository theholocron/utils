import { library } from "@theholocron/eslint-config/bundles/library";
import type { Linter } from "eslint";

const config = [
	...library(),
	{
		// These packages use browser APIs (navigator, sessionStorage, KeyboardEvent).
		// The Node.js built-ins rule doesn't apply to browser-targeted code.
		files: ["packages/location-utils/src/**", "packages/misc-utils/src/**", "packages/storage-utils/src/**"],
		rules: {
			"n/no-unsupported-features/node-builtins": "off",
		},
	},
	{
		ignores: ["docs/**", "packages/*/dist/**", "packages/*/coverage/**", "**/node_modules/**"],
	},
] satisfies Linter.Config[];

export default config;
