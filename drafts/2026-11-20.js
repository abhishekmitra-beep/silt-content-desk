// Drafts for Friday 2026-11-20. Made by hand on 20 Nov because the 19 Nov 6 PM run stalled on a permission prompt.
// Run: node drafts/2026-11-20.js
const fs = require("fs");
const path = require("path");
const date = "2026-11-20";
const dir = path.join(__dirname, "posts");
const newFeed = sub => `https://www.reddit.com/r/${sub}/new/`;
const COMMON = "NON-NEGOTIABLE: reply only to a thread posted in the last 3 days (check the timestamp under the title). If nothing that recent fits, skip this comment and mark it Rejected with a note. Prefer threads with few comments, adapt the first line to what OP actually said, and add no links and no pitch.";

const x = [
  {
    product: "brand", angle: "Work culture", format: "Single post",
    trend: "ADP Research 2026: nearly 1 in 4 Indian workers put in 16+ unpaid hours a week, the highest of any market surveyed",
    why: "Fresh, numbers-led and about our exact audience. Matches the shape the team approved: hard number from a named study plus an honest line.",
    source: "https://cxotoday.com/research/adp-research-2026-young-workers-women-bear-heavy-workplace-stress-in-india-despite-wellbeing-gains/",
    text: "Nearly 1 in 4 Indian workers put in 16 or more unpaid hours a week, the highest of every market in ADP's 2026 survey.\n\nThose hours usually come out of sleep. If your week looks like this, protect one thing first: the same wake-up time every day, weekends included."
  },
  {
    product: "nights", angle: "Poll", format: "Poll (1 day)",
    trend: "Our quiz question 1 (siltnutrition.com/pages/quiz) and this week's Instagram reel 'Sleep isn't one problem, it's five'",
    why: "Low-effort Friday engagement that tells us which sleep problem our audience has most. Echoes the 19 Nov reel.",
    source: "https://siltnutrition.com/pages/quiz",
    text: "Quick Friday poll. What wrecks your sleep most?",
    poll: {
      options: ["Falling asleep", "Waking at 3 AM", "Tired on waking", "All of the above"],
      duration: "1 day",
      followup: "Saturday: share the result, then one tip for the winner. For 3 AM waking, cover alcohol and late caffeine. For falling asleep, a fixed wind-down and a dim last half hour. Optional, once this week: 'Not sure which SILT fits? Our 2-question quiz: siltnutrition.com/pages/quiz'."
    }
  },
  {
    product: "nights", angle: "Regulation / transparency", format: "Single post",
    trend: "India restricted ashwagandha leaf in supplements in April 2026; root and root extract stay allowed",
    why: "Clear, checkable regulatory fact that lets us state our root-only ingredient. Not used on X yet.",
    source: "https://www.nutraingredients.com/Article/2026/04/28/india-bans-ashwagandha-leaf-use-in-any-form-industry-reacts/",
    text: "India restricted ashwagandha leaf in supplements this year. Root and root extract are still allowed.\n\nSILT Nights uses 300 mg of KSM-66, a root-only extract, and the dose is printed on the pack. If a label just says \"ashwagandha\", it's fair to ask which part of the plant."
  },
  {
    product: "nights", angle: "Education", format: "Single post",
    trend: "Friday night: alcohol and sleep",
    why: "Timely for a Friday and well established in sleep research. Pure education with no product, which fits the weekly mix.",
    source: "https://www.sleepfoundation.org/nutrition/alcohol-and-sleep",
    text: "Friday reminder: a drink can help you fall asleep faster, but as your body clears it, the second half of the night gets lighter, with less REM and more waking.\n\nIf you're drinking tonight, finish a few hours before bed and have a glass of water with each one."
  },
  {
    product: "brand", angle: "Transparency", format: "Single post",
    trend: "ASCI 'A Pill for Thought' (28 Oct): 60 of 61 reviewed nutraceutical ads broke the code",
    why: "The biggest category story, not yet used on X. Gives people a quick checklist, which makes it useful rather than self-promotion.",
    source: "https://www.mxmindia.com/advertising/asci-report-flags-evidence-gaps-in-nutraceutical-advertising-claims",
    text: "ASCI found 60 of 61 supplement ads it reviewed broke the ad code. The common problem: a study on one ingredient used to sell the whole product.\n\nA 10-second check for any supplement ad: is the dose printed, and does it match the dose the study used?"
  }
].map((p, i) => ({ ...p, date, platform: "x", slot: i + 1, status: "pending" }));

