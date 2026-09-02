import type { HolocronConfig } from "@theholocron/cli";
import { defineConfig } from "@theholocron/cli";
import { compose, nodeDocs, wikiCapability as wiki } from "@theholocron/holocron-config";

const { repo, workflows, providers, org, domain, docs } = compose(nodeDocs(), wiki());
export default defineConfig({
	description: "Lightweight TypeScript utility packages for arrays, strings, dates, environment detection, and more.",
	homepage: "https://docs.theholocron.dev/utils/",
	org,
	domain,
	docs,
	repo: {
		...repo,
		requiredChecks: [
			...repo.requiredChecks,
			"audit / Audit the bundle size",
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
	workflows: [...workflows, "audit", { name: "release", with: { "run-build": true } }, "sync"],
	providers: { ...providers, secrets: "github" },
	agent: "claude",
	skills: ["git-safety", "pr-workflow", "commit-standards", "security-review", "turborepo"],
} satisfies HolocronConfig);
