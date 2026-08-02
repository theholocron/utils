import starlight from "@astrojs/starlight";
import { defineConfig } from "@theholocron/astro-config";
import { docsTheme } from "@theholocron/docs-theme";
import utilsConfig from "@theholocron/utils-docs";

export default defineConfig({
	docs: utilsConfig,
	importMetaUrl: import.meta.url,
	starlight,
	docsTheme,
});