const comments = [
  {
    subreddit: "bangalore",
    thread_title: "Find a post from the last 3 days: why do Monday mornings feel so awful even after a long weekend sleep?",
    thread_summary: "Look for someone asking why they feel wrecked on Monday, or about sleeping late on weekends.",
    product: "nights", angle: "Education",
    text: "Sleeping in on weekends is the usual culprit. If you sleep 2 or 3 hours later on Saturday and Sunday, your body clock shifts, and Monday's alarm lands at what feels like 4 AM. Researchers call it social jetlag. Keeping your wake-up time within about an hour of your weekday time, even on weekends, fixes most of it. Get daylight in the first hour after you wake, and keep weekend naps short.",
    why: "Social jetlag is common and well studied, and it fits Bengaluru's late weekend culture."
  },
  {
    subreddit: "IndianFitness",
    thread_title: "Find a post from the last 3 days: does working out late at night ruin sleep?",
    thread_summary: "Look for someone who can only train after office hours and is worried it hurts their sleep.",
    product: "nights", angle: "Education",
    text: "For most people, evening workouts are fine. Reviews of the research found that exercise in the evening doesn't hurt sleep on average, and can even help. The exception is very hard training that ends less than about an hour before bed, which can leave you wired. So if 9 PM is your only slot, keep the last 20 minutes lighter, cool down properly, and leave an hour before you try to sleep. A pre-workout with caffeine at that time will hurt sleep more than the workout itself.",
    why: "Office workers who train late are a big part of this subreddit, and the answer is evidence-based and reassuring."
  },
  {
    subreddit: "sleep",
    thread_title: "Find a post from the last 3 days: does a drink before bed actually help sleep?",
    thread_summary: "Look for someone who uses a drink or two to fall asleep, or who wakes at 3 AM after drinking.",
    product: "nights", angle: "Education",
    text: "It helps you fall asleep, which is why it feels like it works. The catch comes later: as your body clears the alcohol, the second half of the night gets lighter, with less REM and more waking. That's often where the 3 AM wake-ups come from. If you want to test it, take two weeks with no drinks within 3 hours of bed and see whether the early wake-ups change. If they don't, it's worth talking to a doctor.",
    why: "A very common question on r/sleep. An honest answer with a self-test is how we earn credibility there.",
    extraRules: "r/sleep is strict about promotion. Never mention SILT here unless someone asks directly."
  },
  {
    subreddit: "Fitness_India",
    thread_title: "Find a post from the last 3 days: vegetarian and always tired, could it be B12?",
    thread_summary: "Look for a vegetarian asking about B12, low energy, or whether they need a B12 supplement.",
    product: "mornings", angle: "Education",
    text: "B12 is worth checking. It comes almost entirely from animal foods, so vegetarians in India are commonly low, especially if they don't eat much dairy. Tiredness has many causes though, so get a blood test before guessing. If it's low, your doctor will tell you whether you need a regular supplement or a course of injections first. Milk, curd, paneer and eggs (if you eat them) help, and so do fortified foods.",
    why: "B12 deficiency among Indian vegetarians comes up constantly, and B12 is in Mornings. The answer points to testing, not to us.",
    extraRules: "This touches on health. Keep the 'get tested, ask a doctor' line in, and don't mention SILT."
  },
  {
    subreddit: "productivity",
    thread_title: "Find a post from the last 3 days: afternoon naps leave me groggy, how long should a nap be?",
    thread_summary: "Look for someone who naps after lunch and wakes up worse, or asks about nap length.",
    product: "mornings", angle: "Education",
    text: "Keep it to 10 to 20 minutes and take it before about 3 PM. Past roughly 30 minutes you drop into deeper sleep, and waking from that is what leaves you groggy. Some people do a coffee nap: drink a small coffee right before lying down, since caffeine takes about 20 minutes to kick in, so you wake as it starts working. Set an alarm either way. If you need a long nap every day just to function, look at your night sleep first.",
    why: "Napping is a recurring productivity question, and the advice is practical and specific."
  },
  {
    subreddit: "StartUpIndia",
    thread_title: "Find a post from the last 3 days: how did you validate demand before launching your product?",
    thread_summary: "Look for founders asking how to test demand, run pre-orders, or know if people will pay before launch.",
    product: "brand", angle: "Founder insight",
    text: "What worked for us (we make a wellness drink mix) was pre-booking. We put the product, every dose and the price on a simple page, and asked people to pre-book before we'd made a single box. 1,870 people did. The useful part wasn't the number but the reasons people gave, which changed our messaging more than any survey. If you try it, make the page specific (exact price, what's inside, the delivery date) so the signal means something.",
    why: "Founder-to-founder subreddit where saying who we are is fine. Uses our one hard launch fact.",
    extraRules: "Founder-friendly subreddit: it's fine to say who we are once, but don't link."
  },
  {
    subreddit: "IndiaCoffee",
    thread_title: "Find a post from the last 3 days: is decaf worth it, and how much caffeine does it still have?",
    thread_summary: "Look for someone cutting down on caffeine, asking about decaf in India, or wanting coffee at night.",
    product: "mornings", angle: "Education",
    text: "Decaf isn't zero caffeine, but it's close. A cup usually has a few milligrams, against about 60 to 100 mg in a regular filter coffee. For most people that's low enough to drink in the evening without hurting sleep. The taste depends a lot on the decaf process and the roast, so try a couple of roasters before writing it off. If you're cutting down, swapping only your afternoon cup to decaf gets you most of the sleep benefit.",
    why: "Decaf comes up often among coffee lovers trying to sleep better, and it ties into our caffeine-timing message."
  },
  {
    subreddit: "Nootropics",
    thread_title: "Find a post from the last 3 days: which magnesium form should I take (glycinate, citrate, oxide, threonate)?",
    thread_summary: "Look for someone confused by magnesium forms or asking which is best for sleep or stress.",
    product: "nights", angle: "Education",
    text: "Look at elemental magnesium first. The big number on the bottle is often the compound, not the magnesium. Glycinate is gentle on the stomach and popular for evening use. Citrate absorbs well but can loosen stools at higher doses. Oxide packs a lot of magnesium per tablet but absorbs poorly. Threonate has some interesting early studies but delivers little elemental magnesium per capsule. The sleep evidence is strongest for people who are actually low, so a test is worth more than switching forms.",
    why: "A recurring r/Nootropics question. It's a different angle from the 17 Nov sleep review comment, and it's accurate and practical.",
    extraRules: "r/Nootropics removes anything promotional. Evidence only, and don't mention SILT unless asked."
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
  date, platform: "linkedin", slot: 1, status: "pending", product: "brand",
  angle: "Building in public", format: "Friday: building in public",
  trend: "Three weeks after launch, in the month ASCI and FSSAI came down on supplements",
  why: "Follows the playbook's Friday plan. Every number here is already published by us. Before posting, check the delivery line and replace it if the team has a better 'one thing we'd change'.",
  competitor: "Most brands in our analysis show badges ('lab tested', 'clinically backed') without the reports. This post shows our working, the opposite of what ASCI flagged.",
  source: "https://www.mxmindia.com/advertising/asci-report-flags-evidence-gaps-in-nutraceutical-advertising-claims",
  image: {
    concept: "Hands packing SILT boxes on a plain table, or a stack of shipped boxes, shot from above in daylight",
    source: "Shoot Photos and the packaging-line clips (Raw cilps) on Drive. A still from the packing line works well.",
    overlay: "SILT logo in white, top corner. One line only: 3 weeks in.",
    alt: "A simple single chart: 1,870 pre-bookings, then 250 customers in the first 15 days.",
    link: "https://drive.google.com/drive/folders/1D6suq4BOLzr2PGow-FK7A-9LgFDIW9Bz"
  },
  text: "We launched SILT three weeks ago, in what turned out to be a tough month for supplements in India.\n\nIn late October, ASCI reported that 60 of the 61 nutraceutical ads it reviewed broke the advertising code. In mid November, FSSAI acted against six supplement makers over safety and labelling. For a brand this new, that's a useful mirror.\n\nSo here is where we stand. Before launch, 1,870 people pre-booked. In the first 15 days, 250 people bought SILT and 10 had already reordered. Verified reviews average 4.9 out of 5.\n\nWhat we checked again this month: every dose is printed on both packs, there are no proprietary blends, and each of our 19 ingredients has a lab report, with 293 checks and none failed. We don't use melatonin, added sugar or maltodextrin, and our ashwagandha is a root extract.\n\nOne thing we'd change is delivery. An early order bounced between courier hubs for days, and it reminded us that trust is built after checkout too.\n\nIf you're building in health or food, what did your first month teach you?\n\n#preventivehealth #D2CIndia"
}];

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
for (const l of linkedin) { const n = [...l.text].length; console.log(`l1 ${n}`); if (n > 3000) fails.push("l1 too long"); if (/\bI\b|\bI'm\b|\bmy\b/.test(l.text)) fails.push("l1 first person"); }
const all = [...x, ...comments, ...linkedin];
for (const p of all) if (/[—–]/.test(p.text + (p.thread_title || "") + JSON.stringify(p.poll || ""))) fails.push(`${p.platform}${p.slot} has a dash`);
if (fails.length) { console.error("FAIL:", fails); process.exit(1); }
for (const p of x) fs.writeFileSync(path.join(dir, `${date}_x${p.slot}.json`), JSON.stringify(p, null, 2));
for (const p of comments) fs.writeFileSync(path.join(dir, `${date}_c${p.slot}.json`), JSON.stringify(p, null, 2));
for (const p of linkedin) fs.writeFileSync(path.join(dir, `${date}_l${p.slot}.json`), JSON.stringify(p, null, 2));

const brief = {
  date,
  summary: "Friday 20 Nov, drafted at 11 AM on the day because the 19 Nov evening run stalled on a permission prompt. It's a quiet news week. The fresh hook is ADP's finding that nearly 1 in 4 Indian workers put in 16+ unpaid hours a week. The rest is solid education (alcohol and sleep, ashwagandha root vs leaf, a quick way to check any supplement ad) plus the first quiz-based X poll, which echoes this week's 'sleep isn't one problem, it's five' reel. Reddit comments come from the comment bank, because Claude can't open Reddit.",
  trends: [
    { topic: "ADP Research 2026: nearly 1 in 4 Indian workers put in 16+ unpaid hours a week", angle: "Long hours eat sleep; protect the wake time. Used on X today.", platform: "X", source: "https://cxotoday.com/research/adp-research-2026-young-workers-women-bear-heavy-workplace-stress-in-india-despite-wellbeing-gains/" },
    { topic: "Great Place To Work India: 13% high burnout, stable since 2022; Gen Z now 26% of the workforce", angle: "Future post on young workers and sleep.", platform: "X / LinkedIn", source: "https://www.freepressjournal.in/education/13-employees-report-high-burnout-as-gen-z-nearly-doubles-its-share-of-indias-workforce-to-26-study" },
    { topic: "FSSAI acts against six nutraceutical makers (16 Nov)", angle: "Used on X on 19 Nov. Mentioned in today's LinkedIn post.", platform: "LinkedIn", source: "https://lapaasvoice.com/fssai-takes-action-against-six-nutraceutical-makers-over-serious-food-safety-violations/" },
    { topic: "ASCI: 60 of 61 nutraceutical ads broke the code", angle: "A 10-second ad check on X today; also in LinkedIn.", platform: "X / LinkedIn", source: "https://www.mxmindia.com/advertising/asci-report-flags-evidence-gaps-in-nutraceutical-advertising-claims" },
    { topic: "Ashwagandha leaf restricted in India, root allowed", angle: "Our KSM-66 is root only. On X today.", platform: "X", source: "https://www.nutraingredients.com/Article/2026/04/28/india-bans-ashwagandha-leaf-use-in-any-form-industry-reacts/" },
    { topic: "Alcohol and sleep (Friday)", angle: "Lighter second half of the night, 3 AM waking. X and r/sleep today.", platform: "X / Reddit", source: "https://www.sleepfoundation.org/nutrition/alcohol-and-sleep" },
    { topic: "Fibre 'having a moment' in trade press (Sep 2026)", angle: "Fibre trend continues. PHGG content for next week.", platform: "X", source: "https://www.supplysidesj.com/formulation/caffeine-considerations" },
    { topic: "Our quiz: the two questions people answer", angle: "The poll series starts today with the sleep question. The day question (afternoon fatigue, bloating, cravings) comes next.", platform: "X", source: "https://siltnutrition.com/pages/quiz" }
  ],
  instagram: "19 Nov reel: 'Sleep isn't one problem, it's five', on SILT Nights. 18 Nov post: verified customer reviews. No comments or complaints on either yet. Today's sleep poll on X echoes the reel.",
  competitors: "Nothing new from competitors this week in what we checked. The full analysis is on the Competitors tab.",
  linkedin_trends: [
    { topic: "ASCI nutraceutical ad report", date: "28 Oct", day: "Fri", angle: "Context for the three-weeks-in post.", source: "https://www.mxmindia.com/advertising/asci-report-flags-evidence-gaps-in-nutraceutical-advertising-claims" },
    { topic: "FSSAI action against six nutraceutical makers", date: "16 Nov", day: "Fri", angle: "Context for the three-weeks-in post.", source: "https://lapaasvoice.com/fssai-takes-action-against-six-nutraceutical-makers-over-serious-food-safety-violations/" },
    { topic: "ADP: Indian workers lead on unpaid hours", date: "2026", day: "Mon", angle: "A possible Monday category or work-culture post.", source: "https://cxotoday.com/research/adp-research-2026-young-workers-women-bear-heavy-workplace-stress-in-india-despite-wellbeing-gains/" }
  ]
};
fs.writeFileSync(path.join(__dirname, `brief-${date}.json`), JSON.stringify(brief, null, 2));
console.log(`wrote ${all.length} drafts and the brief for ${date}`);
