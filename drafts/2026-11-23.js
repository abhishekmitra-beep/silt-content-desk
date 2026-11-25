// Drafts for Monday 2026-11-23. Made by hand on 23 Nov afternoon: the 22 Nov 6 PM run never fired (app closed),
// and the catch-up run on 23 Nov morning drafted Tuesday instead. Run: node drafts/2026-11-23.js
const fs = require("fs");
const path = require("path");
const date = "2026-11-23";
const dir = path.join(__dirname, "posts");
const newFeed = sub => `https://www.reddit.com/r/${sub}/new/`;
const COMMON = "NON-NEGOTIABLE: reply only to a thread posted in the last 3 days (check the timestamp under the title). If nothing that recent fits, skip this comment and mark it Rejected with a note. Prefer threads with few comments, adapt the first line to what OP actually said, and add no links and no pitch.";

const x = [
  {
    product: "mornings", angle: "Trend reply", format: "Single post",
    trend: "JAMA study: 131,821 people followed for 43 years, with moderate coffee or tea intake linked to lower dementia risk",
    why: "A big named study with hard numbers and an honest caveat, the shape the team keeps approving. Not used before (19 Nov was Parkinson's).",
    source: "https://content.health.harvard.edu/blog/harvard-study-a-couple-of-daily-cups-of-coffee-or-tea-linked-to-lower-dementia-risk",
    text: "A Harvard-led study followed about 131,800 people for 43 years. Those drinking 2 to 3 cups of caffeinated coffee, or 1 to 2 of tea, a day had a lower dementia risk.\n\nIt's observational, so it can't prove cause. Decaf showed no similar link."
  },
  {
    product: "mornings", angle: "Poll", format: "Poll (1 day)",
    trend: "Quiz question 2 (siltnutrition.com/pages/quiz): the main health issue in the day",
    why: "Monday is a poll day. It's the second quiz question, after Friday's sleep poll, and the answers map straight onto Mornings.",
    source: "https://siltnutrition.com/pages/quiz",
    text: "Monday check-in. What hits you hardest during the workday?",
    poll: {
      options: ["3 PM slump", "Bloating after lunch", "Snack cravings", "All of the above"],
      duration: "1 day",
      followup: "Tuesday: share the result plus one evidence-based tip for the winner. 3 PM slump: lighter lunch, a 10 minute walk, last caffeine by 2 PM. Bloating: raise fibre slowly and drink more water. Cravings: protein and fibre at lunch. Don't add a quiz link if one already went out this week."
    }
  },
  {
    product: "brand", angle: "Category", format: "Single post",
    trend: "Indian nutraceutical startup funding now estimated above $500M, while regulators tighten scrutiny",
    why: "A Monday category take for X, in brand voice, that lines up with today's LinkedIn post.",
    source: "https://www.entrepreneur.com/en-in/news-and-trends/inside-the-rise-and-risks-of-indias-booming-nutraceutical/500629",
    text: "Funding into Indian supplement startups is now estimated at over $500 million, while regulators are tightening up at the same time.\n\nMore brands is good news for buyers, as long as the labels keep up. Our rule: if a dose isn't printed on the pack, we don't count it as a claim."
  },
  {
    product: "both", angle: "How to use", format: "Single post",
    trend: "How to take SILT (from siltnutrition.com/pages/quiz, 'How to use')",
    why: "Practical product post. It's the second product post of the day, within the limit of 2 out of 5.",
    source: "https://siltnutrition.com/pages/quiz",
    text: "Two questions we get a lot: when do I take it, and how?\n\nTear one stick, stir it into 200 to 250 ml of water, and sip. SILT Mornings goes any time in the morning. SILT Nights works best 30 to 60 minutes before bed, so it's already in you when your head hits the pillow."
  },
  {
    product: "mornings", angle: "Education", format: "Single post",
    trend: "Mild dehydration and mood and attention (Armstrong et al., Journal of Nutrition 2012)",
    why: "Evergreen and useful. It links the 3 PM slump to something people can fix for free, which balances the product posts.",
    source: "https://pubmed.ncbi.nlm.nih.gov/22190027/",
    text: "In a controlled study, losing just over 1% of body water was enough to lower mood and make tasks feel harder in healthy young women.\n\nBefore blaming the 3 PM slump on sleep or lunch, try the cheap fix first: a full glass of water with lunch and one more mid-afternoon."
  }
].map((p, i) => ({ ...p, date, platform: "x", slot: i + 1, status: "pending" }));

