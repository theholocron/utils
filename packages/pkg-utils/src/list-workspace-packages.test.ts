import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { listWorkspacePackagesSync } from "./list-workspace-packages.ts";

describe("listWorkspacePackagesSync", () => {
	let repo: string;
	beforeEach(async () => {
		repo = await mkdtemp(join(tmpdir(), "pkg-utils-ws-"));
	});
	afterEach(async () => {
		await rm(repo, { recursive: true, force: true });
	});

	async function pkg(rel: string, manifest: unknown): Promise<void> {
		await mkdir(join(repo, rel), { recursive: true });
		await writeFile(
			join(repo, rel, "package.json"),
			typeof manifest === "string" ? manifest : JSON.stringify(manifest)
		);
	}

	it("lists packages/* then plugins/*, sorted within each root, with absolute and relative dirs", async () => {
		await pkg("plugins/z", { name: "z", version: "1.0.0" });
		await pkg("packages/b", { name: "b", private: true });
		await pkg("packages/a", { name: "a", version: "2.0.0" });
		const entries = listWorkspacePackagesSync(repo);
		expect(entries.map((e) => e.relativeDir)).toEqual(["packages/a", "packages/b", "plugins/z"]);
		expect(entries[0]).toEqual({
			name: "a",
			dir: join(repo, "packages", "a"),
			relativeDir: "packages/a",
			manifest: { name: "a", version: "2.0.0" },
		});
		expect(entries[1]!.manifest.private).toBe(true);
	});

	it("scans the roots it is given instead of the defaults", async () => {
		await pkg("apps/web", { name: "web" });
		await pkg("packages/lib", { name: "lib" });
		expect(listWorkspacePackagesSync(repo, { roots: ["apps"] }).map((e) => e.name)).toEqual(["web"]);
		expect(listWorkspacePackagesSync(repo, { roots: ["packages", "apps"] }).map((e) => e.name)).toEqual([
			"lib",
			"web",
		]);
	});

	it("keeps a package without a name, leaving the filtering to the caller", async () => {
		await pkg("packages/anon", { version: "1.0.0" });
		expect(listWorkspacePackagesSync(repo)).toMatchObject([{ name: undefined, relativeDir: "packages/anon" }]);
	});

	it("skips missing roots, non-directories and directories without a usable manifest", async () => {
		await pkg("packages/ok", { name: "ok" });
		await pkg("packages/broken", "{ nope");
		await pkg("packages/array", "[]");
		await mkdir(join(repo, "packages", "empty"), { recursive: true });
		await writeFile(join(repo, "packages", "README.md"), "");
		expect(listWorkspacePackagesSync(repo).map((e) => e.name)).toEqual(["ok"]);
		expect(listWorkspacePackagesSync(join(repo, "nowhere"))).toEqual([]);
	});

	it("follows a symlinked package directory", async () => {
		await pkg("elsewhere/linked", { name: "linked" });
		await mkdir(join(repo, "packages"), { recursive: true });
		await symlink(join(repo, "elsewhere", "linked"), join(repo, "packages", "linked"));
		expect(listWorkspacePackagesSync(repo).map((e) => e.name)).toEqual(["linked"]);
	});

	it("ignores a dangling symlink in a root", async () => {
		await mkdir(join(repo, "packages"), { recursive: true });
		await symlink(join(repo, "gone"), join(repo, "packages", "dangling"));
		expect(listWorkspacePackagesSync(repo)).toEqual([]);
	});

	it("reads through injected readFile and listDirs, verifying the paths asked for", () => {
		const listed: string[] = [];
		const read: string[] = [];
		const entries = listWorkspacePackagesSync("/repo", {
			roots: ["packages"],
			listDirs: (dir) => {
				listed.push(dir);
				return ["b", "a"];
			},
			readFile: (path) => {
				read.push(path);
				if (path === join("/repo", "packages", "b", "package.json")) throw new Error("ENOENT");
				return '{"name":"a"}';
			},
		});
		expect(listed).toEqual([join("/repo", "packages")]);
		expect(read).toEqual([
			join("/repo", "packages", "a", "package.json"),
			join("/repo", "packages", "b", "package.json"),
		]);
		expect(entries.map((e) => e.relativeDir)).toEqual(["packages/a"]);
	});
});
