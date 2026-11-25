// Drafts for 2026-11-17 (Tuesday, no LinkedIn). Run: node drafts/2026-11-17.js
// Writes drafts/2026-11-17.json and drafts/posts/2026-11-17_*.json, prints X lengths and checks dashes.
const fs = require("fs");
const path = require("path");
const date = "2026-11-17";
const DISCLOSE = "(Disclosure: I run a small supplement company, so weigh my take accordingly. No products or links in this post.)";

const x = [
  {
    product: "nights", angle: "Trend reply", format: "Single post",
    trend: "Sleep regularity beats duration: UK Biobank data links regular sleep timing to lower depression and anxiety risk",
    why: "Sleep regularity keeps coming up in this month's sleep news (irregular schedules and mood, napping and health). It lets us talk about a nightly ritual without a health claim.",
    source: "https://resolve.cambridge.org/core/journals/psychological-medicine/article/regular-sleep-patterns-not-just-duration-critical-for-mental-health-association-of-accelerometerderived-sleep-regularity-with-incident-depression-and-anxiety/5366789D09649C83C3F1B17C20A832D1",
    text: "In data on about 80,000 UK adults, regular sleepers had a 38% lower risk of later depression than irregular sleepers, even when the irregular group slept enough hours.\n\nSo we built SILT Nights as a same-time-every-night ritual: 3 g glycine, 250 mg magnesium, 300 mg ashwagandha."
  },
  {
    product: "mornings", angle: "Trend reply", format: "Single post",
    trend: "AHA preliminary study (2 Nov): energy drinks and stimulant supplements over-represented in FDA heart adverse event reports for 18 to 34 year olds",
    why: "Caffeine dose is in the news and our buyer drinks a lot of it. Printing 80 mg against the 400 mg daily ceiling is the calm, numbers-first answer.",
    source: "https://newsroom.heart.org/news/energy-drinks-stimulant-products-linked-to-cardiac-arrest-heart-attack-in-young-adults",
    text: "An American Heart Association abstract links energy drinks to more heart-event reports in young adults. It's an association, not proof.\n\nThe useful habit is counting milligrams. Regulators cite 400 mg a day for adults. One SILT Mornings stick is 80 mg, with 200 mg L-theanine."
  },
  {
    product: "brand", angle: "Regulation / transparency", format: "Single post",
    trend: "Maharashtra FDA seizes Rs 1.39 crore of unapproved nutraceuticals in a one-day statewide drive (13 Nov)",
    why: "Fresh Indian enforcement news. A short checklist for buyers positions us as the checkable brand without attacking anyone.",
    source: "https://drugscontrol.org/news-detail.php?newsid=46399",
    text: "Maharashtra FDA just seized ₹1.39 crore of unapproved supplements in a single day across 17 sites.\n\nBefore you buy any supplement, check three things: an FSSAI licence number, every dose in mg, and a lab report you can actually read.\n\nWhat else is on your list?"
  },
  {
    product: "brand", angle: "Founder / social proof", format: "Single post",
    trend: "Our own Instagram reel (16 Nov): our nutritionist on which supplements are worth it, with a Skip list coming as part 2",
    why: "Echoes this week's Instagram series, and an honest 'most supplements are wasted money' line from a supplement brand earns replies.",
    source: "https://www.instagram.com/silt.nutrition/reel/Dfzb6p2z3sZ/",
    text: "Odd thing for a supplement brand to say: most supplements are wasted money.\n\nOur nutritionist went through what's worth taking and what isn't. Part 2, the Skip list, lands on our Instagram this week.\n\nWhich supplement did you stop taking and never miss?"
  },
  {
    product: "education", angle: "Education", format: "Single post",
    trend: "MIT study (Nov 2026): gentle sounds during sleep amplify the brain's overnight CSF 'cleaning' waves",
    why: "Big sleep headline this week. Teaching people to read the limits of a study fits our evidence-first voice and doesn't sell anything.",
    source: "https://www.sciencedaily.com/releases/2026/11/261115085533.htm",
    text: "Headline this week: sounds played during sleep boost the brain's nighttime cleaning.\n\nWhat MIT found: gentle sounds made the fluid waves in the brain stronger. What it didn't show: that more waste got cleared, or that anyone slept better.\n\nRead past the headline."
  }
];

