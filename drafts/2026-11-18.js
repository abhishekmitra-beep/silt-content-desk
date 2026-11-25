// Drafts for 2026-11-18 (Wednesday, LinkedIn ingredient day). Chrome not connected, so comments are a bank.
const fs = require("fs");
const path = require("path");
const date = "2026-11-18";
const dir = path.join(__dirname, "posts");
const wlen = s => [...s].reduce((n, c) => n + (c.charCodeAt(0) > 127 ? 2 : 1), 0);
const feed = sub => `https://www.reddit.com/r/${sub}/new/`;
const COMMON = "NON-NEGOTIABLE: reply only to a thread posted in the last 3 days (check the timestamp under the title). If nothing that recent fits, skip this comment and mark it Rejected with a note. Prefer threads with few comments, adapt the first line to what OP actually said, and add no links and no pitch.";

const x = [
 { product:"nights", angle:"Trend reply", format:"Single post",
  trend:"ResMed survey: 71% of Indian workers say poor sleep hurts their work, 58% say workload interferes with sleep",
  why:"Gives a number to the exact problem Nights is built around, with a question to start replies.",
  source:"https://indiantelevision.com/mam/71-per-cent-of-indian-workers-say-lack-of-sleep-hurts-productivity-resmed-survey/",
  text:"A ResMed survey: 71% of Indian workers say poor sleep hurts their work, and 58% say workload gets in the way of sleep.\n\nThat is the loop we built SILT Nights for: a wind-down ritual with 3 g glycine and 250 mg magnesium.\n\nWhat's the one thing that wrecks your sleep on a workday?" },
 { product:"mornings", angle:"Trend reply", format:"Single post",
  trend:"British Journal of Nutrition trial: high-dose caffeine plus L-theanine improved attention and reaction time after one night of no sleep",
  why:"Honest read of a caffeine plus L-theanine study that notes its limits. Supports Mornings without a cure or performance claim.",
  source:"https://www.psypost.org/study-suggests-l-theanine-caffeine-combo-improves-focus-after-sleep-loss/",
  text:"A trial found caffeine plus L-theanine improved attention and reaction time after one night without sleep.\n\nIt was one night and a high dose, so it says little about a normal Tuesday. The pairing in SILT Mornings is 80 mg caffeine with 200 mg L-theanine, written on the pack." },
 { product:"brand", angle:"Regulation / transparency", format:"Single post",
  trend:"FSSAI warned nutraceutical makers in October over labelling lapses, including missing mandatory statements",
  why:"Regulation story that points back to printed doses. No claims, no competitor named.",
  source:"https://www.omnicuris.com/medshots/daily_updates/fssai-nutraceutical-labelling-norms-warning-advisory_20-Oct-26_08-09",
  text:"FSSAI warned supplement makers in October about labelling lapses.\n\nA pack is the one document every buyer gets, so we treat it like one. Every dose is printed in mg and every ingredient has a lab report.\n\nWhat's the first thing you look for on a supplement label?" },
 { product:"brand", angle:"Founder / social proof", format:"Single post",
  trend:"Founder story: why Mornings is 80 mg caffeine",
  why:"Third-person founder story that explains a product choice with a number and ends with a question.",
  source:"https://siltnutrition.com",
  text:"Why 80 mg of caffeine and not 200? Our founder spent 10+ years in corporate and wanted a morning drink that didn't wreck his night.\n\nA filter coffee can be 60 to 100 mg, so Mornings is roughly one small cup, paired with 200 mg L-theanine.\n\nHow many coffees are you at by 3 PM?" },
 { product:"education", angle:"Education", format:"Single post",
  trend:"Wearable ultrasound patch put people into REM 43 minutes sooner, 28 participants",
  why:"Read-past-the-headline education in our evidence-first voice, on a tiny study.",
  source:"https://www.sciencedaily.com/releases/2026/11/261116014842.htm",
  text:"A wearable ultrasound patch got people into REM 43 minutes sooner.\n\nThe study had 28 participants. That makes it interesting and early, and nowhere near advice for your bedtime.\n\nSmall studies are how big ideas start. We wait for the bigger ones before we build anything on them." }
];

