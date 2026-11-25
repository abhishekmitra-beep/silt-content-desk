// POST /api/upload -> publish finished statics AS THEY ARE (no AI, no re-rendering). Each upload is one static that
// can have up to 3 sizes (4:5, 1:1, 9:16). It goes to the Approval tab like everything else.
//
// JSON:      { title, funnel, product, concept?, files: [{ name, mime, w, h, data: "<base64>" }] }
// Multipart: fields title, funnel, product, concept + one or more "file" parts (sizes read from the image header)
//   curl -X POST https://silt-static-engine.pages.dev/api/upload -H "x-silt-name: Abhishek" \
//        -F title="Pillow not office" -F funnel=TOFU -F product=nights -F file=@a_4x5.png -F file=@a_9x16.png
import { ensure } from "./_db.js";

const MAX_FILE = 1_900_000, FUNNELS = ["TOFU", "MOFU", "BOFU", "RET"], PRODUCTS = ["mornings", "nights", "combo"];
const rid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Width and height from PNG / JPEG / WEBP bytes (so curl uploads don't need to send them).
function dims(b) {
  if (b[0] === 0x89 && b[1] === 0x50) return { w: (b[16] << 24 | b[17] << 16 | b[18] << 8 | b[19]) >>> 0, h: (b[20] << 24 | b[21] << 16 | b[22] << 8 | b[23]) >>> 0 };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = b[i + 2] << 8 | b[i + 3];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b[i + 5] << 8 | b[i + 6], w: b[i + 7] << 8 | b[i + 8] };
      i += 2 + len;
    }
  }
  if (b[8] === 0x57 && b[9] === 0x45 && b[12] === 0x56 && b[15] === 0x38) {
    if (b[15] === 0x38 && b[14] === 0x50 && b[13] === 0x56 && b[15] === 0x38 && String.fromCharCode(b[15]) === "8" && b[12] === 0x56 && String.fromCharCode(b[12], b[13], b[14], b[15]) === "VP8X") return { w: 1 + (b[24] | b[25] << 8 | b[26] << 16), h: 1 + (b[27] | b[28] << 8 | b[29] << 16) };
  }
  return { w: 0, h: 0 };
}
function ratioKey(w, h) {
  if (!w || !h) return "other";
  const r = w / h;
  if (Math.abs(r - 0.8) < 0.03) return "4x5";
  if (Math.abs(r - 1) < 0.03) return "1x1";
  if (Math.abs(r - 0.5625) < 0.03) return "9x16";
  return r < 1 ? "portrait" : "landscape";
}

export async function onRequestPost({ request, env, data }) {
  await ensure(env);
  const who = data.name || "team", now = new Date().toISOString();
  let meta = {}, files = [];
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("multipart/form-data")) {
      const fd = await request.formData();
      for (const k of ["title", "funnel", "product", "concept"]) meta[k] = fd.get(k) || "";
      for (const f of fd.getAll("file")) if (f && typeof f.arrayBuffer === "function") files.push({ name: f.name, mime: f.type || "image/png", bytes: new Uint8Array(await f.arrayBuffer()) });
    } else {
      const body = await request.json();
      meta = body;
      for (const f of body.files || []) files.push({ name: f.name, mime: f.mime || "image/png", bytes: Uint8Array.from(atob(String(f.data || "")), c => c.charCodeAt(0)), w: f.w, h: f.h });
    }
  } catch { return Response.json({ error: "Couldn't read the upload." }, { status: 400 }); }
  if (!files.length) return Response.json({ error: "Add at least one image." }, { status: 400 });
  if (files.length > 3) return Response.json({ error: "One static takes at most 3 files (4:5, 1:1, 9:16). Upload the others as separate statics." }, { status: 400 });

  const doc = {
    title: String(meta.title || files[0].name || "Uploaded static").replace(/\.(png|jpe?g|webp)$/i, "").slice(0, 120),
    funnel: FUNNELS.includes(meta.funnel) ? meta.funnel : "TOFU",
    product: PRODUCTS.includes(String(meta.product || "").toLowerCase()) ? String(meta.product).toLowerCase() : "nights",
    concept: String(meta.concept || "Uploaded").slice(0, 50),
    files: {}, names: {}
  };
  for (const f of files) {
    if (!/^image\/(png|jpeg|webp)$/.test(f.mime)) return Response.json({ error: `${f.name}: only PNG, JPG or WEBP.` }, { status: 400 });
    if (f.bytes.length > MAX_FILE) return Response.json({ error: `${f.name} is ${(f.bytes.length / 1e6).toFixed(1)} MB; the limit is 1.9 MB per image (save it as JPG).` }, { status: 413 });
    const d = f.w && f.h ? { w: f.w, h: f.h } : dims(f.bytes);
    let key = ratioKey(d.w, d.h);
    if (doc.files[key]) key = key + "-" + Object.keys(doc.files).length;
    const fid = rid("F");
    await env.DB.prepare("INSERT INTO se_files (id, mime, w, h, size, name, data, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(fid, f.mime, d.w || null, d.h || null, f.bytes.length, String(f.name || fid).slice(0, 120), f.bytes, who, now).run();
    doc.files[key] = fid; doc.names[key] = String(f.name || fid).slice(0, 120);
  }
  const id = rid("U"); doc.id = id;
  await env.DB.prepare("INSERT INTO se_items (id, kind, doc, status, created_by, updated_by, created_at, updated_at) VALUES (?, 'upload', ?, 'approval', ?, ?, ?, ?)")
    .bind(id, JSON.stringify(doc), who, who, now, now).run();
  return Response.json({ id, kind: "upload", doc, status: "approval", created_by: who, updated_by: who, updated_at: now });
}
