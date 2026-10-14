// Restores binary assets that were committed as base64 text (assets-b64/<path>.b64 → public/<path>).
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
const root = "assets-b64";
const walk = (dir) => readdirSync(dir).flatMap((name) => { const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : [p]; });
let count = 0;
try {
  for (const file of walk(root).filter((f) => f.endsWith(".b64"))) {
    const target = join("public", relative(root, file).replace(/\.b64$/, ""));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, Buffer.from(readFileSync(file, "utf8").replace(/\s+/g, ""), "base64"));
    count++;
  }
} catch (error) { if (error.code !== "ENOENT") throw error; }
console.log(`decode-assets: restored ${count} file(s)`);
