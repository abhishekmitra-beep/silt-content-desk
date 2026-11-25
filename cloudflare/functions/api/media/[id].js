// GET /api/media/<id> -> a generated image (behind the team login like everything in /api).
import { Buffer } from "node:buffer";

export async function onRequestGet({ env, params }) {
  const id = String(params.id || "");
  if (!/^m-[a-z0-9-]{3,40}$/.test(id)) return new Response("Bad id", { status: 400 });
  const row = await env.DB.prepare("SELECT mime, b64 FROM media WHERE id = ?").bind(id).first();
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(row.b64, "base64"), {
    headers: { "content-type": row.mime, "cache-control": "private, max-age=31536000, immutable", "content-disposition": `inline; filename="silt-${id}.${row.mime === "image/jpeg" ? "jpg" : row.mime === "image/png" ? "png" : "svg"}"` },
  });
}
