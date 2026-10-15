import type { PackageJson } from "./package-json.type.ts";

/**
 * Parses `package.json` text. Returns `undefined` for anything that isn't a
 * JSON object — invalid JSON, or valid JSON of another type (an array, `null`,
 * a string) — rather than throwing. A leading byte-order mark is ignored, as
 * npm does.
 */
export function parsePackageJson(text: string): PackageJson | undefined {
	try {
		const value: unknown = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
		return typeof value === "object" && value !== null && !Array.isArray(value)
			? (value as PackageJson)
			: undefined;
	} catch {
		return undefined;
	}
}