const c = [
 ["IndianFitness","How do I tell if a supplement label is legit? What should I check in India?","Look for someone asking how to read a supplement label, spot fake or underdosed products, or what the numbers mean.","brand",
  "A few quick checks: an FSSAI licence number on the pack, every ingredient with its dose in mg, and no 'proprietary blend' where the total is listed but not the parts. Then check the form of each ingredient. Magnesium is a good example, because a label that says 1,000 mg may contain only around 140 mg of actual magnesium, depending on the compound. If a brand will show you a lab report for what's in the pack, that is a good sign too.",
  "Label literacy is a recurring question and fits our transparency position with no pitch."],
 ["developersIndia","Burnout: I can't switch off after work and my mind keeps racing at night","Look for a dev describing racing thoughts at night, overwork, or poor sleep after long days.","nights",
  "A few things that help many people: a fixed shutdown time with a short written list of tomorrow's tasks, so your head stops holding them, and 10 minutes of slow breathing or a walk before bed. Keep the last coffee before 2 PM, since caffeine has a half-life of around 5 hours. If this has been going on for months or comes with low mood, talking to a doctor or therapist is worth it, and a supplement isn't a substitute.",
  "Racing mind at night is our core Nights audience. Advice is behavioural and safe."],
 ["indianstartups","Founders: how do you manage sleep and burnout while building?","Look for a founder asking how others keep health and sleep intact during a launch or crunch.","brand",
  "We launched a supplement brand last month, so we know this one. What helped our founder: a fixed wake time even after a bad night, no calls after 9 PM unless something is on fire, and one hard task done before noon. Sleep went first when he let it slide, and decisions the next day got worse. Treat sleep like a meeting you don't cancel.",
  "Founder-friendly subreddit where saying who we are is welcome, and the story is relatable."],
 ["Fitness_India","Vitamin D for office workers in India: should I get tested before taking anything?","Look for someone with an indoor job asking if they need vitamin D, how much, or whether to test.","mornings",
  "Many Indians who work indoors do have low vitamin D, even in a sunny country, because of clothing, pollution and office hours. The sensible order is to get a blood test (25-OH vitamin D) first, then decide with a doctor, since the right dose depends on the result. Ten to fifteen minutes of midday sun on arms and legs a few days a week also helps. Avoid big random doses without a test.",
  "D3 is in Mornings at 100% RDA. A test-first answer keeps us honest and avoids deficiency claims."],
 ["productivity","How do I build a morning routine that actually sticks?","Look for someone who keeps abandoning morning routines or wants a simple one.","mornings",
  "Start smaller than feels useful. Pick one anchor that already happens, like making your first drink, and attach one tiny action to it for two weeks: water, 5 minutes of sunlight, or 10 pushups. Add the second habit only after the first stops needing willpower. Most routines fail because they have 7 steps on day one. Keeping the wake-up time the same on weekends also does a lot of the work.",
  "Routine building is our brand's frame (rituals), but this is pure help."],
 ["GetMotivated","How do you stay consistent with health habits after the first two weeks?","Look for someone who started strong on sleep, diet or exercise and is now slipping.","both",
  "What works for many people is making the habit nearly effortless and tying it to something fixed. Same time, same place, same cue. Track it with a simple tick on a calendar and aim never to miss twice in a row. A miss is normal, and a second miss is how a habit ends. Week three is usually the dip, so plan for it.",
  "Consistency is what a daily ritual product depends on. Zero pitch."],
 ["StartUpIndia","First-time founder: what does it take to launch a food or supplement product in India legally?","Look for a founder asking about FSSAI licence, lab testing, labelling or claims for a food or supplement product.","brand",
  "From our experience launching a supplement brand: you need an FSSAI licence for the business, products made at a licensed facility, and labels that follow FSSAI rules, including the mandatory statements. Be careful with claims, because ASCI reviewed 61 nutraceutical ads this year and found 60 broke the code. Talk about what an ingredient is and the dose studied, never that it treats or cures anything. We also had every ingredient tested by a lab, which costs more but means we are not guessing.",
  "Founder subreddit, honest operational help. Strongest proof is regulation awareness."],
 ["IndiaCoffee","Should I wait after waking before drinking coffee? Does coffee on an empty stomach hurt?","Look for someone asking about the best time for the first coffee, or acidity and jitters on an empty stomach.","mornings",
  "The advice to wait 90 minutes after waking to avoid a cortisol clash is popular, but the evidence behind it is thin. What is better supported: if coffee on an empty stomach gives you acidity or jitters, have it with or after food, and keep the total reasonable. Many adults do fine up to around 400 mg a day, and with a half-life of about 5 hours the last cup should be early afternoon. Try it for a week each way and see what your own body says.",
  "Honest myth-check on a common question. Reinforces that we are careful with evidence."]
];
const comments = c.map((r,i)=>({
  date, platform:"reddit_comment", slot:i+1, status:"pending", account:"u/Silt_Nutrition", subreddit:r[0],
  thread_title:"Find a post from the last 3 days: "+r[1], thread_url:feed(r[0]), thread_summary:r[2],
  product:r[3], angle:"Community help", text:r[4], why:r[5], max_age_days:3,
  format:"Comment bank (pick a post from the last 3 days)",
  rules:`${COMMON} Check the r/${r[0]} sidebar before commenting.`
}));

