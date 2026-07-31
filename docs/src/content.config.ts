import { fileURLToPath } from "node:url";

import { docsSchema } from "@astrojs/starlight/schema";
import { createDocsLoader } from "@theholocron/docs-theme/loader";
import utilsConfig from "@theholocron/utils-docs";
import { defineCollection } from "astro:content";

const REPO_SLUG = utilsConfig.slug;

function localSlug(configSlug: string): string {
	if (configSlug === REPO_SLUG) return "";
	if (configSlug.startsWith(`${REPO_SLUG}/`))
		return configSlug.slice(REPO_SLUG.length + 1);
	return configSlug;
}

export const collections = {
	docs: defineCollection({
		loader: createDocsLoader([
			{
				dir: fileURLToPath(
					new URL(
						"../../packages/utils-docs/content",
						import.meta.url,
					),
				),
				slug: localSlug(utilsConfig.slug),
			},
		]),
		schema: docsSchema(),
	}),
};
