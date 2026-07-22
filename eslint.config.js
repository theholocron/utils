import { typescript } from "@theholocron/eslint-config";

/**
 * @see https://eslint.org/docs/latest/use/configure/
 * @type {import("eslint").Linter.Config}
 */
const config = [{ ignores: ["**/dist/**"] }, ...typescript()];

export default config;
