import { type Dirent, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

export interface WalkFilesOptions {
	/** Directory names not descended into, at any depth. Defaults to `.git` and `node_modules`. */
	skip?: Iterable<string>;
}

const DEFAULT_SKIP = [".git", "node_modules"];

/**
 * Every regular file under `dir`, as absolute paths in a stable (name-sorted,
 * depth-first) order. Directories named in `options.skip` are not entered.
 *
 * Symlinks are neither followed nor listed, so a link back up the tree can't
 * loop. A subdirectory that can't be read is skipped; `dir` itself must be
 * readable — its error propagates, since a typo'd root is a bug to surface,
 * not an empty result.
 */
export function walkFilesSync(dir: string, options: WalkFilesOptions = {}): string[] {
	const skip = new Set(options.skip ?? DEFAULT_SKIP);
	const files: string[] = [];

	function walk(current: string, isRoot: boolean): void {
		let entries: Dirent[];
		try {
			entries = readdirSync(current, { withFileTypes: true });
		} catch (error) {
			if (isRoot) throw error;
			return;
		}
		entries.sort((a, b) => Number(a.name > b.name) - Number(a.name < b.name));
		for (const entry of entries) {
			if (skip.has(entry.name)) continue;
			const full = join(current, entry.name);
			if (entry.isDirectory()) walk(full, false);
			else if (entry.isFile()) files.push(full);
		}
	}

	walk(resolve(dir), true);
	return files;
}
