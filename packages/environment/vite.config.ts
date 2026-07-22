import { defineMgniConfig, parsePackageName } from "@magnite/vite-config";
import pkg from "./package.json" with { type: "json" };

const name = parsePackageName(pkg.name);

export default defineMgniConfig(name);
