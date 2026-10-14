import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { updateGitignore, upsertManagedBlock } from "./managed-block.ts";

const opts = { start: "# managed: skills", end: "# end managed: skills", lines: ["/.agents/", "/.claude/skills/a"] };
const block = "# managed: skills\n/.agents/\n/.claude/skills/a\n# end managed: skills";

describe("upsertManagedBlock", () => {
	it("creates the block in an empty file with one trailing newline", () => {
		expect(upsertManagedBlock("", opts)).toBe(`${block}\n`);
	});

	it("appends after existing content, separated by a blank line", () => {
		expect(upsertManagedBlock("node_modules\ndist\n", opts)).toBe(`node_modules\ndist\n\n${block}\n`);
		expect(upsertManagedBlock("node_modules", opts)).toBe(`node_modules\n\n${block}\n`);
	});

	it("collapses trailing blank lines before appending", () => {
		expect(upsertManagedBlock("a\n\n\n", opts)).toBe(`a\n\n${block}\n`);
	});

	it("replaces an existing block in place, keeping what is above and below", () => {
		const before = "top\n\n# managed: skills\n/old\n# end managed: skills\n\nbottom\n";
		expect(upsertManagedBlock(before, opts)).toBe(`top\n\n${block}\n\nbottom\n`);
	});

	it("is idempotent", () => {
		const once = upsertManagedBlock("node_modules\n", opts);
		expect(upsertManagedBlock(once, opts)).toBe(once);
	});

	it("can empty a block's lines", () => {
		const out = upsertManagedBlock(`${block}\n`, { ...opts, lines: [] });
		expect(out).toBe("# managed: skills\n# end managed: skills\n");
	});

	it("start present, end missing: replaces to the next blank line and keeps what follows", () => {
		const before = "top\n\n# managed: skills\n/stale\n\nkeep-me\nand-me\n";
		expect(upsertManagedBlock(before, opts)).toBe(`top\n\n${block}\n\nkeep-me\nand-me\n`);
	});

	it("start present, end missing, block runs to the end of the file", () => {
		expect(upsertManagedBlock("top\n# managed: skills\n/stale\n", opts)).toBe(`top\n${block}\n`);
	});

	it("never matches the end marker before the start marker", () => {
		const before = "# end managed: skills\nx\n# managed: skills\n/old\n# end managed: skills\n";
		expect(upsertManagedBlock(before, opts)).toBe(`# end managed: skills\nx\n${block}\n`);
	});
});

describe("updateGitignore", () => {
	let dir: string;
	beforeEach(async () => {
		dir = await mkdtemp(join(tmpdir(), "git-utils-ignore-"));
	});
	afterEach(async () => {
		await rm(dir, { recursive: true, force: true });
	});

	it("creates a missing file", async () => {
		const path = join(dir, ".gitignore");
		expect(await updateGitignore(path, opts)).toBe(true);
		expect(await readFile(path, "utf8")).toBe(`${block}\n`);
	});

	it("updates an existing file and keeps its other lines", async () => {
		const path = join(dir, ".gitignore");
		await writeFile(path, "node_modules\n");
		expect(await updateGitignore(path, opts)).toBe(true);
		expect(await readFile(path, "utf8")).toBe(`node_modules\n\n${block}\n`);
	});

	it("does not write when nothing changes", async () => {
		const path = join(dir, ".gitignore");
		await updateGitignore(path, opts);
		const before = (await stat(path)).mtimeMs;
		await new Promise((r) => setTimeout(r, 20));
		expect(await updateGitignore(path, opts)).toBe(false);
		expect((await stat(path)).mtimeMs).toBe(before);
	});
});
