import { defineConfig } from "@theholocron/semantic-release-config";

export default defineConfig({
	branches: ["main", { name: "alpha", prerelease: true }],
	exec: {
		prepareCmd:
			"node -e \"const fs=require('fs'),v='${nextRelease.version}'; ['packages/array-utils','packages/date-time-utils','packages/env-utils','packages/location-utils','packages/misc-utils','packages/storage-utils','packages/string-utils','packages/uri-utils'].forEach(p=>{const f=p+'/package.json',j=JSON.parse(fs.readFileSync(f));j.version=v;fs.writeFileSync(f,JSON.stringify(j,null,2)+'\\n');});\"",
		publishCmd:
			"pnpm -r --filter='./packages/*' publish --access public --no-git-checks --tag ${nextRelease.channel || 'latest'}",
	},
});
