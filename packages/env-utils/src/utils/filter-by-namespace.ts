/**
 * Filter raw env vars to only those matching a namespace prefix,
 * stripping the prefix from each key before returning.
 *
 * Case-insensitive: "holocron_debug" and "HOLOCRON_DEBUG" both match
 * namespace "HOLOCRON".
 *
 * @example
 * filterByNamespace({ HOLOCRON_DEBUG: "true", PORT: "3000" }, "HOLOCRON")
 * // → { DEBUG: "true" }
 */
export function filterByNamespace(
	raw: Record<string, string | undefined>,
	namespace: string
): Record<string, string | undefined> {
	const prefix = `${namespace.toUpperCase()}_`;
	const result: Record<string, string | undefined> = {};

	for (const [key, value] of Object.entries(raw)) {
		if (key.toUpperCase().startsWith(prefix)) {
			result[key.slice(prefix.length)] = value;
		}
	}

	return result;
}

/**
 * Merge multiple namespace-filtered views of a raw env record.
 *
 * Namespaces are listed in descending priority order — the first entry
 * wins when the same key exists under multiple prefixes.
 *
 * @example
 * // CLI_TEMPLATE_DEBUG overrides HOLOCRON_DEBUG
 * mergeNamespaces(raw, ["CLI_TEMPLATE", "HOLOCRON"])
 */
export function mergeNamespaces(
	raw: Record<string, string | undefined>,
	namespaces: string[]
): Record<string, string | undefined> {
	const result: Record<string, string | undefined> = {};

	// Process lowest-priority first; higher-priority namespaces overwrite.
	for (let i = namespaces.length - 1; i >= 0; i--) {
		Object.assign(result, filterByNamespace(raw, namespaces[i]!));
	}

	return result;
}
