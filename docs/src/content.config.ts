import { createDocsCollections } from "@theholocron/docs-theme/content";
import utilsConfig from "@theholocron/utils-docs";

export const collections = createDocsCollections(utilsConfig, import.meta.url);
