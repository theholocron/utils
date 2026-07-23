import type { KnipConfig } from "knip";

const config: KnipConfig = {
	workspaces: {
		".": {
			// prettier.config.ts, eslint.config.ts, release.config.ts, commitlint.config.ts auto-detected by Knip plugins
			entry: ["holocron.config.ts"],
			project: ["*.ts"],
		},
		"packages/*": {
			// entry points auto-detected from package.json exports
			// vitest.config.ts re-exports a shared bundle so Knip can't trace
			// the include patterns — declare test entry points explicitly
			entry: ["src/__tests__/**/*.test.ts"],
			project: ["src/**/*.ts"],
		},
	},
	ignoreDependencies: [
		// Loaded at runtime by the holocron plugin system — not a static import
		"@theholocron/holocron-plugin-github",
		// Used by the skills runtime, not a module import
		"@theholocron/skills",
		// tsconfig.json "extends" — not a module import
		"@theholocron/tsconfig",
		// commitlint "extends" uses string shorthand — Knip sees the bare scoped
		// org "@theholocron" rather than "@theholocron/commitlint-config"
		"@theholocron/commitlint-config",
		"@theholocron",
		// pinned as a pnpm override; not directly imported by root code
		"@commitlint/config-conventional",
		// passed as --config arg to lint-staged binary in .husky/pre-commit
		"@theholocron/lint-staged-config",
		// prettier config package — no .prettierrc or prettier.config.ts at root
		"@theholocron/prettier-config",
		// binary tools — invoked via CLI or hooks, not module imports
		"alexjs",
		"husky",
	],
	ignoreExportsUsedInFile: true,
};

export default config;
