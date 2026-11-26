// Today's inspiration from the Ad teardowns: three picks a day, each from a different brand, the same for everyone that
// day (the site's Ideas tab and Claude's /api/queue show the same three). Keeps the idea, never the competitor's words.
import { TEARDOWNS } from "./teardowns.js";

const RELEVANT = /sleep|night|magnes|glycine|theanine|ashwagandha|stress|calm|energy|caffeine|3 ?pm|morning|gut|fib(re|er)|stack|bottle|cabinet|routine|ritual|proof|lab|dose/i;

export function inspirationFor(date = new Date().toISOString().slice(0, 10), n = 3) {
  const day = Math.floor(Date.parse(date + "T00:00:00Z") / 86400000);
  const brands = TEARDOWNS.filter(b => b.patterns.length || b.ideas.length);
  const out = [];
  for (let k = 0; out.length < n && k < brands.length; k++) {
    const b = brands[(day * 2 + k * 3) % brands.length];
    if (out.some(o => o.brand === b.brand)) continue;
    const items = [
      ...b.ideas.map(i => ({ kind: "idea", brand: b.brand, product: i.product, title: i.hook, text: i.outline, format: i.format })),
      ...b.patterns.map(p => ({ kind: "pattern", brand: b.brand, product: "", title: p.title, text: p.text, format: "" }))
    ].sort((x, y) => RELEVANT.test(y.title + y.text) - RELEVANT.test(x.title + x.text));
    if (items.length) out.push(items[day % Math.min(items.length, 6)]);
  }
  return out;
}

export const inspirationIdea = i => `Inspired by ${i.brand} (Ad teardowns): "${i.title}". ${String(i.text || "").replace(/\s+/g, " ").slice(0, 240)} Keep only the idea; rebuild it the SILT way (house rules, our own copy and facts, never their words).`;
