// Drafts for Tuesday 2026-11-24. Written by the 6 PM run on 23 Nov.
// Run: node drafts/2026-11-24.js
const fs = require("fs");
const path = require("path");
const date = "2026-11-24";
const dir = path.join(__dirname, "posts");
const newFeed = sub => `https://www.reddit.com/r/${sub}/new/`;
const COMMON = "NON-NEGOTIABLE: reply only to a thread posted in the last 3 days (check the timestamp under the title). If nothing that recent fits, skip this comment and mark it Rejected with a note. Prefer threads with few comments, adapt the first line to what OP actually said, and add no links and no pitch.";

const x = [
  {
    product: "nights", angle: "Education (Nights trend)", format: "Single post",
    trend: "Late dinners and sleep: dinner-to-bed time and reflux (case-control study)",
    why: "Indian office dinners often land at 10 PM. Uses the approved shape: a named study, one hard number, one honest caveat. No product.",
    source: "https://pubmed.ncbi.nlm.nih.gov/16393212/",
    text: "In a Japanese study, people who went to bed within 3 hours of dinner had about 7 times the odds of acid reflux of those who waited 4 hours or more.\n\nIt's self-reported and observational. Still, if dinner is at 10:30 and bed at 11, moving one of them is worth a try."
  },
  {
    product: "mornings", angle: "Ingredient (Mornings)", format: "Single post",
    trend: "Fibre keeps trending in trade press; PHGG is the fibre in SILT Mornings",
    why: "Product post 1 of 2 allowed. Dose honesty: the trial used 6 g, we use 5 g, and we say so.",
    source: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4744437/",
    text: "Why PHGG for the fibre in SILT Mornings? It dissolves thin in water instead of turning to sludge, and it ferments more slowly than inulin in lab tests.\n\nIn one IBS trial, 6 g a day improved bloating scores over 12 weeks. A small trial, and our stick has 5 g, a bit under that."
  },
  {
    product: "brand", angle: "Transparency / regulation", format: "Single post",
    trend: "ASCI 'A Pill for Thought' follow-up coverage: most violations are in digital media and sponsored social posts",
    why: "A fresh angle on the ASCI story (20 Nov covered the 60 of 61 finding). Points people at where misleading claims actually show up. Verify the 94% and 68% figures in the source before posting.",
    source: "https://www.medianama.com/2026/10/223-asci-flags-60-misleading-nutraceutical-ads/",
    text: "ASCI's data: 94% of the ad violations it found in 2024-25 were in digital media, and 68% of the flagged digital ads were sponsored social posts.\n\nSo the claim most likely to mislead you is in your feed. One question filters most of it: what dose, and where's the report?"
  },
  {
    product: "brand", angle: "Social proof", format: "Single post",
    trend: "Four weeks since launch",
    why: "Social-proof slot. Uses only published numbers and ends on a real question, which can surface feedback.",
    source: "https://siltnutrition.com",
    text: "10 of our first 250 customers reordered within 15 days of launch. We watch that number more closely than our 4.9 star average, because a reorder is someone paying twice.\n\nIf you've tried SILT, what would make you reorder, or stop you?"
  },
  {
    product: "education", angle: "Pure education", format: "Single post",
    trend: "'I'm fine on 6 hours' (classic sleep restriction trial)",
    why: "Pure education with no product, and a classic, well-cited finding that our desk-worker audience needs to hear.",
    source: "https://pubmed.ncbi.nlm.nih.gov/12683469/",
    text: "In a classic trial, adults kept to 6 hours of sleep a night for two weeks slid to attention scores close to a night without sleep.\n\nThe catch: they rated themselves only a little sleepy. Feeling fine on 6 hours and performing fine on 6 hours are different things."
  }
].map((p, i) => ({ ...p, date, platform: "x", slot: i + 1, status: "pending" }));

