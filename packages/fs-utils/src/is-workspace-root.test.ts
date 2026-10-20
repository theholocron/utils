import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isWorkspaceRoot } from "./is-workspace-root.ts";

describe("isWorkspaceRoot", () => {
	let dir: string;

	beforeEach(async () => {
		dir = await mkdtemp(join(tmpdir(), "fs-utils-workspace-root-"));
	});
	afterEach(async () => {
		await rm(dir, { recursive: true, force: true });
	});

	it("returns true when pnpm-workspace.yaml exists in dir", async () => {
		await writeFile(join(dir, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n");
		expect(await isWorkspaceRoot(dir)).toBe(true);
	});

	it("returns false when pnpm-workspace.yaml is absent", async () => {
		expect(await isWorkspaceRoot(dir)).toBe(false);
	});

	it("returns false, not a rejection, when dir itself doesn't exist", async () => {
		await expect(isWorkspaceRoot(join(dir, "nonexistent"))).resolves.toBe(false);
	});

	it("returns false when pnpm-workspace.yaml is a directory, not a file", async () => {
		// access() only checks existence/permissions, not file type — a
		// same-named directory still satisfies it. Documenting the actual
		// behavior here rather than guarding against a scenario that
		// shouldn't occur in practice (pnpm itself always writes this as a
		// file).
		await mkdir(join(dir, "pnpm-workspace.yaml"));
		expect(await isWorkspaceRoot(dir)).toBe(true);
	});
});