const comments = [
  {
    subreddit: "bangalore",
    thread_title: "Find a post from the last 3 days: can't sleep on Sunday night, anxious about Monday",
    thread_summary: "Look for someone who lies awake on Sunday night or dreads Monday mornings.",
    product: "nights", angle: "Education",
    text: "One thing with real research behind it: write tomorrow's to-do list before bed. In a sleep lab study, people who spent five minutes writing a specific list of what they needed to do next day fell asleep faster than people who wrote about what they'd already done. It gets the Monday plan out of your head and onto paper. Pair it with a fixed lights-out time and no work email after dinner on Sunday.",
    why: "Sunday-night anxiety comes up every week, and the to-do-list study (Scullin et al., 2018) is a specific, credible tip."
  },
  {
    subreddit: "developersIndia",
    thread_title: "Find a post from the last 3 days: rotating or night shifts are wrecking my sleep",
    thread_summary: "Look for devs on rotational, night or US-overlap shifts asking how to sleep properly.",
    product: "nights", angle: "Education",
    text: "Two things help most on rotating shifts. First, keep an anchor: about 4 hours of sleep at the same clock time every day, whatever the shift, and add naps around it. Second, treat light like a switch. Get bright light when your shift starts, wear dark glasses on the way home after a night shift, and make the bedroom properly dark. Have caffeine in the first half of the shift only, so it's out of your system when you need to sleep.",
    why: "Shift work is common in Indian IT and services, and the advice is practical and evidence-based."
  },
  {
    subreddit: "IndianFitness",
    thread_title: "Find a post from the last 3 days: getting leg cramps at night, should I take magnesium?",
    thread_summary: "Look for someone with night cramps after training asking about magnesium or electrolytes.",
    product: "nights", angle: "Education",
    text: "For ordinary night cramps, the evidence for magnesium is weak. A Cochrane review found it's unlikely to help most people, though it may help if you're actually low. What tends to work better: stretch your calves before bed, keep up fluids and salt on heavy training days, and don't jump your training volume too fast. If cramps are frequent or come with swelling or numbness, see a doctor rather than guessing.",
    why: "Honest about magnesium, which is in our Nights stick. Being straight about where it doesn't help builds trust.",
    extraRules: "Touches on health: keep the 'see a doctor' line. Don't mention SILT."
  },
  {
    subreddit: "Fitness_India",
    thread_title: "Find a post from the last 3 days: does green tea actually help with fat loss?",
    thread_summary: "Look for someone drinking green tea for weight loss and asking if it works.",
    product: "mornings", angle: "Education",
    text: "The effect is small. Studies on green tea extract found weight loss of around a kilo over a few months, and most of that comes from the caffeine. A few cups a day won't move the scale much on their own. It's a nice swap if it replaces sugary chai or soft drinks, and that swap is where most of the benefit comes from. For fat loss, calories, protein and sleep still do the heavy lifting.",
    why: "A very common question in Indian fitness circles. An honest, number-led answer earns upvotes."
  },
  {
    subreddit: "productivity",
    thread_title: "Find a post from the last 3 days: brain fog and low focus every afternoon, what helps?",
    thread_summary: "Look for someone with afternoon brain fog asking about focus, energy or routines.",
    product: "mornings", angle: "Education",
    text: "Check water before anything else. In a controlled study, losing just over 1% of body water was enough to lower mood and make tasks feel harder, and most of us drink very little during a busy workday. Then look at lunch: a big refined-carb meal followed by sitting makes the dip worse, and a short walk after eating helps. If you still rely on a late coffee to get through, move it before 2 PM so it doesn't cost you tonight's sleep.",
    why: "Afternoon fog is a recurring productivity question, and the hydration study adds a fresh angle beyond 'drink coffee'."
  },
  {
    subreddit: "StartUpIndia",
    thread_title: "Find a post from the last 3 days: how did you get your first customer reviews?",
    thread_summary: "Look for founders asking how to collect reviews, testimonials or social proof early.",
    product: "brand", angle: "Founder insight",
    text: "What worked for us (a small wellness brand, launched last month) was asking only verified buyers, and only after they'd used the product for a couple of weeks. Earlier than that, people have nothing real to say. We use a verified-review tool so every review is tied to an actual order, which also makes them more believable to new visitors. Expect fewer reviews than you'd like. The few detailed ones are worth more than a pile of five-word ratings.",
    why: "Founder-friendly subreddit. We genuinely have verified reviews, so this is honest experience.",
    extraRules: "Founder-friendly subreddit: it's fine to say who we are once, but don't link."
  },
  {
    subreddit: "IndiaCoffee",
    thread_title: "Find a post from the last 3 days: does cold brew have more caffeine than hot coffee?",
    thread_summary: "Look for someone comparing cold brew with hot coffee for caffeine, acidity or taste.",
    product: "mornings", angle: "Education",
    text: "It depends on how strong it's made and how much you drink. Cold brew is usually brewed as a concentrate with a lot of coffee, so an undiluted glass can carry more caffeine than a regular cup. Diluted 1 to 1, it often lands about the same. If you're watching caffeine for sleep, the timing matters more than the brew method, so keep the big glass of cold brew to the morning.",
    why: "A recurring coffee-community question that fits our caffeine-timing message without repeating 24 Nov's cut-off-time card."
  },
  {
    subreddit: "sleep",
    thread_title: "Find a post from the last 3 days: I sleep 8 hours but still wake up exhausted",
    thread_summary: "Look for someone who gets enough hours but wakes unrefreshed.",
    product: "nights", angle: "Education",
    text: "If the hours are there but you still wake up wrecked, the problem is usually sleep quality. The common culprits are alcohol in the evening, a late heavy dinner, an irregular wake time, and a warm or bright room. Loud snoring, gasping, or a partner noticing pauses in your breathing are signs of sleep apnea, which is common and very treatable, so that's worth a doctor's visit. Try a fixed wake time for two weeks first and see what changes.",
    why: "A classic r/sleep question. The apnea pointer is genuinely helpful and keeps us on the right side of medical advice.",
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
  date, platform: "linkedin", slot: 1, status: "pending", product: "nights",
  angle: "Category take", format: "Monday: competitor and category view",
  trend: "Sleep is becoming one of the busiest categories in Indian wellness, with several night-time drinks and chewables launched this year",
  why: "Monday's category slot. It comments on the move, not on any brand, and ends on what buyers should check.",
  competitor: "Several Indian launches this year built night products around glycine, magnesium and L-theanine, some at lower doses than the studies used. We don't name anyone; we set the standard instead.",
  source: "https://www.entrepreneur.com/en-in/news-and-trends/inside-the-rise-and-risks-of-indias-booming-nutraceutical/500629",
  image: {
    concept: "READY: back of the Nights pack, showing every dose, no added sugar, no maltodextrin, no melatonin and KSM-66 root extract, with the band EVERY DOSE ON THE PACK (1080x1350)",
    source: "On the PC that runs the desk: SILT_Content_Desk/linkedin-images/2026-11-20_every-dose-backup.jpg (made on 20 Nov and not used yet)",
    overlay: "EVERY DOSE ON THE PACK (already on the image)",
    alt: "Ask for a new image if you'd rather not repeat the same visual style two posts running.",
    link: "https://drive.google.com/drive/folders/1nYAaYJBBAt23LYV2CQ-RF4nZA4qsLMxk"
  },
  text: "Sleep has quietly become one of the busiest shelves in Indian wellness.\n\nThis year several Indian brands launched night-time drinks, powders and chewables built around ingredients like glycine, magnesium and L-theanine, many of them without melatonin. Funding into Indian supplement startups is now estimated at over $500 million, and sleep is where a lot of the new launches are landing.\n\nWe think that's good for buyers, as long as the labels keep up. Three things are worth checking on any sleep product.\n\nFirst, the dose next to each ingredient, not just the ingredient list. Glycine studies, for example, mostly used 3 g.\n\nSecond, whether it contains melatonin, and how much. It's a hormone, and US sleep doctors advise against it for chronic insomnia in adults.\n\nThird, whether the brand shows lab reports or only badges.\n\nThat's the standard we hold SILT Nights to: 3 g glycine, every dose printed, no melatonin, and a lab report for each ingredient.\n\nWhat do you look at first when you pick up a supplement?\n\n#preventivehealth #D2CIndia"
}];

