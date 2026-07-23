import type { Linter } from "eslint";
import { library } from "@theholocron/eslint-config/bundles/library";

const config = [
	...library(),
	{
		rules: {
			// src/ compiles to dist/ via tsdown; files[] lists dist/ so every
			// relative src/ import is flagged as unpublished. False positive
			// for the TypeScript src→dist build model.
			"n/no-unpublished-import": "off",
		},
	},
	{
		// These packages use browser APIs (navigator, sessionStorage, KeyboardEvent).
		// The Node.js built-ins rule doesn't apply to browser-targeted code.
		files: [
			"packages/location-utils/src/**",
			"packages/misc-utils/src/**",
			"packages/storage-utils/src/**",
		],
		rules: {
			"n/no-unsupported-features/node-builtins": "off",
		},
	},
	{
		ignores: [
			"packages/*/dist/**",
			"packages/*/coverage/**",
			"**/node_modules/**",
		],
	},
] satisfies Linter.Config[];

export default config;
