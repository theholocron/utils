export interface StringifyJsonOptions {
	/** Indent for each level: a number of spaces or a literal string (e.g. `"\t"`). Default `2`. */
	indent?: number | string;
	/**
	 * The existing file's text. Its detected indent and line endings are used
	 * instead of `indent`, so rewriting a file doesn't reformat it. Falls back
	 * to `indent` when no indent can be detected (empty or single-line input).
	 */
	like?: string;
}

/**
 * The first indentation used in a JSON document — the leading whitespace of
 * the first indented line (spaces or a tab). `undefined` when there is none,
 * e.g. a minified or single-line document.
 *
 * Raw newlines can't occur inside a JSON string, so any line that starts with
 * whitespace is structural indentation.
 */
export function detectIndent(text: string): string | undefined {
	for (const line of text.split(/\r?\n/)) {
		const match = /^([ \t]+)\S/.exec(line);
		if (match) return match[1];
	}
	return undefined;
}

/**
 * `JSON.stringify` pretty-printed and ending in exactly one newline — the shape
 * every `package.json`-style file on disk should have.
 *
 * Pass the file's current text as `like` to keep its own indent (tabs, 4
 * spaces, …) and line endings (`\r\n`) when rewriting it.
 *
 * @throws {TypeError} when `value` has no JSON representation (`undefined`, a
 * function, a symbol) — `JSON.stringify` would return `undefined` for it.
 */
export function stringifyJson(value: unknown, options: StringifyJsonOptions = {}): string {
	let indent = options.indent ?? 2;
	let eol = "\n";
	if (options.like !== undefined) {
		indent = detectIndent(options.like) ?? indent;
		if (options.like.includes("\r\n")) eol = "\r\n";
	}
	const json = JSON.stringify(value, null, indent) as string | undefined;
	if (json === undefined) throw new TypeError("Cannot stringify a value that has no JSON representation");
	// Newlines in the output are structural only: JSON.stringify escapes them inside strings.
	return (eol === "\n" ? json : json.replace(/\n/g, eol)) + eol;
}
