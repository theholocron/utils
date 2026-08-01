import { defineConfig } from "@theholocron/astro-config";
import utilsConfig from "@theholocron/utils-docs";

export default defineConfig({
	docs: utilsConfig,
	importMetaUrl: import.meta.url,
});
