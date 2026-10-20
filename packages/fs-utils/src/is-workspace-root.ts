import { access } from "node:fs/promises";
import { join } from "node:path";

/**
 * `true` when `dir` has a `pnpm-workspace.yaml` — the file that marks a
 * pnpm workspace root. Several pnpm CLI commands (`pnpm add` among them)
 * behave differently at a workspace root than in a plain package, so
 * callers shelling out to pnpm need this check before deciding which
 * flags to pass.
 */
export async function isWorkspaceRoot(dir: string): Promise<boolean> {
	return access(join(dir, "pnpm-workspace.yaml"))
		.then(() => true)
		.catch(() => false);
}
