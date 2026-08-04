import theholocron from "@theholocron/prettier-config";
import type { Config } from "prettier";

const config = {
	...theholocron,
	overrides: [
		...(theholocron.overrides ?? []),
		{
			files: ["*.md"],
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
	],
} satisfies Config;

export default config;
