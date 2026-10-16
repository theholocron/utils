import type { EnvLookup } from "./create-env-lookup.js";

/**
 * Wrap an {@link EnvLookup} so every `get(key)` tries `<prefix>_<key>` first
 * and falls back to the bare `key`. Callers name the variable once, and the
 * namespaced override wins when it is set.
 *
 * Pass the prefix without a trailing underscore. Empty values are skipped,
 * as in {@link EnvLookup.get}.
 *
 * @example
 * const env = withEnvPrefix(createEnvLookup(), "HOLOCRON");
 * env.get("SENTRY_DSN"); // HOLOCRON_SENTRY_DSN, else SENTRY_DSN
 */
export function withEnvPrefix(env: EnvLookup, prefix: string): EnvLookup {
	return {
		get(key: string): string | undefined {
			return env.get(`${prefix}_${key}`) ?? env.get(key);
		},
	};
}
