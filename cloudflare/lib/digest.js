// Turns one ad-teardown page (built by silt-ad-tools, with its data in `const D = {...}`) into a compact digest
// the content agent can read. Used by scripts/teardown-digest.mjs and, for pages it hasn't seen yet,
// by the site itself (/api/agent/digest), so a new brand's teardown is picked up whichever computer uploaded it.

const cut = (s, n) => { s = String(s ?? "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

// Pull the `const D = {...};` block out of the page and drop embedded images before parsing,
// which keeps the work small even for 3 MB pages.
export function extractData(html) {
  const start = html.indexOf("const D = ");
  if (start < 0) return null;
  const from = start + "const D = ".length;
  const end = html.indexOf("};\n", from);
  if (end < 0) return null;
  const raw = html.slice(from, end + 1).replace(/"data:[^"]*"/g, '""');
  return JSON.parse(raw);
}

export function digestFromData(D, page, updated) {
  const n = D.notes || {};
  return {
    brand: n.brand || page.replace(/^.*\/|\.html$/g, ""),
    page,
    pulled: D.generated,
    updated,
    account: cut(n.accountNote, 300),
    alert: n.alert ? { title: n.alert.title, text: cut((n.alert.paras || []).join(" "), 900) } : undefined,
    patterns: (n.patterns || []).map(p => ({ title: p.title, text: cut(p.text, 320) })),
    // Each brief is [product, hook, format, reference ads, outline] or an object with similar fields.
    ideas_for_silt: (n.briefs || []).map(b => Array.isArray(b)
      ? { product: b[0], hook: cut(b[1], 200), format: cut(b[2], 120), based_on: b[3], outline: cut(b[4], 420) }
      : typeof b === "string" ? cut(b, 420) : cut([b.title, b.hook, b.format, b.text, b.why].filter(Boolean).join(". "), 420)),
    top_videos: (D.videos || []).slice(0, 10).map(v => ({ days: v.days, versions: v.versions, style: v.style, product: v.product, hook: cut(v.hookLine, 160), why: cut(v.why, 260), transcript: cut(v.transcript, 320) })),
    top_statics: (D.statics || []).slice(0, 12).map(s => ({ days: s.days, versions: s.versions, product: s.product, copy: cut(s.copy, 160) })),
    top_concepts: (D.concepts || []).slice(0, 10).map(c => ({ days: c.longestDays, ads: c.ads, versions: c.metaVersions, types: c.types, copy: cut(c.copy, 180) })),
    totals: { ads: (D.catalog || []).length || undefined, statics: D.staticCount },
  };
}

// Shrinks brand digests so many brands together stay within a sensible prompt size.
export function fitBrands(brands, maxChars = 90000) {
  const levels = [[10, 12, 10, 320], [8, 8, 8, 220], [6, 6, 6, 140], [4, 4, 4, 0]];
  for (const [v, s, c, t] of levels) {
    const out = brands.map(b => ({
      ...b,
      top_videos: (b.top_videos || []).slice(0, v).map(x => ({ ...x, transcript: t ? cut(x.transcript, t) : undefined })),
      top_statics: (b.top_statics || []).slice(0, s),
      top_concepts: (b.top_concepts || []).slice(0, c),
    }));
    if (JSON.stringify(out).length <= maxChars) return out;
  }
  return brands.map(b => ({ brand: b.brand, page: b.page, pulled: b.pulled, alert: b.alert, patterns: b.patterns, ideas_for_silt: b.ideas_for_silt }));
}