const l = { date, platform:"linkedin", slot:1, status:"pending", product:"nights",
 angle:"Ingredient series: magnesium", format:"Wednesday: ingredient series (document carousel)",
 trend:"2026 Nature and Science of Sleep trial: 250 mg elemental magnesium as bisglycinate for 4 weeks gave a modest improvement in self-reported insomnia severity",
 why:"Follows the weekly plan (Wed 18 Nov, magnesium). Shows the label trap of compound weight against elemental magnesium, gives the evidence plainly and says where it is thin. TEAM CHECK: confirm the 250 mg on our pack is elemental magnesium and confirm the bisglycinate percentage from our COA before posting.",
 competitor:"Many brands print compound weight (for example '1,000 mg magnesium glycinate') in big letters. Answers that pattern without naming anyone.",
 source:"https://www.tandfonline.com/doi/abs/10.2147/NSS.S524348",
 image:{ concept:"Back-of-pack shot of a SILT Nights stick box with the 250 mg magnesium line readable, plus a crop of the magnesium lab report for the last carousel slide",
  source:"Shoot Photos folder on Drive (back-of-pack shot) and the magnesium COA PDF.",
  overlay:"SILT logo top corner. One line: 250 mg, printed on the pack.",
  alt:"Carousel: elemental against compound weight, why bisglycinate, what the 4-week trial found, where evidence is thin, and the lab report.",
  link:"https://drive.google.com/drive/folders/1D6suq4BOLzr2PGow-FK7A-9LgFDIW9Bz" },
 text:"Our Nights stick has 250 mg of magnesium. That number means different things on different labels, so here is how to read it.\n\nMany labels show the weight of the whole compound, not the magnesium inside it. Magnesium bisglycinate is only about 14% magnesium by weight, so a 1,000 mg tablet can hold around 140 mg of actual magnesium. When you compare products, look for the elemental figure.\n\nWe use bisglycinate because it is generally gentle on the stomach, and we print the dose on the pack.\n\nWhat do the studies say? A four-week, placebo-controlled trial in adults with poor sleep gave 250 mg of elemental magnesium as bisglycinate and reported a modest improvement in insomnia severity. Sleep was self-reported, and the authors asked for longer studies with objective measures. A recent review of 12 trials was more cautious still. The evidence looks strongest for people who are low in magnesium and weaker for everyone else.\n\nThat is why magnesium is one of four ingredients in Nights and not the whole story. Each ingredient has a lab report on our site that you can read next to its dose.\n\nWhen you compare a magnesium product, what do you look at first: the elemental dose, the form, or the lab report?\n\n#magnesium #nutrition" };

