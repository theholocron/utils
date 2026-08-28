import type { HolocronConfig } from "@theholocron/cli";
import { defineConfig } from "@theholocron/cli";
import { node } from "@theholocron/holocron-config";

const { repo, workflows, providers } = node();
export default defineConfig({
	description: "Lightweight TypeScript utility packages for arrays, strings, dates, environment detection, and more.",
	homepage: "https://docs.theholocron.dev/utils/",
	repo: {
		...repo,
		protection: "strict",
		requiredChecks: [
			"audit / Audit the bundle size",
			"audit / Knip",
			"codecov/patch",
			"codecov/project/array",
			"codecov/project/misc",
			"codecov/project/storage",
			"codecov/project/string",
			"codecov/project/uri",
		],
		teams: [{ slug: "gatekeepers", permission: "maintain" }],
		topics: [
			"array",
			"date-time",
			"developer-tools",
			"environment",
			"nodejs",
			"storage",
			"string",
			"typescript",
			"uri",
			"utilities",
		],
	},
	workflows: [
		...workflows,
		"audit",
		{ name: "release", with: { "run-build": true } },
		"sync",
		{ name: "deploy", with: { docs: true, preview: { project: "theholocron-preview", domain: "preview.theholocron.dev" } } },
	],
	providers,
	agent: "claude",
	skills: ["git-safety", "pr-workflow", "commit-standards", "security-review", "turborepo"],
} satisfies HolocronConfig);
