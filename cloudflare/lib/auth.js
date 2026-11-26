// Shared-password sessions. The signing key is derived from SESSION_SECRET *and* DESK_PASSWORD,
// so changing the team password signs everyone out.
export const COOKIE = "__Host-silt_desk";
export const SESSION_DAYS = 30;

const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = s => {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
};

export function configured(env) {
  return Boolean(env.DESK_PASSWORD && env.SESSION_SECRET && env.DESK_PASSWORD.length >= 8 && env.SESSION_SECRET.length >= 32);
}

async function key(env) {
  const base = await crypto.subtle.importKey("raw", enc.encode(env.SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const derived = await crypto.subtle.sign("HMAC", base, enc.encode("v1:" + env.DESK_PASSWORD));
  return crypto.subtle.importKey("raw", derived, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function passwordMatches(given, env) {
  // Compare HMACs of both values so the check takes the same time whatever the input.
  const k = await key(env);
  const [a, b] = await Promise.all([
    crypto.subtle.sign("HMAC", k, enc.encode("pw:" + String(given || ""))),
    crypto.subtle.sign("HMAC", k, enc.encode("pw:" + env.DESK_PASSWORD)),
  ]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function makeSession(name, env) {
  const payload = b64u(enc.encode(JSON.stringify({ name, exp: Date.now() + SESSION_DAYS * 86400_000 })));
  const sig = b64u(await crypto.subtle.sign("HMAC", await key(env), enc.encode(payload)));
  return `${payload}.${sig}`;
}

// DESK_OPEN = "1" (wrangler.toml [vars]) turns the password off: everyone counts as signed in.
// Their name comes from the x-desk-name header the page sends (the name saved in the browser), else "Team".
function openSession(request, env) {
  if (env.DESK_OPEN !== "1") return null;
  let raw = request.headers.get("x-desk-name") || "";
  try { raw = decodeURIComponent(raw); } catch { raw = ""; }
  const name = String(raw).replace(/[^\p{L}\p{N} .'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 40);
  return { name: name || "Team", open: true };
}

export async function readSession(request, env) {
  const s = await readCookieSession(request, env);
  return s || openSession(request, env);
}

async function readCookieSession(request, env) {
  const m = (request.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return null;
  const [payload, sig] = m[1].split(".");
  if (!payload || !sig) return null;
  let ok = false;
  try { ok = await crypto.subtle.verify("HMAC", await key(env), fromB64u(sig), enc.encode(payload)); } catch { return null; }
  if (!ok) return null;
  try {
    const s = JSON.parse(new TextDecoder().decode(fromB64u(payload)));
    if (!s.exp || s.exp < Date.now() || !s.name) return null;
    return s;
  } catch { return null; }
}

export function sessionCookie(value, maxAgeSeconds) {
  return `${COOKIE}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}
