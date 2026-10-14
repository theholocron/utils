import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GitRemote {
	host: string;
	/** Everything before the repo name: `owner`, or `group/subgroup` on hosts with nested groups. */
	owner: string;
	repo: string;
	/** `owner/repo`. */
	slug: string;
}

/**
 * Parses a git remote URL — any host, any of the common shapes:
 *
 * - `https://github.com/owner/repo(.git)(/)`, with optional credentials or port
 * - `git@github.com:owner/repo(.git)` (scp-style SSH)
 * - `ssh://git@github.com(:22)/owner/repo(.git)`
 * - `git://github.com/owner/repo.git`
 *
 * `undefined` for anything else (a local path, an empty string, a URL with
 * fewer than two path segments).
 */
export function parseGitRemoteUrl(url: string): GitRemote | undefined {
	const input = url.trim();
	const withScheme = /^[a-z][a-z0-9+.-]*:\/\/(?:[^@/\s]*@)?([^:/\s]+)(?::\d+)?\/([^\s?#]+)/i.exec(input);
	// `host:path`, not `scheme://…` (the lookahead) and not a Windows drive (`C:`, one letter).
	const scp = withScheme ? null : /^(?:[^@/\s]+@)?([^:/\s]{2,}):(?!\/\/)([^\s]+)$/.exec(input);
	const match = withScheme ?? scp;
	if (!match) return undefined;

	const host = match[1]!;
	const segments = match[2]!
		.replace(/\/+$/, "")
		.replace(/\.git$/, "")
		.split("/")
		.filter(Boolean);
	if (segments.length < 2) return undefined;

	const repo = segments[segments.length - 1]!;
	const owner = segments.slice(0, -1).join("/");
	return { host, owner, repo, slug: `${owner}/${repo}` };
}

/**
 * Runs `git <args>` in `options.cwd` and resolves its stdout; rejects when git
 * exits non-zero. Injectable so callers' tests don't need a real repository.
 */
export type GitExec = (args: string[], options: { cwd: string }) => Promise<string>;

const defaultExec: GitExec = async (args, { cwd }) => (await execFileAsync("git", args, { cwd })).stdout;

export interface ReadGitRemoteOptions {
	exec?: GitExec;
	/** Remote name. Default `"origin"`. */
	remote?: string;
}

/**
 * The parsed URL of a repository's remote (`git remote get-url <remote>`), or
 * `undefined` when `cwd` isn't a repository, has no such remote, git isn't
 * installed, or the URL isn't one {@link parseGitRemoteUrl} understands.
 */
export async function readGitRemote(cwd: string, options: ReadGitRemoteOptions = {}): Promise<GitRemote | undefined> {
	const exec = options.exec ?? defaultExec;
	try {
		const stdout = await exec(["remote", "get-url", options.remote ?? "origin"], { cwd });
		return parseGitRemoteUrl(stdout);
	} catch {
		return undefined;
	}
}
