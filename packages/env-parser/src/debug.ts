import { environment } from "@magnite/environment";
import { collectKeys } from "./utils/index.js";
import type { EnvObject } from "./types.js";

/**
 * Whether debug mode is active.
 *
 * Triggers when process.env.DEBUG is any truthy-looking value
 * ("true", "1", "yes") — case-insensitive.
 *
 * Checked lazily so it reflects whatever DEBUG is at call time,
 * including values loaded from .env.
 */
function isDebugEnabled(): boolean {
	const raw = process.env["DEBUG"];
	if (!raw) return false;
	return ["true", "1", "yes"].includes(raw.toLowerCase());
}

/**
 * Log env-parser debug info locally using the observe library.
 *
 * Hard rules:
 *  - Never runs in a deployed environment (via isDeployed).
 *  - Never logs values — only key names and counts.
 *  - Only fires when DEBUG is truthy.
 */
export function debugLog(appName: string, env: EnvObject): void {
	if (environment.isDeployed()) return;
	if (!isDebugEnabled()) return;

	const keys = collectKeys(env);
	console.info(
		`[@magnite/env-parser] (debugLog) - ${appName} loaded ${keys.length} key(s) from environment`,
		{
			keys,
		},
	);
}

/**
 * Warn locally when a get() call doesn't resolve to a value.
 * The consuming app decides what to do — this is just a signal.
 * No-ops in deployed environments.
 */
export function warnMissingKey(appName: string, key: string): void {
	if (environment.isDeployed()) return;
	if (!isDebugEnabled()) return;

	console.warn(
		`[@magnite/env-parser] (warnMissingKey) - ${appName} key not found: "${key}" — returned undefined`,
	);
}

/**
 * Warn locally when a deprecated key is still present.
 * No-ops in deployed environments — this is purely a local dev signal.
 */
export function debugDeprecation(
	appName: string,
	oldKey: string,
	newKey: string,
	env: EnvObject,
): void {
	if (environment.isDeployed()) return;
	if (!(oldKey in env)) return;

	console.warn(
		`[@magnite/env-parser] (debugDeprecation) - ${appName} "${oldKey}" is deprecated; migrate to "${newKey}"`,
	);
}

export const debug = {
	log: debugLog,
	deprecate: debugDeprecation,
	warn: warnMissingKey,
};
