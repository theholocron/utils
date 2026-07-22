import { typescript } from "@theholocron/eslint-config";

/**
 * @see https://eslint.org/docs/latest/use/configure/
 * @type {import("eslint").Linter.Config}
 */
const config = [...typescript()];

export default config;
