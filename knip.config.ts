import type { KnipConfig } from "knip";

const config: KnipConfig = {
	workspaces: {
		".": {
			entry: ["holocron.config.ts"],
			project: ["*.ts", "*.cjs"],
			// standalone tool configs — not imported by project code
			ignoreFiles: ["devmoji.config.cjs"],
			// astro.config.ts is the docs build config, not an Astro workspace — disable plugin
			astro: false,
		},
		"packages/*": {
			// src/index.ts is the published entry — marks all exports as intentionally public
			entry: ["src/index.ts", "src/**/*.test.ts"],
			project: ["src/**/*.ts", "*.config.ts"],
		},
		docs: {
			entry: ["src/content.config.ts"],
			// limit project to TS only — .astro/.mdx are compiled extensions Knip can't follow
			project: ["src/**/*.ts"],
		},
	},
	ignoreDependencies: [
		// commitlint "extends" uses string shorthand
		"@theholocron",
		"@theholocron/commitlint-config",
		// used only as a pnpm override reference, not a direct import
		"@commitlint/config-conventional",
		// passed as --config arg to lint-staged binary in .husky/pre-commit
		"@theholocron/lint-staged-config",
		// loaded at runtime by the holocron plugin system — not a static import
		"@theholocron/holocron-plugin-github",
		// installed at root so packages can resolve via catalog; not imported by root code
		"@theholocron/tsdown-config",
		"@theholocron/vitest-config",
		// binary tools — invoked via CLI or hooks, not module imports
		"alexjs",
		"husky",
		"sort-package-json",
	],
	ignoreExportsUsedInFile: true,
};

export default config;
