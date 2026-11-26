// One-command setup of your OWN copy of the SILT Content Desk and SILT Static Engine on your Cloudflare account.
//
//   1. npx wrangler login            (once, inside the cloudflare folder, after `npm install` there)
//   2. node setup.mjs --name yourbrand
//
// It creates (or reuses) a D1 database called silt_desk, creates two Cloudflare Pages projects
// (yourbrand-content-desk and yourbrand-static-engine), sets their secrets, builds and deploys both sites.
// Add --dry-run to print every step without changing anything on Cloudflare.
// Safe to run again: existing database, projects and secrets are reused or refreshed.
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT, CONFIG_FILE, siteConfig, wranglerBin } from "./site-config.mjs";

const args = process.argv.slice(2);
const flag = n => args.includes(`--${n}`);
const opt = n => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const DRY = flag("dry-run");
const name = (opt("name") || "").toLowerCase();
const say = s => console.log(`\n== ${s}`);
const fail = s => { console.error(`\n${s}`); process.exit(1); };

if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(name)) fail("Give your copy a short name: node setup.mjs --name yourbrand   (lowercase letters, digits and hyphens)");
if (+process.versions.node.split(".")[0] < 20) fail("Node 20 or newer is needed (https://nodejs.org).");
const deskProject = opt("desk") || `${name}-content-desk`;
const engineProject = opt("engine") || `${name}-static-engine`;
const CF = path.join(ROOT, "cloudflare"), SE = path.join(ROOT, "static-engine");

// 0. Tools
if (!fs.existsSync(wranglerBin())) {
  say("Installing the Cloudflare tool (npm install in cloudflare/)");
  execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["install"], { cwd: CF, stdio: "inherit", shell: process.platform === "win32" });
}
const wr = (a, o = {}) => execFileSync(process.execPath, [wranglerBin(), ...a], { cwd: CF, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...o });
const change = (label, a, o) => { if (DRY) { console.log(`   [dry-run] wrangler ${a.join(" ")}`); return ""; } console.log(`   ${label}`); return wr(a, o); };

// 1. Signed in?
say("Checking your Cloudflare login");
let who = "";
try { who = wr(["whoami"]); } catch (e) { who = String(e.stdout || "") + String(e.stderr || ""); }
if (/not authenticated|You are not logged in/i.test(who) || !/@/.test(who)) fail("Not signed in to Cloudflare. Run:  cd cloudflare && npx wrangler login   then run this again.");
console.log("   signed in");

// 2. Database
say("Database (D1) silt_desk");
const list = () => { try { return JSON.parse(wr(["d1", "list", "--json"])); } catch { return []; } };
let db = list().find(d => d.name === "silt_desk");
if (!db) { change("creating silt_desk", ["d1", "create", "silt_desk"]); db = DRY ? { uuid: "<new-database-id>" } : list().find(d => d.name === "silt_desk"); }
const dbId = db && (db.uuid || db.id);
if (!dbId) fail("Couldn't find or create the silt_desk database. Check the Cloudflare dashboard (Workers & Pages > D1).");
console.log(`   id ${dbId}`);

// 3. Point this copy at your names and database
say("Saving your names to site.config.json and cloudflare/wrangler.toml");
const cfg = { ...siteConfig(), deskProject, engineProject, dbName: "silt_desk", dbId };
if (!DRY) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2) + "\n");
  const tomlFile = path.join(CF, "wrangler.toml");
  const toml = fs.readFileSync(tomlFile, "utf8").replace(/^name = ".*"$/m, `name = "${deskProject}"`).replace(/^database_id = ".*"$/m, `database_id = "${dbId}"`);
  fs.writeFileSync(tomlFile, toml);
}
console.log(`   Content Desk  -> ${deskProject}\n   Static Engine -> ${engineProject}`);

// 4. Tables
say("Creating the tables (safe to repeat)");
change("Content Desk tables", ["d1", "execute", "silt_desk", "--remote", "--yes", `--file=${path.join(CF, "schema.sql")}`]);
change("Static Engine tables", ["d1", "execute", "silt_desk", "--remote", "--yes", `--file=${path.join(SE, "web", "schema.sql")}`]);

// 5. Pages projects
say("Cloudflare Pages projects");
for (const p of [deskProject, engineProject]) {
  try { change(`creating ${p}`, ["pages", "project", "create", p, "--production-branch", "main"]); }
  catch (e) {
    const msg = String(e.stderr || e.stdout || e.message);
    if (/already exists|8000002/i.test(msg)) console.log(`   ${p} already exists on your account, reusing it`);
    else fail(`Couldn't create ${p}: ${msg.trim().split("\n").slice(-3).join(" ")}\nIf the name is taken by someone else, run again with another --name.`);
  }
}

// 6. Secrets
say("Secrets (stored on Cloudflare, copies kept in files that are never committed)");
if (DRY) console.log("   [dry-run] Content Desk: DESK_PASSWORD + SESSION_SECRET (scripts/set-password.mjs)\n   [dry-run] Static Engine: RULES_KEY");
else {
  execFileSync(process.execPath, [path.join(CF, "scripts", "set-password.mjs")], { cwd: CF, stdio: "inherit" });
  const keyFile = path.join(SE, "web", "RULES_KEY.txt");
  // Reuse this copy's key on a re-run (first line of the file), else make a new one.
  const key = (fs.existsSync(keyFile) && fs.readFileSync(keyFile, "utf8").split(/\r?\n/)[0].trim()) || randomBytes(18).toString("base64url");
  wr(["pages", "secret", "put", "RULES_KEY", "--project-name", engineProject], { input: key });
  fs.writeFileSync(keyFile, key + "\n");
  console.log(`   Static Engine rules key saved to ${keyFile}`);
}

// 7. Build and deploy
say("Building and deploying");
const rendered = fs.existsSync(path.join(SE, "out")) ? fs.readdirSync(path.join(SE, "out")).filter(f => f.startsWith("SILT_") && f.endsWith(".png")).length : 0;
if (rendered < 120) {
  if (DRY) console.log("   [dry-run] node static-engine/render.mjs   (renders the built-in statics with Chrome, a few minutes)");
  else { console.log("   Rendering the built-in statics with Chrome (a few minutes)"); execFileSync(process.execPath, ["render.mjs"], { cwd: SE, stdio: "inherit" }); }
}
if (DRY) console.log("   [dry-run] node deploy.mjs desk\n   [dry-run] node deploy.mjs engine");
else for (const w of ["desk", "engine"]) execFileSync(process.execPath, [path.join(ROOT, "deploy.mjs"), w], { cwd: ROOT, stdio: "inherit" });

say("Done");
console.log(`   Content Desk:  https://${deskProject}.pages.dev   (password in cloudflare/TEAM_PASSWORD.txt; open to anyone while DESK_OPEN = "1" in cloudflare/wrangler.toml)
   Static Engine: https://${engineProject}.pages.dev   (rules key in static-engine/web/RULES_KEY.txt)
   Later deploys:  node deploy.mjs desk   |   node deploy.mjs engine`);
