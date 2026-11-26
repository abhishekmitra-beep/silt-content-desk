// Which Cloudflare names this copy of the project deploys to.
// SILT's own copy uses the defaults below. A new copy gets its own site.config.json from `node setup.mjs`
// (that file is not committed, so every copy keeps its own names).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const CONFIG_FILE = path.join(ROOT, "site.config.json");

const DEFAULTS = {
  deskProject: "silt-content-desk",      // Cloudflare Pages project (and https://<name>.pages.dev) for the Content Desk
  engineProject: "silt-static-engine",   // Cloudflare Pages project for the Static Engine
  dbName: "silt_desk",                   // D1 database both sites share (names are per account, so every copy can keep it)
  dbId: "722c1c48-c0f8-4c54-ae5a-5a8c313274bf",
};

export function siteConfig() {
  let own = {};
  try { own = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")); } catch { /* no file: SILT's own copy */ }
  return { ...DEFAULTS, ...own };
}

export const wranglerBin = () => path.join(ROOT, "cloudflare", "node_modules", "wrangler", "bin", "wrangler.js");
