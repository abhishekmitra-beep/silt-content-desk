// Drafts for Wednesday 2026-11-25. Made by hand on 25 Nov morning: the 24 Nov 6 PM run stalled on a permission
// prompt (a piped Bash command writing to /tmp). Run: node drafts/2026-11-25.js
const fs = require("fs");
const path = require("path");
const date = "2026-11-25";
const dir = path.join(__dirname, "posts");
const newFeed = sub => `https://www.reddit.com/r/${sub}/new/`;
const COMMON = "NON-NEGOTIABLE: reply only to a thread posted in the last 3 days (check the timestamp under the title). If nothing that recent fits, skip this comment and mark it Rejected with a note. Prefer threads with few comments, adapt the first line to what OP actually said, and add no links and no pitch.";

const x = [
  {
    product: "mornings", pillar: "Trust", angle: "Education", format: "Single post",
    trend: "Classic trial: L-theanine + caffeine improved task switching, but people didn't feel more alert (Giesbrecht et al., 2010)",
    why: "Classic-trial shape the team approved on 24 Nov, with an honest twist. Ties to the L-theanine LinkedIn post today.",
    source: "https://pubmed.ncbi.nlm.nih.gov/20079786/",
    text: "In a placebo-controlled trial, L-theanine with caffeine helped people switch between tasks more accurately. The odd part: they didn't feel any more alert.\n\nThat's the kind of focus we wanted in SILT Mornings. Steady and useful, without the buzz."
  },
  {
    product: "mornings", pillar: "Adherence", angle: "Poll", format: "Poll (1 day)",
    trend: "Poll idea from the playbook: last caffeine of the day",
    why: "Wednesday is a poll day. The answers tell us how many of our audience drink caffeine too late, which feeds the sleep content.",
    source: "https://siltnutrition.com/pages/quiz",
    text: "Be honest. Your last caffeine of the day is usually...",
    poll: {
      options: ["Before noon", "12 to 3 PM", "3 to 6 PM", "After 6 PM"],
      duration: "1 day",
      followup: "Thursday: share the result, then the tip. Caffeine has a half-life of about 5 hours, so a 5 PM chai is still half there at 10 PM. Suggest moving the last cup before 2 PM for a week and seeing what changes."
    }
  },
  {
    product: "both", pillar: "Adherence", angle: "Ritual", format: "Single post",
    trend: "Plan of Action: the Combo ritual replaces the supplement shelf",
    why: "Combo messaging from the Plan of Action (one for morning, one for night). It's one of the day's 2 product posts.",
    source: "https://siltnutrition.com",
    text: "Count the jars on your supplement shelf. Now count how many you actually took this week.\n\nWe built SILT as two sticks instead: Mornings for energy, gut and vitamins, Nights for sleep and recovery. Sixty seconds, twice a day. The best supplement is the one you don't skip."
  },
  {
    product: "mornings", pillar: "Trust", angle: "Honesty", format: "Single post",
    trend: "Plan of Action: the 'placebo' column (benefits people don't feel day to day)",
    why: "An honest Trust post from the retention plan. It sets expectations, so people don't quit when vitamins don't 'feel' like anything.",
    source: "https://siltnutrition.com",
    text: "Some of SILT you'll feel within a week: steadier energy, falling asleep faster.\n\nSome you won't feel at all. Nobody wakes up feeling more vitamin D or B12. That's why every dose is printed on the pack and every ingredient has a lab report: so you can trust the quiet part too."
  },
  {
    product: "nights", pillar: "Adherence", angle: "Taste", format: "Single post",
    trend: "Plan of Action: 'tastiest night drink', backed by verified reviews on siltnutrition.com",
    why: "The taste point from the Adherence pillar, using real verified-review wording. It's the day's second product post.",
    source: "https://siltnutrition.com",
    text: "\"Taste of SILT Night is really amazing.\" That's one of our verified reviews, and we hear it a lot.\n\nWe spent months on the Chamomile Lemon flavour for a simple reason: a bedtime drink you look forward to is one you'll actually have every night."
  }
].map((p, i) => ({ ...p, date, platform: "x", slot: i + 1, status: "pending" }));