const xlen = t => [...t.replace(/https?:\/\/\S+/g, "x".repeat(23))].reduce((n, ch) => { const p = ch.codePointAt(0); return n + ((p <= 4351 || (p >= 8192 && p <= 8205) || (p >= 8208 && p <= 8223) || (p >= 8242 && p <= 8247)) ? 1 : 2); }, 0);
const fails = [];
for (const p of x) {
  const n = xlen(p.text); console.log(`x${p.slot} ${n}`);
  if (n > 280) fails.push(`x${p.slot} too long`);
  if (p.poll && (p.poll.options.length < 2 || p.poll.options.length > 4 || p.poll.options.some(o => [...o].length > 25) || !p.poll.followup)) fails.push(`x${p.slot} poll invalid`);
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
  summary: "Monday 23 Nov, drafted at 3 PM on the day. The 22 Nov 6 PM run never fired (app closed), and the catch-up run drafted Tuesday instead. Quiet news week. The lead hook is the large JAMA coffee and tea study, plus the second quiz poll (workday issues), a category take on the boom in Indian sleep products for LinkedIn, and practical how-to-use and hydration posts. Reddit comments are from the comment bank, because Claude can't open Reddit.",
  trends: [
    { topic: "JAMA: moderate coffee or tea linked to lower dementia risk (131,821 people, 43 years)", angle: "Observational, so no proof of cause. On X today.", platform: "X", source: "https://content.health.harvard.edu/blog/harvard-study-a-couple-of-daily-cups-of-coffee-or-tea-linked-to-lower-dementia-risk" },
    { topic: "Indian nutraceutical funding estimated above $500M while scrutiny rises", angle: "Category takes on X and LinkedIn today.", platform: "X / LinkedIn", source: "https://www.entrepreneur.com/en-in/news-and-trends/inside-the-rise-and-risks-of-indias-booming-nutraceutical/500629" },
    { topic: "Sleep products crowding the Indian shelf (night drinks and chewables launched this year)", angle: "LinkedIn category take, with no brands named.", platform: "LinkedIn", source: "https://www.entrepreneur.com/en-in/news-and-trends/inside-the-rise-and-risks-of-indias-booming-nutraceutical/500629" },
    { topic: "Mild dehydration lowers mood and focus (Journal of Nutrition, 2012)", angle: "A cheap fix for the 3 PM slump. On X and r/productivity.", platform: "X / Reddit", source: "https://pubmed.ncbi.nlm.nih.gov/22190027/" },
    { topic: "Quiz question 2: main workday issue", angle: "Monday poll. The follow-up goes out Tuesday.", platform: "X", source: "https://siltnutrition.com/pages/quiz" },
    { topic: "To-do list before bed helps people fall asleep faster (Scullin et al., 2018)", angle: "Sunday-night anxiety comment on r/bangalore.", platform: "Reddit", source: "https://pubmed.ncbi.nlm.nih.gov/29058942/" }
  ],
  instagram: "Not re-checked today. The latest seen were the 19 Nov 'Sleep isn't one problem, it's five' reel and the 18 Nov verified-reviews post.",
  competitors: "There are no named competitor moves in the news this week. Today's LinkedIn post covers the category trend without naming brands, per the playbook.",
  linkedin_trends: [
    { topic: "Indian nutraceutical funding above $500M", date: "Dec 2025 analysis", day: "Mon", angle: "Category context for today's post.", source: "https://www.entrepreneur.com/en-in/news-and-trends/inside-the-rise-and-risks-of-indias-booming-nutraceutical/500629" },
    { topic: "JAMA coffee and tea dementia study", date: "Feb 2026 (still widely covered)", day: "Wed", angle: "Could feed Wednesday's ingredient post on caffeine dose.", source: "https://content.health.harvard.edu/blog/harvard-study-a-couple-of-daily-cups-of-coffee-or-tea-linked-to-lower-dementia-risk" }
  ]
};
fs.writeFileSync(path.join(__dirname, `brief-${date}.json`), JSON.stringify(brief, null, 2));
console.log(`wrote ${all.length} drafts and the brief for ${date}`);
