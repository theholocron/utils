import { chmod, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { findExecutable, findExecutableSync } from "./find-executable.ts";

describe.each([
	["findExecutable", findExecutable],
	["findExecutableSync", async (...args: Parameters<typeof findExecutableSync>) => findExecutableSync(...args)],
] as const)("%s", (_name, find) => {
	let root: string;
	let binA: string;
	let binB: string;

	const script = async (dir: string, name: string, mode = 0o755) => {
		const file = join(dir, name);
		await writeFile(file, "#!/bin/sh\n");
		await chmod(file, mode);
		return file;
	};

	beforeEach(async () => {
		root = await mkdtemp(join(tmpdir(), "fs-utils-exec-"));
		binA = join(root, "a");
		binB = join(root, "b");
		await mkdir(binA);
		await mkdir(binB);
	});
	afterEach(async () => {
		await rm(root, { recursive: true, force: true });
	});

	it("returns the first matching entry in path order", async () => {
		await script(binA, "tool");
		const inB = await script(binB, "tool");
		expect(await find("tool", { path: [binB, binA].join(delimiter) })).toBe(inB);
	});

	it("falls through to a later entry when earlier ones lack it", async () => {
		const inB = await script(binB, "tool");
		expect(await find("tool", { path: [binA, binB].join(delimiter) })).toBe(inB);
	});

	it("returns undefined when nothing matches, or the path is empty", async () => {
		expect(await find("tool", { path: binA })).toBeUndefined();
		expect(await find("tool", { path: "" })).toBeUndefined();
	});

	it("skips empty entries instead of reading them as the working directory", async () => {
		const inB = await script(binB, "tool");
		expect(await find("tool", { path: ["", binB].join(delimiter) })).toBe(inB);
	});

	it("skips directories named like the command", async () => {
		await mkdir(join(binA, "tool"));
		const inB = await script(binB, "tool");
		expect(await find("tool", { path: [binA, binB].join(delimiter) })).toBe(inB);
	});

	it("skips files without the exec bit", async () => {
		await script(binA, "tool", 0o644);
		const inB = await script(binB, "tool");
		expect(await find("tool", { path: [binA, binB].join(delimiter) })).toBe(inB);
	});

	it("follows a symlink to an executable", async () => {
		const target = await script(binA, "real");
		await symlink(target, join(binB, "tool"));
		expect(await find("tool", { path: binB })).toBe(join(binB, "tool"));
	});

	it("skips search entries that don't exist or aren't directories", async () => {
		const file = await script(binA, "plain");
		const inB = await script(binB, "tool");
		expect(await find("tool", { path: [join(root, "missing"), file, binB].join(delimiter) })).toBe(inB);
	});

	it("reads process.env.PATH by default", async () => {
		const inA = await script(binA, "tool");
		const saved = process.env["PATH"];
		process.env["PATH"] = binA;
		try {
			expect(await find("tool")).toBe(inA);
		} finally {
			process.env["PATH"] = saved;
		}
	});

	it("throws filesystem errors other than not-there / not-permitted", async () => {
		await symlink("loop", join(binA, "loop"));
		await expect(Promise.resolve().then(() => find("loop", { path: binA }))).rejects.toThrow(/ELOOP/);
	});

	it("rejects anything that isn't a bare command name", async () => {
		for (const bin of ["", ".", "..", "a/b", "a\\b", "a\0b"]) {
			await expect(Promise.resolve().then(() => find(bin, { path: binA }))).rejects.toThrow(TypeError);
		}
	});

	it("treats a bin that already carries a PATHEXT extension as complete on Windows", async () => {
		const exe = await script(binA, "git.exe", 0o644);
		await script(binA, "git.exe.EXE", 0o644);
		expect(await find("git.exe", { path: binA, platform: "win32", pathExt: ".EXE;.CMD" })).toBe(exe);
	});

	it("tries each PATHEXT extension on Windows and ignores the exec bit", async () => {
		const cmd = await script(binA, "tool.CMD", 0o644);
		expect(await find("tool", { path: binA, platform: "win32", pathExt: ".EXE;.CMD" })).toBe(cmd);
	});

	it("falls back to the default PATHEXT on Windows", async () => {
		const exe = await script(binA, "tool.EXE", 0o644);
		const saved = process.env["PATHEXT"];
		delete process.env["PATHEXT"];
		try {
			expect(await find("tool", { path: binA, platform: "win32" })).toBe(exe);
		} finally {
			if (saved !== undefined) process.env["PATHEXT"] = saved;
		}
	});

	it("does not append extensions on POSIX", async () => {
		await script(binA, "tool.EXE");
		expect(await find("tool", { path: binA, platform: "linux", pathExt: ".EXE" })).toBeUndefined();
	});
});
