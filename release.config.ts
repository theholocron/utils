import { defineConfig } from "@theholocron/semantic-release-config";

export default defineConfig({
	exec: {
		prepareCmd: "pnpm exec holocron bump-versions ${nextRelease.version}",
		publishCmd:
			"pnpm -r --filter='./packages/*' publish --access public --no-git-checks --provenance --tag ${nextRelease.channel || 'latest'}",
	},
});
