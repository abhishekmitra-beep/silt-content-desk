// Plate prompts for the 26 Nov batch (ChatGPT makes ONLY the clean scene; build/stamp/stamp.py stamps the words, icons, pack, price).
export const PAL = { nights: "deep midnight-navy to royal-blue tones, soft cool light", mornings: "golden-sunrise amber and apricot tones, warm soft light", combo: "warm amber on the left blending into navy on the right" };
export const BG = { nights: "midnight-navy background", mornings: "warm apricot background", combo: "amber-to-navy background" };
export const PERSON = " If a person is shown: a real-looking Indian man over 30, real skin with pores and fine lines, real hair, natural light, a real photograph.";
export function platePrompt(p, scene, bottom) {
  return `Make a clean background PLATE for a SILT ad: 9:16 vertical, exactly 1080x1920, a real photograph (85mm look, soft light), never CGI. SCENE: ${scene} Colours: ${PAL[p]}.${PERSON} Strictly NO text, letters, numbers, logos, icons, labels, price tags or UI anywhere (the only exception: writing printed on bottle labels when the scene says so), and NO product box, NO stick, NO glass or drink, NO packaging. COMPOSITION (strict): a WIDE shot with the subject SMALL in the frame. Everything of interest (the subject and its props) fits inside the band between 26% and 50% of the frame height, about a quarter of the frame height in total. The top 26% is calm, empty ${BG[p]} with nothing in it (a headline is added there afterwards). The bottom 50% is ${bottom || "calm, plain surface in the same colours"} with no objects, no bright spots and no clutter (the pack and prices are added afterwards). Give the 1080x1920 PNG.`;
}
export const SCENES = {
  1: ["nights", "A pair of plain unbranded over-ear headphones (no logo) resting folded with the cable neatly coiled, on a plain matte navy surface."],
  2: ["nights", "A closed plain navy hardcover notebook with a capped pen laid across it, on a plain matte navy surface."],
  3: ["nights", "A plain phone lying face down (screen hidden, no logo visible) on a plain matte navy surface."],
  4: ["nights", "A plain office ID lanyard with a blank card (no text, no logo) lying coiled on a plain matte navy surface."],
  5: ["nights", "A simple brass desk lamp, switched off, standing on a plain matte navy surface."],
  6: ["mornings", "A wooden spirit level with its bubble perfectly centred, lying on a plain matte warm-sand surface."],
  7: ["mornings", "A man in his late 30s at his office desk mid-afternoon, slumped and rubbing his tired eyes, three empty espresso cups and a closed laptop on the desk beside him."],
  8: ["mornings", "A man in his late 30s at his desk at three in the afternoon, calm, upright and focused, a plain wall clock behind him showing three o'clock, a laptop in front of him."],
  9: ["mornings", "A man in his 30s by a sunlit kitchen window in the morning, fresh and awake, rolling up his shirt sleeves before work."],
  10: ["mornings", "A man in his 30s at his front door in the morning, bag on his shoulder, alert and ready to leave."],
  11: ["nights", "A man in his late 30s seen from behind, hands on his head, facing a shelf of four plain white unbranded supplement bottles labelled only L-GLYCINE, MAGNESIUM BISGLYCINATE, ASHWAGANDHA and L-THEANINE (this is the only text allowed)."],
  12: ["mornings", "A man in his late 30s seen from behind, hands on his head, facing a shelf of ten plain white unbranded supplement bottles in two rows labelled only CAFFEINE, TAURINE, L-THEANINE, PREBIOTIC FIBRE, PROBIOTICS, DIGESTIVE HERBS, VITAMIN D3, VITAMIN K2, VITAMIN B12, VITAMIN C (this is the only text allowed)."],
  13: ["combo", "A man in his late 30s seen from behind, hands on his head, facing a crowded shelf of fourteen plain white unbranded supplement bottles with no readable labels."],
  14: ["nights", "A man in his late 30s sitting on the edge of his bed at night, tired, holding an open seven-day pill organiser, a soft lamp glowing beside him."],
  15: ["mornings", "A man in his late 30s standing at a bathroom shelf in the morning, relieved, the shelf almost empty."],
  21: ["nights", "A man in his late 30s in deep sleep in bed under a navy duvet, a completely expressionless face, soft night light."],
  22: ["nights", "A man in his late 30s sleeping deeply under a thick blanket, a completely expressionless face."],
  23: ["mornings", "A man in his 30s at the breakfast table in warm morning light, calm and alert, a closed laptop beside him."],
  24: ["combo", "The same man in his 30s twice, split down the middle: on the warm amber left, alert at his desk in morning light; on the navy right, asleep in bed at night with a completely expressionless face."],
  25: ["combo", "A man in his 30s at his kitchen counter in the evening, relaxed and smiling slightly."],
  26: ["nights", "A man in his late 30s lying awake in bed at 2 AM, staring at the ceiling, dim night light."],
  27: ["nights", "A man in his late 30s wrapped in a white duvet, yawning, tired."],
  29: ["mornings", "A man in his 30s at his desk between video calls, headset around his neck, alert and calm, the laptop screen dark."],
  30: ["mornings", "A man in his 30s sitting up in bed in the morning, refreshed, soft sunrise light."]
};
