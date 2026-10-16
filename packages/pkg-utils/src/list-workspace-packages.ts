import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { parsePackageJson } from "./parse-package-json.ts";
import type { WorkspacePackageEntry } from "./workspace-package.type.ts";

export interface ListWorkspacePackagesOptions {
	/** Directories under the repo root whose children are packages. Defaults to `packages` and `plugins`. */
	roots?: readonly string[];
	/** Replaces the `package.json` read — for callers with an injected or in-memory filesystem. */
	readFile?: (path: string) => string;
	/** Replaces the directory listing: the names of the subdirectories of `dir`. Throws when `dir` is absent. */
	listDirs?: (dir: string) => string[];
}

const DEFAULT_ROOTS = ["packages", "plugins"];

function defaultListDirs(dir: string): string[] {
	return readdirSync(dir).filter((name) => {
		try {
			return statSync(join(dir, name)).isDirectory();
		} catch {
			return false;
		}
	});
}

/**
 * Every package directly under the workspace `roots` of `repoRoot` that has a
 * readable `package.json` holding a JSON object — roots in the order given,
 * packages within a root sorted by directory name. A missing root, and a
 * directory without a usable manifest, contribute nothing.
 *
 * Nothing is filtered by `name`, `version` or `private`: that is the caller's
 * call (publishing wants public packages, version bumping wants all of them).
 * A single-package repo has no roots; read its root manifest with
 * `readPackageJson` instead.
 */
export function listWorkspacePackagesSync(
	repoRoot: string,
	options: ListWorkspacePackagesOptions = {}
): WorkspacePackageEntry[] {
	const { roots = DEFAULT_ROOTS, listDirs = defaultListDirs } = options;
	const readFile = options.readFile ?? ((path: string) => readFileSync(path, "utf8"));
	const entries: WorkspacePackageEntry[] = [];

	for (const root of roots) {
		let folders: string[];
		try {
			folders = [...listDirs(join(repoRoot, root))].sort();
		} catch {
			continue;
		}
		for (const folder of folders) {
			const dir = join(repoRoot, root, folder);
			let manifest;
			try {
				manifest = parsePackageJson(readFile(join(dir, "package.json")));
			} catch {
				continue;
			}
			if (manifest) entries.push({ name: manifest.name, dir, relativeDir: `${root}/${folder}`, manifest });
		}
	}
	return entries;
}