const reddit = [
  {
    subreddit: "Nootropics", flair: "Discussion", product: "education", angle: "Education", format: "Discussion",
    trend: "2026 crossover trial: caffeine + L-theanine adds nothing for strength, power or endurance in athletes",
    why: "Caffeine + theanine is the most-discussed stack on this sub. Sharing a result that cuts against the hype builds credibility for the founder account.",
    rules: "No sourcing or vendor talk, no brand mentions, no links to stores. Cite studies. Personal account only.",
    source: "https://www.nutritionaloutlook.com/view/rethinking-the-caffeine-theanine-synergy-in-sports-nutrition-formulations",
    title: "A 2026 crossover trial found caffeine + L-theanine did nothing extra for strength or endurance. So is focus the only real case for the stack?",
    text: "A crossover trial in competitive athletes this year tested caffeine alone, theanine alone and the two together on maximal strength, intermittent endurance and eye-hand coordination. The combination didn't beat caffeine on its own for physical output.\n\nThat lines up with how I've always thought about the stack. The older trials that made it popular (2008 and 2010) were about attention and task switching, not lifting more. The 2:1 theanine to caffeine ratio people quote comes from those.\n\nSo for people here who use it daily: is it the focus you notice, or mainly that the coffee jitters and the afternoon drop are smaller? And what ratio and timing settled in for you after a few months?\n\n" + DISCLOSE
  },
  {
    subreddit: "Biohackers", flair: "Discussion", product: "education", angle: "Education", format: "Discussion",
    trend: "Sleep regularity vs duration: UK Biobank accelerometer study on depression and anxiety risk",
    why: "This sub tracks sleep obsessively but mostly on duration and HRV. Regularity is a fresh angle that invites people to share their data.",
    rules: "No self-promotion or affiliate links. Personal account. Cite the study.",
    source: "https://resolve.cambridge.org/core/journals/psychological-medicine/article/regular-sleep-patterns-not-just-duration-critical-for-mental-health-association-of-accelerometerderived-sleep-regularity-with-incident-depression-and-anxiety/5366789D09649C83C3F1B17C20A832D1",
    title: "Regular sleepers had 38% lower depression risk than irregular ones in UK Biobank, even when the irregular group slept 7+ hours. Are you tracking regularity?",
    text: "This one changed how I look at my own sleep data. In a UK Biobank analysis of about 80,000 people with wrist accelerometers, regular sleepers had a 38% lower risk of later depression and a 33% lower risk of anxiety than irregular sleepers. The part that stuck with me is that irregular sleepers who still hit the recommended hours kept the higher risk.\n\nIt's observational, so it can't say irregular sleep causes anything. But most of us optimise for hours and deep sleep percentage, and very few apps even show a regularity score.\n\nFor anyone who has tried fixing their bed and wake times within a 30 minute window for a few weeks: did anything change in how you felt, or in your HRV and resting heart rate? And which wearable or app shows regularity well?\n\n" + DISCLOSE
  },
  {
    subreddit: "bangalore", flair: "Ask Bangalore", product: "education", angle: "Community", format: "Discussion",
    trend: "Loop Health Workforce Health Index 2026: high stress among urban Indian professionals up from 33.9% to 40.4%; short sleep in 41% of high-stress responses",
    why: "Our core buyer is the Bengaluru desk worker. A local, non-selling conversation about stress and sleep builds presence where they are.",
    rules: "No promotion or advertising. Personal account, no product, no links to a store. Use the right flair.",
    source: "https://www.medboundtimes.com/medicine/workforce-health-index-2026-recent-findings",
    title: "A 2026 survey says 4 in 10 urban professionals report high stress, up from about 1 in 3 last year. Bangaloreans, what actually helps you switch off after work?",
    text: "Saw the Workforce Health Index 2026 numbers from Loop Health. High reported stress went from 33.9% to 40.4% in a year, and among the high-stress group about 41% were also short on sleep.\n\nThat matches what I see around me. The commute eats an hour or two, US calls run late, and by the time the laptop closes it's 11 and the brain is still running.\n\nI'm curious what works for people in this city specifically. A walk in Cubbon on weekends, a hard stop on Slack, gym after work, no screens in the bedroom? Or have you just accepted it as the price of living here?\n\n" + DISCLOSE
  },
  {
    subreddit: "IndianFitness", flair: "Nutrition", product: "education", angle: "Education", format: "Discussion",
    trend: "AHA preliminary study: energy drinks and stimulant supplements over-represented in heart adverse event reports, about 45% in 18 to 34 year olds",
    why: "Pre-workout plus coffee plus energy drinks is common in gym culture here. A 'count your milligrams' thread is useful and invites people to share their numbers.",
    rules: "No promotional content. Personal account, no product names or store links.",
    source: "https://newsroom.heart.org/news/energy-drinks-stimulant-products-linked-to-cardiac-arrest-heart-attack-in-young-adults",
    title: "New AHA abstract on energy drinks and stimulant pre-workouts. Has anyone actually added up their daily caffeine in mg?",
    text: "The American Heart Association released a preliminary study this month. Researchers went through more than 28,000 FDA adverse event reports from 2017 to 2025, and heart events like cardiac arrest showed up far more often with energy drinks and stimulant products than with non-stimulant products. About 45% of those reports involved people aged 18 to 34.\n\nIt's an abstract, not peer reviewed yet, and reports like these can't tell you how common the problem is or which ingredient did it. Industry groups have already pushed back on that.\n\nStill, it made me add up a normal gym day for a friend: two coffees, a pre-workout with 200 to 300 mg, sometimes an energy drink before an evening session. That gets close to or past the 400 mg a day that regulators usually cite for healthy adults.\n\nWhat does your day look like in milligrams? And has anyone cut pre-workout and noticed a difference in sleep or resting heart rate?\n\n" + DISCLOSE
  },
  {
    subreddit: "productivity", flair: "Discussion", product: "education", angle: "Community", format: "Discussion",
    trend: "Brigham and Women's 19-year study links long, frequent and morning naps in older adults to declining health",
    why: "Napping is a live productivity debate. Using a fresh study carefully (older adults, association only) and asking for real routines keeps it helpful.",
    rules: "No self-promotion. Personal account, no links to products. Discussion posts welcome.",
    source: "https://www.sciencedaily.com/releases/2026/11/261112230505.htm",
    title: "Do afternoon naps make you more productive or wreck the rest of your day?",
    text: "A 19-year study out this month linked long, frequent and morning naps in older adults to declining health. It's about people in their 50s and up, and it's an association, so it says more about naps as a warning sign than about naps being bad. But it got me thinking about how mixed my own experience has been.\n\nA 15 to 20 minute nap after lunch, before 3 PM, used to save my afternoons when I was in corporate. Anything past 30 minutes and I'd wake up groggy, lose the next hour, and then struggle to fall asleep at night.\n\nFor people who nap on workdays: how long, what time, and do you use an alarm or caffeine before it? And for those who stopped napping, what replaced it?\n\n" + DISCLOSE
  }
];

