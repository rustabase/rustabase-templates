// Builds one template into dist/: copies its files plus the shared client,
// and writes config.js with the backend address passed as the first argument
// (or RUSTABASE_URL). Usage from a template folder: bun ../../scripts/build.mjs https://api.example.com
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const url = (process.argv[2] || process.env.RUSTABASE_URL || "").trim().replace(/\/+$/, "");
if (url && !/^https?:\/\/[^\s"'<>]+$/.test(url)) {
  console.error("The backend address must start with https://");
  process.exit(1);
}
const here = process.cwd();
const out = join(here, "dist");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(here, "src"), out, { recursive: true });
cpSync(resolve(here, "../../shared"), out, { recursive: true });
writeFileSync(join(out, "config.js"), `window.RUSTABASE_URL = ${JSON.stringify(url)};\n`);
if (!existsSync(join(out, "index.html"))) { console.error("src/index.html is missing"); process.exit(1); }
console.log("Built", here, "→ dist/", url ? "(backend " + url + ")" : "(no backend set — add ?backend=… to the address)");
