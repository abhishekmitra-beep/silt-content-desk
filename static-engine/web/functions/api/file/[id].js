// GET /api/file/<id> -> an uploaded finished static, exactly as it was uploaded. Add ?dl=1 to download it.
import { ensure } from "../_db.js";

export async function onRequestGet({ env, params, request }) {
  await ensure(env);
  const id = String(params.id || "");
  if (!/^F[0-9a-z]{6,24}$/.test(id)) return new Response("Not found", { status: 404 });
  const row = await env.DB.prepare("SELECT mime, name, data FROM se_files WHERE id = ?").bind(id).first();
  if (!row) return new Response("Not found", { status: 404 });
  const bytes = row.data instanceof ArrayBuffer ? new Uint8Array(row.data) : new Uint8Array(row.data);
  const headers = { "content-type": row.mime, "cache-control": "public, max-age=31536000, immutable" };
  if (new URL(request.url).searchParams.get("dl")) headers["content-disposition"] = `attachment; filename="${String(row.name || id).replace(/[^\w.\- ]/g, "_")}"`;
  return new Response(bytes, { headers });
}