const posts = [
 ...x.map((p,i)=>({date,platform:"x",slot:i+1,status:"pending",...p,id:`${date}_x${i+1}`})),
 ...comments.map(p=>({...p,id:`${date}_c${p.slot}`})),
 {...l,id:`${date}_l1`}
];
for (const p of posts) {
  const t = p.text;
  if (/[–—]/.test(t)) throw new Error(p.id+" dash");
  if (p.platform==="x" && wlen(t)>280) throw new Error(p.id+" x len "+wlen(t));
  if (p.platform==="linkedin" && (t.length>3000 || /\bI\b|\bmy\b/.test(t))) throw new Error(p.id+" li");
  if (p.platform==="reddit_comment" && (t.length>1200 || /\bI\b|\bI'm\b|\bmy\b/.test(t))) throw new Error(p.id+" comment");
  fs.writeFileSync(path.join(dir,p.id+".json"), JSON.stringify(p,null,2));
  console.log(p.id, p.platform==="x"?wlen(t):t.length);
}
const brief = { date,
 summary:"Wednesday 18 Nov. Themes: workday sleep (ResMed 71%), caffeine plus L-theanine evidence with its limits, FSSAI's October labelling warning, a founder story on the 80 mg caffeine choice and a small-study reality check on the ultrasound sleep patch. LinkedIn is the magnesium ingredient post from the weekly plan. Reddit could not be read live (Chrome not connected), so there are 8 bank comments on label reading, burnout, founder sleep, vitamin D, routines, habits, launching in India and first-coffee timing.",
 trends:[
  {topic:"ResMed survey: 71% of Indian workers say poor sleep hurts work; 58% say workload interferes with sleep",angle:"Nights: the workday sleep loop",platform:"X",source:"https://indiantelevision.com/mam/71-per-cent-of-indian-workers-say-lack-of-sleep-hurts-productivity-resmed-survey/"},
  {topic:"Caffeine plus L-theanine improved attention after one night of sleep loss (Brit J Nutr, high dose, one night)",angle:"Mornings: honest read with limits",platform:"X",source:"https://www.psypost.org/study-suggests-l-theanine-caffeine-combo-improves-focus-after-sleep-loss/"},
  {topic:"FSSAI October advisory to nutraceutical makers on labelling lapses",angle:"Transparency: the pack is a document",platform:"X",source:"https://www.omnicuris.com/medshots/daily_updates/fssai-nutraceutical-labelling-norms-warning-advisory_20-Oct-26_08-09"},
  {topic:"Magnesium bisglycinate 250 mg elemental, 4-week RCT: modest self-reported benefit",angle:"LinkedIn ingredient post and Nights",platform:"LinkedIn",source:"https://www.tandfonline.com/doi/abs/10.2147/NSS.S524348"},
  {topic:"Wearable ultrasound patch: REM 43 minutes sooner (28 participants)",angle:"Education, small study",platform:"X",source:"https://www.sciencedaily.com/releases/2026/11/261116014842.htm"},
  {topic:"KSM-66 ashwagandha trials mostly use 600 mg a day; coverage is largely promotional and cortisol results are mixed",angle:"Background only. Our Nights has 300 mg, so avoid implying a match; use 'the dose studied' wording",platform:"Research",source:"https://www.nutraingredients.com/Article/2026/01/19/ashwagandha-lowers-cortisol-in-athletes/"}
 ],
 linkedin_trends:[
  {topic:"Overwork and burnout in Indian tech (Blind survey: 72% over 48 hours a week; Onsurity-KCCI: 43% report work-linked health issues)",date:"2025 to 2026 (no new November survey found)",day:"Evergreen",angle:"Friday or later building-in-public: what a desk-job ritual looks like",source:"https://www.deccanherald.com/india/one-in-every-fourth-it-professional-in-india-clocks-in-70-hours-or-more-per-week-face-burnout-survey-3470880"},
  {topic:"FSSAI labelling advisory and NMN notice for supplements",date:"Oct and Aug 2026",day:"Friday 20 Nov",angle:"The Friday post on what we checked on our own labels",source:"https://www.outlookindia.com/national/fssai-warns-nutraceutical-and-health-supplement-makers-over-labelling-lapses"},
  {topic:"FMCG moving into D2C wellness: HUL and OZiva, USV and Wellbeing Nutrition, Marico and True Elements, Mankind and Upakarma",date:"2026",day:"Monday 23 Nov",angle:"Category view from a small brand's seat",source:"https://inc42.com/buzz/hul-acquires-stakes-in-oziva-wellbeing-nutrition-to-bolster-health-wellness-play"}
 ],
 linkedin_competitors:[
  {brand:"Large FMCG groups",what:"HUL buying out OZiva in tranches and taking a stake in Wellbeing Nutrition; deal values differ across reports",takeaway:"Scale is moving into the category, so being checkable is how a small brand stands out.",source:"https://inc42.com/buzz/hul-acquires-stakes-in-oziva-wellbeing-nutrition-to-bolster-health-wellness-play"},
  {brand:"Wellbeing Nutrition",what:"USV agreed to buy 79% of parent Nutritionalab; reported FY25 revenue about Rs 170 crore",takeaway:"Retail and pharma distribution are the growth route. We win on transparency first.",source:"https://inc42.com/?p=371843"},
  {brand:"Independent ranking, 6 Nov",what:"Scored 15 Indian supplement brands on verifiable evidence and flagged brands with no report page",takeaway:"Lab report pages are becoming a buying test. Link ours in every ingredient post.",source:"https://healthyhey.com/blogs/best-supplements-blog/best-supplement-brands-india-2026"}
 ],
 instagram:"No new reels since 16 Nov (nutritionist 'wasted money' series; part 2, the Skip list, is still to come). Profile shows 1,831 followers. Newest grid items: 16 Nov, 9 Nov (fibre gap) and 22 Oct reels. Comments could not be read without logging in, so the stuck-delivery complaint under the fibre reel is still worth checking.",
 competitors:"No new Indian rival moves found in the last 7 days. Structural moves continue (HUL, USV, Marico, Mankind buying into wellness brands). No competitor was named in any public draft."
};
fs.writeFileSync(path.join(__dirname,`brief-${date}.json`), JSON.stringify(brief,null,2));
