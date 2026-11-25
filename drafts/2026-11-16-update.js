// Update for 2026-11-16: Reddit opens with 3 introduction posts, the earlier discussion posts move to r4..r7,
// the earlier r/StartUpIndia "lessons" post is folded into the r/StartUpIndia intro, and X gets 3 more posts (x6..x8).
// Run: node drafts/2026-11-16-update.js
const fs = require("fs");
const path = require("path");
const date = "2026-11-16";
const dir = path.join(__dirname, "posts");
const read = id => JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8"));

// Keep the originals once, so this script can be re-run safely.
const orig = path.join(__dirname, "posts-original-2026-11-16");
if (!fs.existsSync(orig)) {
  fs.mkdirSync(orig);
  for (const f of fs.readdirSync(dir).filter(f => f.startsWith(date))) fs.copyFileSync(path.join(dir, f), path.join(orig, f));
}
const old = id => JSON.parse(fs.readFileSync(path.join(orig, `${id}.json`), "utf8"));

const LATER = "Post after the introductions, one per day through the week. A brand-new account with little karma gets auto-removed in most subs, so comment helpfully in the sub for a few days first.";

const intros = [
  {
    subreddit: "StartUpIndia", flair: "Feedback", product: "brand", angle: "Introduction", format: "Founder introduction",
    trend: "First Reddit post: introduce the founder and the brand to Indian founders and ask for feedback",
    why: "Founder posts asking for honest feedback are welcome here. It gives SILT a credible first footprint on Reddit.",
    rules: "Founder introductions asking for feedback are usually allowed. Don't post a store link or discount code in the post. Check the sidebar for a weekly promotion thread or the right flair, and say you're the founder.",
    source: "https://www.reddit.com/r/StartUpIndia/",
    title: "I left 10+ years of corporate to build a two-drink wellness routine for busy professionals. We launched 3 weeks ago. Would love your honest feedback.",
    text: "Hi r/StartUpIndia, I'm Abhishek, founder of SILT Nutrition. Posting from my personal account, so full disclosure that this is my company.\n\nThe problem I kept living through in corporate was a 3 PM crash in the day and a mind that wouldn't switch off at night. The fix people suggested was always another jar, and I ended up with a shelf of supplements I couldn't stick to.\n\nSo we built two drink mixes in stick packs. Mornings has 80 mg caffeine with 200 mg L-theanine, 5 g fibre, probiotics, and D3, K2, B12 and C. Nights has 3 g glycine, 250 mg magnesium bisglycinate, 300 mg ashwagandha and 200 mg L-theanine. Every dose is printed on the pack, there are no proprietary blends, and we publish a lab report for each of the 19 ingredients (293 checks so far, none failed).\n\nWhere we are: 1,870 pre-bookings before launch, then 250 customers and 10 repeat orders in the first 15 days, and 4.9 out of 5 on verified reviews. Price works out to about ₹60 a day per drink.\n\nWhat I'd really value from this sub:\n\n1. Does ₹60 a day feel fair for a daily drink like this, or is that the wrong way to frame price?\n2. We sell on our own site today. For a habit product, would you push into quick commerce early or wait?\n3. Publishing lab reports has helped trust so far. What else would make you believe a new supplement brand?\n\nHappy to answer anything, including the parts that aren't working yet."
  },
  {
    subreddit: "AMA", flair: "", product: "brand", angle: "Introduction", format: "AMA",
    trend: "AMA introduction: founder answers questions on ingredients, doses and building a supplement brand in India",
    why: "An AMA lets people ask the hard questions. Answering them openly is the transparency story told live.",
    rules: "r/AMA allows personal AMAs. Don't put a store link in the post. Block 2 to 3 hours to answer comments as they come in. Don't give medical advice; point people to a doctor.",
    source: "https://www.reddit.com/r/AMA/",
    title: "I spent 10+ years in corporate fighting 3 PM crashes and bad sleep, then built a supplement brand that publishes a lab report for every ingredient. AMA",
    text: "Hi Reddit. I'm Abhishek, I live in India, and three weeks ago I launched SILT Nutrition, two drink mixes for busy people. One is for the morning (steady energy, gut, daily vitamins) and one is for the night (sleep and recovery).\n\nYou can ask me why we settled on 80 mg caffeine with 200 mg L-theanine for the morning, why SILT Nights has no melatonin, or what a lab report (COA) actually tells you and what it leaves out. I'm also happy to talk about what it takes to launch a supplement brand in India, from FSSAI labelling to finding a manufacturer, and about what I got wrong in the first three weeks.\n\nWhat I won't do is give medical advice. SILT isn't meant to treat insomnia, deficiencies or any condition, and if that's what you're dealing with, a doctor is the right person.\n\nI'll be here for the next few hours answering everything, including the skeptical questions."
  },
  {
    subreddit: "SILTNutrition", flair: "Announcement", product: "both", angle: "Introduction", format: "Community welcome (pin it)",
    trend: "Start the brand's own subreddit so search and Reddit answers have an official place to land",
    why: "Our own community is the one place on Reddit where we can talk about the product openly, link the lab reports and handle support.",
    rules: "Create r/SILTNutrition from the founder account first (check the name is free), then pin this post. Links to our own site are fine here. Keep the tone the same as everywhere else, with no hard selling.",
    source: "https://siltnutrition.com",
    title: "Welcome to r/SILTNutrition: who we are, what's in every stick, and how to reach us",
    text: "Hi, I'm Abhishek, founder of SILT Nutrition. This is our official community. Ask questions here, share honest reviews (the bad ones too), and get answers from the team directly.\n\nWhat SILT is: two drink mixes in stick packs for busy professionals. Sixty seconds, twice a day.\n\nSILT Mornings (Lemon Orange): 80 mg caffeine + 200 mg L-theanine for steady energy, 5 g PHGG fibre + 6 billion probiotics for gut health, and D3, K2, B12 and C at 100% RDA.\n\nSILT Nights (Chamomile Lemon): 3 g glycine for falling asleep, 250 mg magnesium from bisglycinate for recovery, 300 mg KSM-66 ashwagandha root + 200 mg L-theanine for stress.\n\nNo added sugar, no proprietary blends, every dose on the pack. Each of the 19 ingredients has a lab report you can read on siltnutrition.com.\n\nWho should check with a doctor first: if you're pregnant or nursing, on regular medication, have a medical condition, or are sensitive to caffeine. SILT isn't meant to treat insomnia, deficiencies or any disease.\n\nHow this sub works: be honest, be kind, and no medical advice. I read everything posted here, and we aim to reply within a day.\n\nTo start us off: what made you curious about SILT, and what would you like us to explain better?"
  }
];

