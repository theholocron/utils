import { existsSync, realpathSync } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, join } from "node:path";

import { findUpward } from "./find-upward.ts";

export interface FindRootOptions {
	/**
	 * `"start"` returns the start directory (resolved, when `realpath` is on)
	 * instead of `undefined` when no marker is found anywhere up the tree —
	 * a soft-skip for callers that treat the start dir as the root anyway.
	 */
	fallback?: "start";
	/**
	 * Resolve symlinks and relative segments of `startDir` before walking. A
	 * relative start dir otherwise reaches `dirname`'s fixed point (`"."`)
	 * after a couple of steps, far short of the real root, and a symlinked
	 * one walks the link's own lexical ancestors instead of the physical
	 * tree. A start path that doesn't exist on disk counts as "not found".
	 */
	realpath?: boolean;
}

const asList = (marker: string | readonly string[]): readonly string[] =>
	typeof marker === "string" ? [marker] : marker;

async function hasAny(dir: string, markers: readonly string[]): Promise<boolean> {
	for (const marker of markers) {
		try {
			await stat(join(dir, marker));
			return true;
		} catch {
			// not here — try the next marker
		}
	}
	return false;
}

/**
 * The nearest ancestor of `startDir` (itself first) that contains `marker` —
 * a file or directory name, or a list of names where any one counts. For
 * example `".git"`, `"pnpm-workspace.yaml"`, or `["turbo.json", "nx.json"]`.
 *
 * Resolves to `undefined` when nothing is found, unless `options.fallback` is
 * `"start"`. See {@link FindRootOptions}; {@link findRootSync} is the
 * synchronous twin. Built on {@link findUpward}.
 */
export async function findRoot(
	startDir: string,
	marker: string | readonly string[],
	options: FindRootOptions = {}
): Promise<string | undefined> {
	const markers = asList(marker);
	let start = startDir;
	if (options.realpath) {
		try {
			start = realpathSync(startDir);
		} catch {
			return options.fallback === "start" ? startDir : undefined;
		}
	}
	const found = await findUpward(start, async (dir) => ((await hasAny(dir, markers)) ? dir : undefined));
	return found ?? (options.fallback === "start" ? start : undefined);
}

/** Synchronous {@link findRoot}. */
export function findRootSync(
	startDir: string,
	marker: string | readonly string[],
	options: FindRootOptions = {}
): string | undefined {
	const markers = asList(marker);
	let start = startDir;
	if (options.realpath) {
		try {
			start = realpathSync(startDir);
		} catch {
			return options.fallback === "start" ? startDir : undefined;
		}
	}
	let dir = start;
	for (;;) {
		if (markers.some((m) => existsSync(join(dir, m)))) return dir;
		const parent = dirname(dir);
		// `dirname` of the filesystem root is itself — nowhere left to climb.
		if (parent === dir) return options.fallback === "start" ? start : undefined;
		dir = parent;
	}
}