const out = {};
x.forEach((p, i) => { out[`${date}_x${i + 1}`] = { ...p, date, platform: "x", slot: i + 1, status: "pending" }; });
reddit.forEach((p, i) => { out[`${date}_r${i + 1}`] = { ...p, date, platform: "reddit", slot: i + 1, status: "pending" }; });

const xlen = t => [...t.replace(/https?:\/\/\S+/g, "x".repeat(23))].reduce((n, c) => { const p = c.codePointAt(0); return n + ((p <= 4351 || (p >= 8192 && p <= 8205) || (p >= 8208 && p <= 8223) || (p >= 8242 && p <= 8247)) ? 1 : 2); }, 0);
let ok = true;
x.forEach((p, i) => { const n = xlen(p.text); console.log(`x${i + 1}`, n); if (n > 280) ok = false; });
const bad = Object.entries(out).filter(([, p]) => /[–—]/.test(JSON.stringify(p)));
console.log("dashes:", bad.map(b => b[0]));
if (bad.length) ok = false;
if (!ok) { console.error("FAILED checks"); process.exit(1); }

fs.writeFileSync(path.join(__dirname, `${date}.json`), JSON.stringify(out, null, 2));
for (const [id, p] of Object.entries(out)) fs.writeFileSync(path.join(__dirname, "posts", `${id}.json`), JSON.stringify(p, null, 2));
console.log("wrote", Object.keys(out).length, "posts");
