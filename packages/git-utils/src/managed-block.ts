import { readFile, writeFile } from "node:fs/promises";

export interface ManagedBlockOptions {
	/** The line that opens the block, e.g. `# managed by my-tool — skills`. Matched as text, so it must be distinctive. */
	start: string;
	/** The line that closes the block. */
	end: string;
	/** What goes between the markers, one entry per line. */
	lines: readonly string[];
}

/**
 * Inserts or replaces a block of lines delimited by marker lines, leaving
 * everything outside it untouched.
 *
 * - Block present (`start` … `end`): replaced in place.
 * - No block: appended, separated from existing content by a blank line, with a
 *   single trailing newline.
 * - `start` present but `end` missing (hand-edited or truncated): the block is
 *   taken to run to the next blank line, or to the end of the file — so the
 *   content after it is kept, not lost.
 *
 * Idempotent: calling it again with the same options returns the same text.
 * There are no default markers; callers choose them, and must keep them stable
 * so existing blocks are still found.
 */
export function upsertManagedBlock(content: string, { start, end, lines }: ManagedBlockOptions): string {
	const block = [start, ...lines, end].join("\n");
	const startAt = content.indexOf(start);
	if (startAt === -1) {
		const base = content.trimEnd();
		return (base ? `${base}\n\n` : "") + `${block}\n`;
	}
	const endAt = content.indexOf(end, startAt);
	if (endAt !== -1) {
		return content.slice(0, startAt) + block + content.slice(endAt + end.length);
	}
	const blank = content.indexOf("\n\n", startAt);
	return content.slice(0, startAt) + block + (blank === -1 ? "\n" : content.slice(blank));
}

/**
 * {@link upsertManagedBlock} applied to a file (a missing file counts as empty,
 * and is created). Writes only when the content changes. Resolves to `true`
 * when it wrote.
 */
export async function updateGitignore(path: string, options: ManagedBlockOptions): Promise<boolean> {
	const existing = await readFile(path, "utf8").catch(() => "");
	const updated = upsertManagedBlock(existing, options);
	if (updated === existing) return false;
	await writeFile(path, updated, "utf8");
	return true;
}
