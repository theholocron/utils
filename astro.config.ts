import starlight from "@astrojs/starlight";
import { defineConfig } from "@theholocron/astro-config";
import { docsTheme } from "@theholocron/docs-theme";

export default defineConfig({
	docs: {
		name: "Utils",
		github: "utils",
		sidebar: [
			{ label: "Overview", slug: "" },
			{
				label: "Packages",
				items: [
					{ label: "Array", slug: "array-utils" },
					{ label: "Date & Time", slug: "date-time-utils" },
					{ label: "Environment", slug: "env-utils" },
					{ label: "Location", slug: "location-utils" },
					{ label: "Misc", slug: "misc-utils" },
					{ label: "Storage", slug: "storage-utils" },
					{ label: "String", slug: "string-utils" },
					{ label: "URI", slug: "uri-utils" },
				],
			},
		],
	},
	starlight,
	docsTheme,
	srcDir: "./docs/src",
	outDir: "./docs/dist",
	publicDir: "./docs/public",
});
