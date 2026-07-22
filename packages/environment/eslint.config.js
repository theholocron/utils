import baseConfig from "@magnite/eslint-config";

/**
 * @see https://eslint.org/docs/latest/use/configure/
 * @type {import("eslint").Linter.Config}
 */
export default [
	...baseConfig,
	{
		name: "Environment",
		files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
	},
];
