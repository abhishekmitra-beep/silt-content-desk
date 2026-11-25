// Plain-text version of a reel script, shown in the editable box on the Agent tab.
// Shared by the site and scripts/reel-scripts.mjs.
export function scriptText(sc) {
  const lines = [`HOOK: ${sc.hook || ""}`, `LENGTH: about ${sc.length_s || "?"} s`, ""];
  for (const x of sc.scenes || []) {
    lines.push(`[${x.time}] ${x.visual}`);
    if (x.voiceover) lines.push(`  VO: ${x.voiceover}`);
    if (x.on_screen) lines.push(`  ON SCREEN: ${x.on_screen}`);
    if (x.sfx) lines.push(`  SFX: ${x.sfx}`);
  }
  lines.push("", "CAPTION:", sc.caption || "");
  if ((sc.checks || []).length) lines.push("", "CHECK BEFORE POSTING:", ...sc.checks.map(c => `- ${c}`));
  return lines.join("\n");
}
