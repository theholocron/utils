import { defineConfig } from "@theholocron/semantic-release-config";

export default defineConfig({
	exec: {
		prepareCmd: "pnpm exec holocron bump-versions ${nextRelease.version}",
		// Raw bulk `pnpm -r publish` aborts the entire release the moment ANY
		// package 404s/ENEEDAUTHs (a brand-new package needing its first manual
		// `publish --initial`, a transient npm auth hiccup, ...) -- confirmed
		// live: the 1.9.0 release died on the very first package name
		// (alphabetically) and published *nothing*, even though semantic-release's
		// prepare phase had already committed and pushed the version bump.
		// `holocron publish --skip-already-published` checks `npm view
		// <pkg>@<version>` per package first, so a re-run (or the next real
		// release) only publishes what's actually missing -- same fix
		// theholocron/holocron's own release.config.ts already carries.
		publishCmd: "pnpm exec holocron publish --skip-already-published --tag ${nextRelease.channel || 'latest'}",
	},
});
