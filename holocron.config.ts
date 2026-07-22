import { defineConfig } from "@theholocron/cli";
import type { HolocronConfig } from "@theholocron/cli";
import { node } from "@theholocron/holocron-config";

const { repo, workflows, providers } = node();
export default defineConfig({
	description: "Small utilities used within the Galaxy.",
	repo: {
		...repo,
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
	],
	providers,
	agent: "claude",
	skills: [
		"git-safety",
		"pr-workflow",
		"commit-standards",
		"security-review",
		"turborepo",
	],
} satisfies HolocronConfig);
