import { chmod, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { walkFilesSync } from "./walk-files.ts";

describe("walkFilesSync", () => {
	let dir: string;
	beforeEach(async () => {
		dir = await mkdtemp(join(tmpdir(), "fs-utils-walk-"));
	});
	afterEach(async () => {
		await rm(dir, { recursive: true, force: true });
	});

	async function put(rel: string): Promise<string> {
		const path = join(dir, rel);
		await mkdir(join(path, ".."), { recursive: true });
		await writeFile(path, "");
		return path;
	}

	it("lists every file at any depth, absolute and name-sorted", async () => {
		const b = await put("b.txt");
		const a = await put("a/deep/x.txt");
		const c = await put("a/c.txt");
		expect(walkFilesSync(dir)).toEqual([c, a, b]);
	});

	it("skips .git and node_modules by default, at any depth", async () => {
		const keep = await put("src/index.ts");
		await put(".git/HEAD");
		await put("node_modules/x/index.js");
		await put("packages/p/node_modules/y.js");
		expect(walkFilesSync(dir)).toEqual([keep]);
	});

	it("skips exactly the directory names in options.skip, replacing the defaults", async () => {
		await put("dist/out.js");
		const modules = await put("node_modules/x.js");
		const src = await put("src/a.ts");
		expect(walkFilesSync(dir, { skip: ["dist"] })).toEqual([modules, src]);
		expect(walkFilesSync(dir, { skip: new Set<string>() })).toEqual([join(dir, "dist", "out.js"), modules, src]);
	});

	it("neither follows nor lists symlinks", async () => {
		const real = await put("real/a.txt");
		await symlink(join(dir, "real"), join(dir, "link-to-dir"));
		await symlink(real, join(dir, "link-to-file"));
		await symlink(dir, join(dir, "real", "loop"));
		expect(walkFilesSync(dir)).toEqual([real]);
	});

	it("skips an unreadable subdirectory but throws for an unreadable or missing root", async () => {
		const ok = await put("ok/a.txt");
		await put("locked/b.txt");
		await chmod(join(dir, "locked"), 0o000);
		try {
			expect(walkFilesSync(dir)).toEqual([ok]);
		} finally {
			await chmod(join(dir, "locked"), 0o755);
		}
		expect(() => walkFilesSync(join(dir, "missing"))).toThrow(/ENOENT/);
	});

	it("resolves a relative root against the working directory", async () => {
		const a = await put("a.txt");
		const previous = process.cwd();
		process.chdir(dir);
		try {
			expect(walkFilesSync(".").map((p) => p.replace(/^\/private/, ""))).toEqual([a.replace(/^\/private/, "")]);
		} finally {
			process.chdir(previous);
		}
	});
});