const comments = [
  {
    subreddit: "sleep",
    thread_title: "Find a post from the last 3 days: what temperature should my bedroom be? Fan, AC or blanket?",
    thread_summary: "Look for someone who sleeps badly in a hot room, or asks about AC settings and sleep.",
    product: "nights", angle: "Education",
    text: "Cooler than most people keep it. Your core temperature has to drop a little for you to fall asleep and stay asleep, so a warm room works against you. Sleep researchers usually suggest somewhere around 18 to 20 C, which isn't realistic in a lot of Indian homes, so aim for the coolest you can manage with a fan or AC on a timer, light cotton bedding, and a warm shower an hour before bed, which helps your body shed heat afterwards.",
    why: "Bedroom heat and AC settings come up constantly on r/sleep, and it's practical, safe advice.",
    extraRules: "r/sleep is strict about promotion. Never mention SILT here unless someone asks directly."
  },
  {
    subreddit: "IndianFitness",
    thread_title: "Find a post from the last 3 days: how much does sleep matter for muscle gain or fat loss?",
    thread_summary: "Look for someone training hard on little sleep, or asking whether sleep affects gains or a cut.",
    product: "nights", angle: "Education",
    text: "More than most people expect. In one well-known study, people on the same calorie deficit lost a much bigger share of muscle instead of fat when they slept 5.5 hours a night instead of 8.5. Short sleep also pushes up hunger, which makes a cut harder to stick to. If you're cutting, treat 7 to 8 hours as part of the plan, the same way you track protein.",
    why: "Recurring question in this sub and a strong, specific study finding with no product angle."
  },
  {
    subreddit: "Fitness_India",
    thread_title: "Find a post from the last 3 days: is it okay to take isabgol (psyllium) every day?",
    thread_summary: "Look for someone asking about daily isabgol, how much to take, or bloating from fibre.",
    product: "mornings", angle: "Education",
    text: "For most people, yes. Isabgol is one of the better-studied fibres. Start small, around a teaspoon, and build up over a week or two, because jumping straight to a big dose is what causes the bloating people complain about. Take it with a full glass of water, and keep it a couple of hours away from any medicines, since it can slow how they're absorbed. Dal, rajma, fruit and whole grains still count, so it works best as a top-up rather than your only fibre.",
    why: "Isabgol is the most common fibre question in Indian fitness subs. Different from the 17 Nov fibre-on-Indian-diet comment.",
    extraRules: "Touches on medicines. Keep the 'away from medicines' line, and don't mention SILT."
  },
  {
    subreddit: "developersIndia",
    thread_title: "Find a post from the last 3 days: WFH and never leave the house, my sleep and energy are all over the place",
    thread_summary: "Look for a remote worker who feels groggy, sleeps late, or has no routine since working from home.",
    product: "mornings", angle: "Education",
    text: "Losing the commute often means losing your morning daylight, and that light is the main signal that sets your body clock. Without it, sleep drifts later and mornings feel heavier. A 10 to 15 minute walk outside within an hour of waking does a lot of what the commute used to do. Keep a fixed start time and a fixed log-off time too, because WFH days without edges tend to run into the night.",
    why: "WFH routines are a recurring thread in this sub. Different from the 17 Nov late-calls and 18 Nov burnout comments."
  },
  {
    subreddit: "IndiaCoffee",
    thread_title: "Find a post from the last 3 days: how late can I drink coffee without it ruining my sleep?",
    thread_summary: "Look for someone who drinks evening coffee and sleeps badly, or asks for a coffee cut-off time.",
    product: "mornings", angle: "Education",
    text: "Earlier than most people think. Caffeine's half-life is around 5 hours for an average adult, so half of a 4 PM coffee is still in you at 9. In one sleep-lab study, a large dose taken even 6 hours before bed cut total sleep by more than an hour, and people didn't notice it. A good rule is no caffeine in the 8 hours before bed, and if you're a slow metaboliser, push it to lunchtime.",
    why: "Coffee cut-off time is a top recurring question among coffee lovers. Not used in the last 5 days (18 Nov was the wait-after-waking question)."
  },
  {
    subreddit: "productivity",
    thread_title: "Find a post from the last 3 days: what's the best time of day for deep work?",
    thread_summary: "Look for someone asking when to schedule focused work, or who can't focus after lunch.",
    product: "mornings", angle: "Education",
    text: "For most people it's the late morning, roughly 2 to 4 hours after waking, when alertness is climbing and the day's meetings haven't started. Night owls peak later, so test it: rate your focus every hour for a week and look for the pattern. Whatever your window is, guard one 90-minute block in it and put email and calls in the early-afternoon dip, when deep work is hardest anyway.",
    why: "Scheduling deep work is a weekly question in r/productivity, and the advice ties into our 3 PM slump theme without a pitch."
  },
  {
    subreddit: "StartUpIndia",
    thread_title: "Find a post from the last 3 days: how did you decide the price for your D2C product?",
    thread_summary: "Look for a founder asking how to price a consumer product, or whether they're too expensive.",
    product: "brand", angle: "Founder insight",
    text: "We make a wellness drink mix, and what helped us was pricing per day, not per pack. Rs 900 for 15 sticks sounds like a lot until you say it's about Rs 60 a day, and then the comparison becomes what it replaces in someone's routine. We also didn't try to be the cheapest, because there are always cheaper options. Pre-bookings told us whether the price held up before we'd made a box: 1,870 people booked at the real price. Test with your real price, never a discount.",
    why: "Founder-to-founder sub where saying who we are is fine. Different from earlier founder comments (validation, first 100 customers, trust, legal launch).",
    extraRules: "Founder-friendly subreddit: it's fine to say who we are once, but don't link."
  },
  {
    subreddit: "GetMotivated",
    thread_title: "Find a post from the last 3 days: how do I stop hitting snooze every morning?",
    thread_summary: "Look for someone who snoozes for half an hour, or can't get out of bed on time.",
    product: "nights", angle: "Education",
    text: "Snoozing usually gives you broken, light sleep that leaves you groggier than getting up at the first alarm. Two things help most. Put the alarm across the room so you have to stand up, and open a curtain or step outside straight away, since light is what shuts off the sleepy feeling. If you still need four alarms, it usually means you need an earlier bedtime rather than more willpower.",
    why: "A perennial r/GetMotivated question. Practical, habit-based answer with no product."
  }
].map((c, i) => {
  const { extraRules, ...rest } = c;
  return {
    date, platform: "reddit_comment", slot: i + 1, status: "pending", account: "u/Silt_Nutrition",
    ...rest, thread_url: newFeed(c.subreddit), max_age_days: 3, format: "Comment bank (pick a post from the last 3 days)",
    rules: `${COMMON} Check the r/${c.subreddit} sidebar before commenting.` + (extraRules ? " " + extraRules : "")
  };
});

