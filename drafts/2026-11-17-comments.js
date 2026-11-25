// Comment bank for 2026-11-17: Reddit can't be read automatically today, so each comment answers a question
// that comes up often in that subreddit, and links to a newest-first Reddit search so the team can pick a fresh thread.
// Run: node drafts/2026-11-17-comments.js
const fs = require("fs");
const path = require("path");
const date = "2026-11-17";
// Newest-posts feed of the subreddit: only fresh posts, unlike search, which can surface years-old threads.
const search = (sub) => `https://www.reddit.com/r/${sub}/new/`;
const COMMON = "NON-NEGOTIABLE: reply only to a thread posted in the last 3 days (check the timestamp under the title). If nothing that recent fits, skip this comment and mark it Rejected with a note. Prefer threads with few comments, adapt the first line to what OP actually said, and add no links and no pitch.";

const comments = [
  {
    subreddit: "bangalore", q: "afternoon slump OR 3pm crash OR sleepy after lunch",
    thread_title: "Find a post from the last 3 days: always sleepy or crashing after lunch at work",
    thread_summary: "Look for someone asking why they crash at 3 PM, how to stay awake after lunch, or how many coffees is too many.",
    product: "mornings", angle: "Community help",
    text: "Lunch and caffeine timing are usually the culprits. A heavy lunch followed by back-to-back calls is a reliable recipe for a 3 PM crash. What helps most people: a lighter lunch with some protein, a 10 minute walk straight after, and the last coffee or chai before 2 PM. Caffeine has a half-life of around 5 hours, so a 4 PM cup is still about half there at 9 PM, which hurts sleep and makes tomorrow's slump worse.",
    why: "The 3 PM slump is the exact problem SILT Mornings is built for. Helping here builds credibility with our core audience without selling."
  },
  {
    subreddit: "developersIndia", q: "sleep late calls OR US shift sleep OR sleep schedule",
    thread_title: "Find a post from the last 3 days: sleep wrecked by late US calls or night shifts",
    thread_summary: "Look for devs asking how to fix their sleep with late calls, rotating shifts or a body clock that keeps moving.",
    product: "nights", angle: "Community help",
    text: "Late US calls make it hard to keep a steady wake time, and a steady wake time matters more than most people expect. If you can, fix the wake-up time even on days the call runs late, take a short nap (20 minutes, before 3 PM) instead of sleeping in, keep screens dim for the last half hour, and stop caffeine about 8 hours before you plan to sleep. Two or three weeks of a fixed wake time usually does more than any sleep hack.",
    why: "Late calls and broken sleep are daily pain for our audience. Practical, no-product advice earns upvotes."
  },
  {
    subreddit: "IndianFitness", q: "fibre intake OR fiber diet OR constipation diet",
    thread_title: "Find a post from the last 3 days: how to get enough fibre on an Indian diet",
    thread_summary: "Look for someone asking how much fibre they need, how to get it from Indian food, or why they feel bloated when they add it.",
    product: "mornings", angle: "Education",
    text: "Most of us eat around 12 g of fibre a day against a target of 25 to 30 g. With normal Indian food it's doable: a guava or pear is 5 to 6 g, a cup of cooked rajma or chana is around 10 to 12 g, a tablespoon of chia is about 5 g, and swapping white rice for millets or whole wheat adds a few grams a meal. Go up slowly, about 5 g a week, and drink more water, or the bloating will put you off it.",
    why: "Repurposes our best Instagram reel (the fibre gap) as genuine help."
  },
  {
    subreddit: "sleep", q: "magnesium glycinate",
    thread_title: "Find a post from the last 3 days: does magnesium glycinate actually help sleep?",
    thread_summary: "Look for someone asking whether magnesium works for sleep, which form to take, or how much.",
    product: "nights", angle: "Education",
    text: "A recent review of 12 trials found magnesium on its own isn't a reliable fix for insomnia, though glycinate showed a small benefit, and people who are actually low tend to notice more. If you try it, check the elemental magnesium on the label (a 1,000 mg magnesium glycinate tablet may only have around 140 mg elemental), take it an hour before bed, and give it 2 to 4 weeks. If sleep trouble has gone on for months, a doctor or CBT-I will do more than any supplement.",
    why: "Magnesium is the most asked sleep question right now. An honest, evidence-graded answer suits our brand.",
    extraRules: "r/sleep is strict about promotion. A brand account answering helpfully with no product mention is the only safe way."
  },
  {
    subreddit: "StartUpIndia", q: "D2C trust OR supplement brand OR customer trust",
    thread_title: "Find a post from the last 3 days: how do new D2C or health brands earn trust?",
    thread_summary: "Look for founders asking how to build trust or credibility for a new consumer brand, especially in health, food or wellness.",
    product: "brand", angle: "Founder insight",
    text: "From our side (we're a small supplement brand that launched last month): the thing that moved trust most was publishing everything. Every dose on the pack, no proprietary blends, and a lab report for each ingredient on the site. People do read them. One of the first questions we got on Instagram was for the exact IU of vitamin D3. It's slower and it costs more, but with ASCI finding 60 of 61 reviewed nutraceutical ads broke the code this year, being checkable is a real advantage for a new brand.",
    why: "Founder-to-founder subreddit where saying who we are is welcome, and the transparency story is our strongest."
  },
  {
    subreddit: "productivity", q: "caffeine crash OR coffee jitters OR caffeine focus",
    thread_title: "Find a post from the last 3 days: coffee gives me jitters and then a crash",
    thread_summary: "Look for someone asking how to get focus from caffeine without jitters, anxiety or a crash.",
    product: "mornings", angle: "Education",
    text: "Spacing helps most: a smaller cup earlier instead of one big one, and nothing after early afternoon. L-theanine is also worth reading about. It's an amino acid found in tea, and several studies pairing about 200 mg of it with 50 to 100 mg of caffeine reported smoother focus and fewer jitters than caffeine alone. The evidence is mixed, though: a 2026 crossover trial found no extra benefit. A cup of tea gives you a bit of both, which is a cheap way to see how you respond.",
    why: "Caffeine plus L-theanine is exactly what SILT Mornings uses, so an honest answer that includes the mixed evidence builds trust."
  },
  {
    subreddit: "IndiaCoffee", q: "caffeine chai OR how much caffeine OR filter coffee caffeine",
    thread_title: "Find a post from the last 3 days: how much caffeine is in chai vs filter coffee?",
    thread_summary: "Look for someone comparing chai, filter coffee and cafe drinks, or worried about how much caffeine they have a day.",
    product: "mornings", angle: "Education",
    text: "Rough numbers if it helps: a cup of Indian chai has about 30 to 50 mg of caffeine depending on how long it's boiled, a South Indian filter coffee roughly 60 to 100 mg, and a single-shot cappuccino about 60 to 75 mg. Most adults are fine up to around 400 mg a day, but for sleep the timing matters more than the total. Caffeine's half-life is around 5 hours, so the 5 PM chai is still with you at bedtime.",
    why: "Useful, numbers-first and very Indian, and it positions us as people who know caffeine well.",
    extraRules: "If r/IndiaCoffee is quiet, the same answer works in r/bangalore or r/india threads about chai and coffee."
  },
  {
    subreddit: "Nootropics", q: "glycine sleep",
    thread_title: "Find a post from the last 3 days: does glycine work for sleep, and how much?",
    thread_summary: "Look for someone asking about glycine dose, timing or whether it does anything for sleep.",
    product: "nights", angle: "Education",
    text: "The glycine-for-sleep studies mostly used 3 g taken about an hour before bed. The effects reported were modest but fairly consistent: falling asleep a bit faster and feeling less tired the next morning. It tastes slightly sweet and dissolves easily in water. Lower doses are common in blends, so check the label if you're trying to match what the research used.",
    why: "Glycine at 3 g is the core of SILT Nights. An accurate, no-pitch answer builds authority where buyers research.",
    extraRules: "r/Nootropics removes anything promotional. Keep it to the evidence and don't mention SILT unless someone asks."
  }
];

const xRules = sub => `${COMMON} Check the r/${sub} sidebar before commenting.`;
const out = comments.map((c, i) => {
  const { q, extraRules, ...rest } = c;
  return {
    date, platform: "reddit_comment", slot: i + 1, status: "pending", account: "u/Silt_Nutrition",
    ...rest, thread_url: search(c.subreddit), max_age_days: 3, format: "Comment bank (pick a post from the last 3 days)",
    rules: xRules(c.subreddit) + (extraRules ? " " + extraRules : "")
  };
});
const dir = path.join(__dirname, "posts");
for (const p of out) {
  const len = [...p.text].length;
  if (len > 1200 || /[—–]/.test(p.text)) throw new Error(`c${p.slot} fails checks (${len} chars)`);
  if (/\bI\b|\bI'm\b|\bmy\b/.test(p.text.replace(/CBT-I/g, ""))) throw new Error(`c${p.slot} is in first person; brand account must use "we"`);
  fs.writeFileSync(path.join(dir, `${date}_c${p.slot}.json`), JSON.stringify(p, null, 2));
  console.log(`c${p.slot} r/${p.subreddit} ${len} chars`);
}
