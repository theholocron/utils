import type { PackageJson } from "./package-json.type.ts";

export type DependencyField = "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies";

/**
 * Every package name declared in `pkg`'s dependency maps — `dependencies` and
 * `devDependencies` unless `fields` says otherwise. An absent `pkg`, a missing
 * map or a non-object map contributes nothing.
 */
export function dependencyNames(
	pkg: PackageJson | undefined,
	fields: readonly DependencyField[] = ["dependencies", "devDependencies"]
): ReadonlySet<string> {
	const names = new Set<string>();
	for (const field of fields) {
		const map = pkg?.[field];
		if (typeof map === "object" && map !== null) for (const name of Object.keys(map)) names.add(name);
	}
	return names;
}