const linkedin = [];

const xlen = t => [...t.replace(/https?:\/\/\S+/g, "x".repeat(23))].reduce((n, ch) => { const p = ch.codePointAt(0); return n + ((p <= 4351 || (p >= 8192 && p <= 8205) || (p >= 8208 && p <= 8223) || (p >= 8242 && p <= 8247)) ? 1 : 2); }, 0);
const fails = [];
for (const p of x) {
  const n = xlen(p.text); console.log(`x${p.slot} ${n}`);
  if (n > 280) fails.push(`x${p.slot} too long`);
  if (p.poll) { if (p.poll.options.length < 2 || p.poll.options.length > 4 || p.poll.options.some(o => [...o].length > 25) || !p.poll.followup) fails.push(`x${p.slot} poll invalid`); }
}
for (const c of comments) {
  const n = [...c.text].length; console.log(`c${c.slot} r/${c.subreddit} ${n}`);
  if (n > 1200) fails.push(`c${c.slot} too long`);
  if (/\bI\b|\bI'm\b|\bmy\b/.test(c.text)) fails.push(`c${c.slot} first person`);
}
const all = [...x, ...comments, ...linkedin];
for (const p of all) if (/[—–]/.test(p.text + (p.thread_title || "") + (p.why || "") + JSON.stringify(p.poll || ""))) fails.push(`${p.platform}${p.slot} has a dash`);
if (fails.length) { console.error("FAIL:", fails); process.exit(1); }
for (const p of x) fs.writeFileSync(path.join(dir, `${date}_x${p.slot}.json`), JSON.stringify(p, null, 2));
for (const p of comments) fs.writeFileSync(path.join(dir, `${date}_c${p.slot}.json`), JSON.stringify(p, null, 2));

const brief = {
  date,
  summary: "Tuesday 24 Nov, the first new set since 20 Nov (nothing was stored for 21 to 23 Nov). It's another quiet news week, so X leans on solid studies: late dinners and reflux, PHGG fibre in Mornings (5 g, against the 6 g a trial used), ASCI's finding that most ad violations sit in digital and sponsored social posts, our reorder number, and the classic 6-hours-of-sleep trial. No poll and no LinkedIn (Tuesday). Reddit is blocked for Claude, so there are 8 bank comments on bedroom temperature, sleep and muscle, daily isabgol, WFH light, coffee cut-off time, deep-work timing, D2C pricing and the snooze button.",
  trends: [
    { topic: "Dinner-to-bed time under 3 hours linked to about 7x the odds of reflux", angle: "Late Indian dinners. X today.", platform: "X", source: "https://pubmed.ncbi.nlm.nih.gov/16393212/" },
    { topic: "PHGG: 6 g a day improved bloating scores in a 12-week IBS trial", angle: "The fibre in Mornings, with dose honesty. X today.", platform: "X", source: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4744437/" },
    { topic: "ASCI: 94% of 2024-25 violations in digital media, 68% of flagged digital ads were sponsored social posts", angle: "Where misleading claims actually show up. X today. Verify the figures in the article.", platform: "X / LinkedIn", source: "https://www.medianama.com/2026/10/223-asci-flags-60-misleading-nutraceutical-ads/" },
    { topic: "Six hours of sleep for two weeks (Van Dongen 2003)", angle: "Feeling fine is not performing fine. X today.", platform: "X", source: "https://pubmed.ncbi.nlm.nih.gov/12683469/" },
    { topic: "MIT: the brain's overnight cleaning weakens with age, tied to weaker deep-sleep waves (Nov 2026)", angle: "Held back: close to the 17 Nov 'sounds in sleep' post. Possible later angle on protecting deep sleep.", platform: "X", source: "https://www.sciencedaily.com/releases/2026/11/261114202137.htm" },
    { topic: "Ashwagandha root extract: 24-week, 1,200-adult tolerability study (Aug 2026); TGA notes rare liver cases", angle: "Possible Wednesday LinkedIn ingredient post on ashwagandha safety, written carefully.", platform: "LinkedIn", source: "https://borncity.com/news/ashwagandha-studie-mit-1-200-erwachsenen-bestaetigt-gute-vertraeglichkeit/" },
    { topic: "Indian IT burnout: Blind survey, 1 in 4 work 70+ hours a week", angle: "Older (2025) but still widely shared. Background for work-culture posts.", platform: "LinkedIn", source: "https://www.teamblind.com/blog/burnout-epidemic-in-indias-it-sector-one-in-four-clock-70-hours-a-week" }
  ],
  instagram: "21 Nov reel 'The list is exhausting': what one stick of Mornings would take from food (green tea, egg yolks, rajma, dahi, guava, milk, coffee), with a comment-to-DM CTA; 25 likes, 8 comments (comments not readable without login, so check them for questions or complaints). 20 Nov reel: 'you just need 2 sticks', 22 likes, 0 comments. The food-equivalent figures in the 21 Nov reel are not in the playbook, so we didn't reuse them on X.",
  competitors: "Nothing new from competitors in what we checked this week. Supply6's Rs 48 crore round (Unilever Ventures) is still the most recent category funding story we found. Full analysis is on the Competitors tab."
};
fs.writeFileSync(path.join(__dirname, `brief-${date}.json`), JSON.stringify(brief, null, 2));
console.log(`wrote ${all.length} drafts and the brief for ${date}`);
