// Builds lib/teardown-digest.json: a compact digest of every ad-teardown page in public/teardowns/ (all brands),
// so the content agent can read what competitors run without parsing 3 MB pages on every request.
// With --store it also saves the digest to the live database (docs key "teardown-digest"), which the agent reads
// on every run, so a new brand's ad-library data is used without redeploying the code.
// It runs automatically from `npm run deploy`, `desk.mjs doc teardowns ...` and silt-ad-tools/to-desk.mjs.
//   node scripts/teardown-digest.mjs [--store]
// Pages without a `const D =` data block (such as the old SILT static ad prompts page) are skipped on purpose.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { extractData, digestFromData } from "../lib/digest.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public", "teardowns");

const brands = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".html"))) {
  let D;
  try { D = extractData(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { console.log(`skipped ${f}: ${e.message}`); continue; }
  if (!D) continue;
  brands.push(digestFromData(D, `/teardowns/${f}`, fs.statSync(path.join(dir, f)).mtime.toISOString()));
}

const out = { built: new Date().toISOString(), brands };
const file = path.join(root, "lib", "teardown-digest.json");
fs.writeFileSync(file, JSON.stringify(out, null, 1));
console.log(`wrote ${file}: ${brands.length} brand teardown(s) [${brands.map(b => b.brand).join(", ")}], ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);

// Stored as one database entry per brand (docs "digest-<slug>"): D1 caps one SQL statement at 100 KB,
// and many brands together are bigger than that.
if (process.argv.includes("--store")) {
  const q = s => "'" + String(s).replace(/'/g, "''") + "'";
  const now = new Date().toISOString();
  const sql = brands.map(b => {
    const slug = path.basename(b.page, ".html");
    return `INSERT INTO docs (key, doc, updated_at) VALUES (${q("digest-" + slug)}, ${q(JSON.stringify(b))}, ${q(now)}) ON CONFLICT(key) DO UPDATE SET doc = excluded.doc, updated_at = excluded.updated_at;`;
  }).join(String.fromCharCode(10));
  const tmp = path.join(root, `.digest-${Date.now()}.sql`);
  fs.writeFileSync(tmp, sql, "utf8");
  try {
    execFileSync(process.execPath, [path.join(root, "node_modules", "wrangler", "bin", "wrangler.js"), "d1", "execute", "silt_desk", process.env.DESK_LOCAL ? "--local" : "--remote", "--yes", `--file=${tmp}`], { cwd: root, stdio: ["ignore", "ignore", "inherit"] });
    console.log(`stored ${brands.length} brand digests in the database`);
  } finally { fs.rmSync(tmp, { force: true }); }
}
