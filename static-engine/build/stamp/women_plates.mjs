// Team, 26 Nov: 25% of SILT buyers are women -> women persona statics. Plate prompts for ChatGPT (clean scene only) + stamp spec.
import fs from "node:fs"; import { platePrompt, PERSON } from "./plates.mjs";
export const W = [
  { k: "w1", p: "nights", h: "Inbox zero. *MIND NOT YET.*", s: "A woman founder in her mid-30s sitting at a home desk late at night, laptop lid closed, one hand rubbing the back of her neck, one warm desk lamp glowing, dark room around her." },
  { k: "w2", p: "nights", h: "Shift's over. *NOW SLEEP.*", s: "A woman doctor in her early 30s in plain scrubs sitting on the edge of her bed at night, a stethoscope around her neck, tired shoulders, one soft bedside lamp glowing." },
  { k: "w3", p: "nights", h: "Kids asleep. *YOUR TURN.*", s: "A woman in her mid-30s sitting on a sofa in a dim living room at night, a basket of folded laundry beside her, head resting back, finally still, one soft lamp glowing." },
  { k: "w4", p: "nights", h: "Switch off. *SLEEP DEEP.*", s: "A woman in her early 30s in deep sleep in bed under a navy duvet, seen in profile on a pillow, a completely expressionless face, soft night light." },
  { k: "w5", p: "mornings", h: "School run. *STILL STEADY.*", s: "A woman in her mid-30s in a bright kitchen in the morning, packing a school bag on the counter, calm and alert, morning light from a window." },
  { k: "w6", p: "mornings", h: "New job. *NEW ROUTINE.*", s: "A woman in her mid-20s at the window of a small rented room in the morning, a laptop bag on her shoulder, ready to leave, fresh and calm, warm sunrise light." },
  { k: "w7", p: "mornings", h: "Thirty students. *ONE STEADY MORNING.*", s: "A woman teacher in her early 40s in a plain cotton saree standing at a classroom desk before the first period, a stack of notebooks in front of her, calm and alert, a blank green board behind her." },
  { k: "w8", p: "mornings", h: "Flight at six. *STEADY START.*", s: "A woman consultant in her early 30s at an airport gate in the early morning, a cabin bag beside her, a laptop bag on her shoulder, calm and alert, soft sunrise light through a big window." },
];
const WOMAN = " The person is a real-looking Indian woman, adult, real skin with pores and fine lines, real hair, natural light, a real photograph; dressed modestly and professionally, never stereotyped or glamorised.";
export const prompt = w => platePrompt(w.p, w.s).replace(PERSON, WOMAN);
if (process.argv[2] === "dump") fs.writeFileSync(process.argv[3], JSON.stringify(W.map(w => ({ ...w, prompt: prompt(w) })), null, 1));
