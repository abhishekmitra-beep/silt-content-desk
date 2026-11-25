// Knowing (not guessing) whether someone's Claude / ChatGPT is connected.
// Each browser has a short pairing code. The person tells their Claude (SILT skill) or the SILT GPT "connect SILT <code>";
// that AI calls POST /api/connect from wherever it runs, which proves it can reach the site. The page then reads
// GET /api/connect?code=<code> and shows exactly what is verified. The site page itself can't pair (that would be a guess).
//   GET  /api/connect?code=ABC234 -> { claude: iso|null, chatgpt: iso|null, team: { claude: iso|null, chatgpt: iso|null } }
//   POST /api/connect { code, client: "claude" | "chatgpt" }
import { ensure } from "./_db.js";

const OK = /^[A-Z2-9]{6}$/;
export const clientOf = (request, hint = "") => {
  const ua = request.headers.get("user-agent") || "", h = String(hint || request.headers.get("x-silt-client") || "").toLowerCase();
  if (h === "chatgpt" || /ChatGPT-User|OpenAI/i.test(ua)) return "chatgpt";
  if (h === "claude" || /Claude-User|ClaudeBot|Anthropic/i.test(ua)) return "claude";
  return "";
};

async function lastSeen(env) {
  const rows = (await env.DB.prepare("SELECT id, updated_at FROM se_items WHERE id IN ('S-claude', 'S-chatgpt') AND status != 'archived'").all()).results;
  const m = Object.fromEntries(rows.map(r => [r.id.slice(2), r.updated_at]));
  return { claude: m.claude || null, chatgpt: m.chatgpt || null };
}

export async function onRequestGet({ request, env }) {
  await ensure(env);
  const code = String(new URL(request.url).searchParams.get("code") || "").toUpperCase();
  const team = await lastSeen(env);
  if (!OK.test(code)) return Response.json({ claude: null, chatgpt: null, team });
  const row = await env.DB.prepare("SELECT doc FROM se_items WHERE id = ?").bind("C-" + code).first();
  const d = row ? JSON.parse(row.doc) : {};
  return Response.json({ claude: d.claude || null, chatgpt: d.chatgpt || null, team });
}

export async function onRequestPost({ request, env, data }) {
  await ensure(env);
  if (data.actor === "team") return Response.json({ error: "Pairing has to come from your Claude or ChatGPT, not from the site." }, { status: 403 });
  let body = {}; try { body = await request.json(); } catch {}
  const code = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!OK.test(code)) return Response.json({ error: "That isn't a SILT code. It's 6 letters and numbers, shown in the Connect window on the site." }, { status: 400 });
  const client = clientOf(request, body.client);
  if (!client) return Response.json({ error: "Say which AI this is: client \"claude\" or \"chatgpt\"." }, { status: 400 });
  const now = new Date().toISOString(), id = "C-" + code;
  const row = await env.DB.prepare("SELECT doc FROM se_items WHERE id = ?").bind(id).first();
  const doc = { ...(row ? JSON.parse(row.doc) : {}), [client]: now, [client + "_by"]: data.name || "" };
  await env.DB.prepare(`INSERT INTO se_items (id, kind, doc, status, created_by, updated_by, created_at, updated_at) VALUES (?, 'visitor', ?, 'active', ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET doc = excluded.doc, updated_by = excluded.updated_by, updated_at = excluded.updated_at`).bind(id, JSON.stringify(doc), client, client, now, now).run();
  return Response.json({ ok: true, connected: client, message: `Connected. The SILT Static Engine now shows ${client === "claude" ? "Claude" : "ChatGPT"} as connected in that browser.` });
}