const comments = [
  {
    subreddit: "bangalore", pillar: "Adherence",
    thread_title: "Find a post from the last 3 days: wedding season late nights are wrecking my sleep",
    thread_summary: "Look for someone tired from back-to-back weddings, sangeets or late functions.",
    product: "nights", angle: "Education",
    text: "Wedding season does this to everyone. What helps most is protecting your wake-up time, even after a late night: sleep in by an hour at most, then get daylight early and take a 20 minute nap before 3 PM if you need it. Long lie-ins shift your body clock and make the next week worse. Go easy on the late heavy food and the last drink, since both make the second half of the night lighter.",
    why: "A seasonal, very Bengaluru topic in November and December."
  },
  {
    subreddit: "developersIndia", pillar: "Trust",
    thread_title: "Find a post from the last 3 days: which supplements actually matter for desk workers?",
    thread_summary: "Look for someone confused by supplement stacks or asking what is worth taking.",
    product: "education", angle: "Education",
    text: "Start with a blood test before buying anything. Vitamin D and B12 are the gaps that show up most in Indian office workers, and a test tells you whether you actually have them. Fix sleep, protein and fibre with food first. If you do add something, look for the dose of each ingredient on the label, and skip anything that hides it inside a proprietary blend. The best stack is short enough that you actually take it every day.",
    why: "A common question. The honest answer earns trust without pitching, and matches our transparency line."
  },
  {
    subreddit: "IndianFitness", pillar: "Trust",
    thread_title: "Find a post from the last 3 days: does a protein shake before bed affect sleep?",
    thread_summary: "Look for someone asking about pre-bed protein, casein, or eating late after training.",
    product: "nights", angle: "Education",
    text: "A protein shake before bed is fine for most people. Studies on pre-sleep protein (often casein, around 30 to 40 g) found it can help overnight muscle repair without hurting sleep. What tends to disturb sleep is a big heavy meal or anything with caffeine, which some protein powders and pre-workouts quietly contain, so check the label. Keep it to a simple shake about 30 minutes before bed.",
    why: "Fitness subreddit evergreen. It's evidence-based and flags hidden caffeine."
  },
  {
    subreddit: "Fitness_India", pillar: "Adherence",
    thread_title: "Find a post from the last 3 days: how much water should I actually drink in a day?",
    thread_summary: "Look for someone asking about daily water intake, especially for gym-goers or hot weather.",
    product: "mornings", angle: "Education",
    text: "There's no single magic number, but a simple check works: pale yellow urine through the day means you're fine. Most active adults in Indian weather land somewhere around 2.5 to 3.5 litres, more on training days. Losing even about 1% of body water has been shown to lower mood and make tasks feel harder, so the afternoon slump is sometimes just thirst. Keep a bottle on your desk and finish it by lunch.",
    why: "A recurring question. It links the slump to hydration, an angle the team liked."
  },
  {
    subreddit: "productivity", pillar: "Adherence",
    thread_title: "Find a post from the last 3 days: what can I have instead of afternoon coffee?",
    thread_summary: "Look for someone cutting afternoon caffeine to sleep better but still wanting a pick-me-up.",
    product: "mornings", angle: "Education",
    text: "A few things work better than people expect: a 10 minute walk outside, a big glass of water, or a 15 minute nap before 3 PM. If you want a drink, green tea has much less caffeine than coffee, and decaf gives you the ritual without the late caffeine. Caffeine has a half-life of around 5 hours, so moving your last cup earlier is often the single biggest fix for evening sleep.",
    why: "Ties in with today's caffeine poll, and is useful on its own."
  },
  {
    subreddit: "StartUpIndia", pillar: "Trust",
    thread_title: "Find a post from the last 3 days: how do you get D2C customers to buy again?",
    thread_summary: "Look for founders asking about repeat purchases, retention or customer lifetime value.",
    product: "brand", angle: "Founder insight",
    text: "What we're learning at a small wellness brand: most people don't drop off because the product failed. They drop off because the habit never formed, or they expected results too early. So we set honest expectations on day one (what you'll feel in a week, and what takes a month), check in on day 3 and day 7 to ask how it's going, and remind people a few days before they run out, not after. It's early for us, but asking how they feel has taught us more than any dashboard.",
    why: "A founder subreddit. Shares our real retention thinking from the Plan of Action without claiming results we don't have.",
    extraRules: "Founder-friendly subreddit: it's fine to say who we are once, but don't link."
  },
  {
    subreddit: "IndiaCoffee", pillar: "Trust",
    thread_title: "Find a post from the last 3 days: does coffee dehydrate you?",
    thread_summary: "Look for someone asking whether coffee counts towards water intake.",
    product: "mornings", angle: "Education",
    text: "Not really, for regular drinkers. Caffeine has a mild diuretic effect, but studies on habitual coffee drinkers found moderate amounts (a few cups a day) hydrate about as well as water. Your body gets used to it. The bigger issues are what comes with the coffee, like sugar, and drinking it late enough to hurt sleep. So count it towards your fluids, but don't let it replace water entirely.",
    why: "A common coffee-community myth question, with a clean evidence-based answer."
  },
  {
    subreddit: "sleep", pillar: "Trust",
    thread_title: "Find a post from the last 3 days: my sleep tracker says I barely get deep sleep, should I worry?",
    thread_summary: "Look for someone anxious about deep sleep or REM numbers from a watch or ring.",
    product: "nights", angle: "Education",
    text: "Wrist and ring trackers estimate sleep stages from movement and heart rate, and they're much less accurate at deep sleep than a sleep lab. Treat the stage numbers as rough trends, not a diagnosis. How you feel during the day matters more. Worrying about the score can itself make sleep worse, which even has a name in research: orthosomnia. If you're genuinely exhausted despite enough hours, that's worth a doctor's visit.",
    why: "Trackers are huge in r/sleep, and an honest answer builds credibility.",
    extraRules: "r/sleep is strict about promotion. Never mention SILT here unless someone asks directly."
  }
].map((c, i) => {
  const { extraRules, ...rest } = c;
  return {
    date, platform: "reddit_comment", slot: i + 1, status: "pending", account: "u/Silt_Nutrition",
    ...rest, thread_url: newFeed(c.subreddit), max_age_days: 3, format: "Comment bank (pick a post from the last 3 days)",
    rules: `${COMMON} Check the r/${c.subreddit} sidebar before commenting.` + (extraRules ? " " + extraRules : "")
  };
});

