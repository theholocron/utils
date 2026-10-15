import { describe, expect, it } from "vitest";

import { parsePackageJson } from "./parse-package-json.ts";

describe("parsePackageJson", () => {
	it("parses a JSON object", () => {
		expect(parsePackageJson('{"name":"x","scripts":{"a":"b"}}')).toEqual({ name: "x", scripts: { a: "b" } });
	});

	it("ignores a leading byte-order mark", () => {
		expect(parsePackageJson('﻿{"name":"x"}')).toEqual({ name: "x" });
	});

	it("returns undefined for invalid JSON", () => {
		expect(parsePackageJson("{ nope")).toBeUndefined();
		expect(parsePackageJson("")).toBeUndefined();
	});

	it("returns undefined for valid JSON that isn't an object", () => {
		for (const text of ["[]", "null", '"x"', "1", "true"]) expect(parsePackageJson(text)).toBeUndefined();
	});
});