const reddit = [
  ...intros,
  { ...old(`${date}_r1`), rules: old(`${date}_r1`).rules + " " + LATER },
  { ...old(`${date}_r2`), rules: old(`${date}_r2`).rules + " " + LATER },
  { ...old(`${date}_r3`), rules: old(`${date}_r3`).rules + " " + LATER },
  { ...old(`${date}_r5`), rules: old(`${date}_r5`).rules + " " + LATER },
].map((p, i) => ({ ...p, date, platform: "reddit", slot: i + 1, status: "pending" }));

const xExtra = [
  {
    product: "brand", angle: "Introduction", format: "Pinned post",
    trend: "First X introduction: who we are and what we make",
    why: "Pin this so anyone who lands on the profile from a reply knows what SILT is.",
    source: "https://siltnutrition.com",
    text: "Hi X. I'm Abhishek, founder of SILT.\n\nAfter 10+ years in corporate I wanted steady energy without the 3 PM crash, and a mind that switches off at night. So we made two drink mixes, Mornings and Nights, with every dose printed on the pack.\n\nAsk me anything about what's inside."
  },
  {
    product: "both", angle: "Transparency", format: "Single post",
    trend: "Lab-test culture in India (Trustified, Blacklisted) and FSSAI label checks",
    why: "Receipts are our sharpest message, and lab testing is a live conversation in Indian supplements.",
    source: "https://www.trustified.in/passandfail/totalnutrition",
    text: "293 lab checks across 19 ingredients. 0 failed.\n\nWe publish every report so you never have to take our word for it.\n\nIf you've never read a COA for something you swallow daily, start with ours. Reply with any line that doesn't make sense and I'll explain it."
  },
  {
    product: "nights", angle: "Education", format: "Single post",
    trend: "Melatonin under review in the EU; AASM advises against it for chronic insomnia in adults",
    why: "A clear 'why we left it out' answers a question every sleep-product buyer has.",
    source: "https://www.nutraingredients.com/Article/2026/11/06/regulatory-review-probiotic-cfu-limits-removal-andrographis-recall-and-more/",
    text: "Why there's no melatonin in SILT Nights.\n\nUS sleep doctors (AASM) advise against it for chronic insomnia in adults, and the EU is still reviewing it. We wanted something you can take every night, so we built around 3 g glycine, magnesium bisglycinate, ashwagandha and L-theanine."
  }
].map((p, i) => ({ ...p, date, platform: "x", slot: 6 + i, status: "pending" }));

const xlen = t => [...t.replace(/https?:\/\/\S+/g, "x".repeat(23))].reduce((n, c) => { const p = c.codePointAt(0); return n + ((p <= 4351 || (p >= 8192 && p <= 8205) || (p >= 8208 && p <= 8223) || (p >= 8242 && p <= 8247)) ? 1 : 2); }, 0);
xExtra.forEach(p => console.log(`x${p.slot}`, xlen(p.text)));
const all = [...reddit, ...xExtra];
const bad = all.filter(p => /[—–]/.test(p.text + (p.title || "")));
console.log("dashes:", bad.map(p => p.platform + p.slot));
for (const p of reddit) fs.writeFileSync(path.join(dir, `${date}_r${p.slot}.json`), JSON.stringify(p, null, 2));
for (const p of xExtra) fs.writeFileSync(path.join(dir, `${date}_x${p.slot}.json`), JSON.stringify(p, null, 2));
console.log("reddit:", reddit.map(p => `r${p.slot} r/${p.subreddit}`).join(", "));