const linkedin = [{
  date, platform: "linkedin", slot: 1, status: "pending", product: "both", pillar: "Trust",
  angle: "Ingredient series", format: "Wednesday: ingredient series",
  trend: "L-theanine: in both SILT sticks at 200 mg, and newly popular as caffeine's partner in global energy launches",
  why: "Wednesday ingredient series. L-theanine is having a moment (a big global brand just launched a caffeine + L-theanine drink), and we've had it in both sticks since launch. No competitor named.",
  competitor: "A large global greens brand launched a caffeine + L-theanine version this month. We show our dose and the evidence, including its limits, instead of naming them.",
  source: "https://pubmed.ncbi.nlm.nih.gov/20079786/",
  image: {
    concept: "A 5-slide document carousel: 1) 'L-theanine: the tea molecule in both our sticks', 2) 200 mg in Mornings, with caffeine, 3) 200 mg in Nights, with glycine, magnesium and ashwagandha, 4) what the studies found and where the evidence is thin, 5) the dose line from our pack",
    source: "Use the real back-of-pack panel (Shoot Photos on Drive) for slides 2, 3 and 5. Plain navy slides with white text for 1 and 4.",
    overlay: "SILT logo on every slide, with one short line of text each.",
    alt: "Single image: the back of the Mornings pack, cropped to the L-theanine dose line, with the band 200 MG IN BOTH STICKS.",
    link: "https://drive.google.com/drive/folders/1nYAaYJBBAt23LYV2CQ-RF4nZA4qsLMxk"
  },
  text: "This week's ingredient: L-theanine, 200 mg in both SILT sticks.\n\nL-theanine is an amino acid found naturally in tea leaves, and it's a big part of why a cup of tea feels calmer than a cup of coffee.\n\nIn SILT Mornings, it sits next to 80 mg of caffeine. Studies pairing the two have found better attention and task switching than caffeine alone, without the jittery edge. One placebo-controlled trial found people performed better at switching tasks even though they didn't feel more alert, which is exactly the kind of quiet focus we were after.\n\nIn SILT Nights, the same 200 mg works alongside glycine, magnesium and ashwagandha to help a racing mind slow down in the evening.\n\nWhere the evidence is thin: most studies are small and measure effects over hours, not months. We'd rather say that plainly than oversell it.\n\nCaffeine and L-theanine together is suddenly showing up in big global launches. It's been printed on both our packs since day one, at 200 mg each.\n\nWhich ingredient should we break down next?\n\n#preventivehealth #nutrition"
}];

