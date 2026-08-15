import { createDocsLoader } from "@theholocron/docs-theme/loader";
import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection } from "astro:content";
import { fileURLToPath } from "node:url";
import utilsConfig from "@theholocron/utils-docs";

export const collections = {
	docs: defineCollection({
		loader: createDocsLoader([
			{
				dir: fileURLToPath(new URL("../../packages/utils-docs/content", import.meta.url)),
				slug: utilsConfig.slug,
			},
		]),
		schema: docsSchema(),
	}),
};