const xlen = t => [...t.replace(/https?:\/\/\S+/g, "x".repeat(23))].reduce((n, ch) => { const p = ch.codePointAt(0); return n + ((p <= 4351 || (p >= 8192 && p <= 8205) || (p >= 8208 && p <= 8223) || (p >= 8242 && p <= 8247)) ? 1 : 2); }, 0);
const fails = [];
for (const p of x) {
  const n = xlen(p.text); console.log(`x${p.slot} ${n} ${p.pillar}`);
  if (n > 280) fails.push(`x${p.slot} too long`);
  if (p.poll && (p.poll.options.length < 2 || p.poll.options.length > 4 || p.poll.options.some(o => [...o].length > 25) || !p.poll.followup)) fails.push(`x${p.slot} poll invalid`);
}
for (const c of comments) {
  const n = [...c.text].length; console.log(`c${c.slot} r/${c.subreddit} ${n} ${c.pillar}`);
  if (n > 1200) fails.push(`c${c.slot} too long`);
  if (/\bI\b|\bI'm\b|\bmy\b/.test(c.text)) fails.push(`c${c.slot} first person`);
}
for (const l of linkedin) { const n = [...l.text].length; console.log(`l1 ${n}`); if (n > 3000) fails.push("l1 too long"); if (/\bI\b|\bI'm\b|\bmy\b/.test(l.text)) fails.push("l1 first person"); }
const all = [...x, ...comments, ...linkedin];
for (const p of all) { if (!p.pillar) fails.push(`${p.platform}${p.slot} no pillar`); if (/[—–]/.test(p.text + (p.thread_title || "") + JSON.stringify(p.poll || ""))) fails.push(`${p.platform}${p.slot} has a dash`); }
if (fails.length) { console.error("FAIL:", fails); process.exit(1); }
for (const p of x) fs.writeFileSync(path.join(dir, `${date}_x${p.slot}.json`), JSON.stringify(p, null, 2));
for (const p of comments) fs.writeFileSync(path.join(dir, `${date}_c${p.slot}.json`), JSON.stringify(p, null, 2));
for (const p of linkedin) fs.writeFileSync(path.join(dir, `${date}_l${p.slot}.json`), JSON.stringify(p, null, 2));

const brief = {
  date,
  summary: "Wednesday 25 Nov, drafted at noon on the day after the 24 Nov 6 PM run stalled. The first set built to the Plan of Action: every draft is tagged Adherence or Trust (X is 3 Adherence, 2 Trust). Leaning on what the team approved yesterday (ingredient explainers, classic trials) and away from what it rejected (regulator data posts, the dinner-timing study). LinkedIn's ingredient series covers L-theanine, timely because a big global brand just launched a caffeine + L-theanine drink.",
  trends: [
    { topic: "L-theanine + caffeine: better task switching without feeling more alert (2010 trial)", angle: "X Trust post and the LinkedIn ingredient post.", platform: "X / LinkedIn", source: "https://pubmed.ncbi.nlm.nih.gov/20079786/" },
    { topic: "High-dose L-theanine + caffeine improved attention after a night without sleep (British Journal of Nutrition, 2025)", angle: "Background for LinkedIn. Not used on X, since 18 Nov already covered sleep loss.", platform: "LinkedIn", source: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12491391/" },
    { topic: "Coffee, the gut microbiome and mood (University College Cork, 62 adults, reported 31 Oct)", angle: "Small study, so treat it carefully. A possible Trust post later this week.", platform: "X", source: "https://www.psypost.org/scientists-discover-how-coffee-interacts-with-the-gut-microbiome-to-affect-the-human-brain/" },
    { topic: "AG1 Energy+ (caffeine + L-theanine), launched 17 Nov", angle: "Category validation for Mornings. Never name it in posts.", platform: "Context", source: "https://www.prnewswire.com/news-releases/ag1-launches-ag1-energy-with-lewis-hamilton-as-new-global-ambassador-302941403.html" },
    { topic: "Plan of Action: Combo ritual, 'tastiest night drink', the 'placebo' column", angle: "Three of today's X posts come straight from the team's plan.", platform: "X", source: "https://siltnutrition.com" },
    { topic: "Wedding season sleep (Nov to Dec)", angle: "Seasonal comment for r/bangalore.", platform: "Reddit", source: "https://www.reddit.com/r/bangalore/new/" }
  ],
  instagram: "Not re-checked today. The latest seen are the 19 Nov 'Sleep isn't one problem, it's five' reel and the 18 Nov verified-reviews post.",
  competitors: "This week's competitor moves are on the Competitors tab under 'What changed'. Nights rivals are scaling sleep ads, and AG1 launched Energy+.",
  linkedin_trends: [
    { topic: "Caffeine + L-theanine becomes a global launch format", date: "17 Nov", day: "Wed", angle: "Today's ingredient post. We've had both at 200 mg L-theanine since launch.", source: "https://www.prnewswire.com/news-releases/ag1-launches-ag1-energy-with-lewis-hamilton-as-new-global-ambassador-302941403.html" }
  ]
};
fs.writeFileSync(path.join(__dirname, `brief-${date}.json`), JSON.stringify(brief, null, 2));
console.log(`wrote ${all.length} drafts and the brief for ${date}`);
