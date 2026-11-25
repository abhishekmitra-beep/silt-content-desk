// Drafts for 2026-11-19 (Thursday, no LinkedIn). Reddit is blocked for Claude, so comments are a bank.
const fs = require("fs");
const path = require("path");
const date = "2026-11-19";
const dir = path.join(__dirname, "posts");
const wlen = s => [...s].reduce((n, c) => n + (c.charCodeAt(0) > 127 ? 2 : 1), 0);
const feed = sub => `https://www.reddit.com/r/${sub}/new/`;
const COMMON = "NON-NEGOTIABLE: reply only to a thread posted in the last 3 days (check the timestamp under the title). If nothing that recent fits, skip this comment and mark it Rejected with a note. Prefer threads with few comments, adapt the first line to what OP actually said, and add no links and no pitch.";

const x = [
 { product:"nights", angle:"Trend reply", format:"Single post",
  trend:"UK Biobank study (reported 17 Nov): coffee's link to lower Parkinson's risk showed up mainly in fast caffeine metabolisers",
  why:"Uses a fresh coffee study to land the sleep point (caffeine lingers), with the observational caveat up front. No product named.",
  source:"https://dailycoffeenews.com/2026/11/17/study-says-genes-may-determine-coffees-link-to-parkinsons-risk/",
  text:"A new UK Biobank study found coffee's link to lower Parkinson's risk showed up mainly in people who clear caffeine fast.\n\nIt's observational. The everyday lesson is about sleep: caffeine lingers around 5 hours, longer if you clear it slowly.\n\nWhat time is your last cup?" },
 { product:"mornings", angle:"Trend reply", format:"Single post",
  trend:"University of Copenhagen: frequent coffee drinkers had more gut microbial diversity and lower small-intestine pH (US News, 13 Nov)",
  why:"Coffee plus gut is exactly the Mornings pairing. States that the study does not show cause, then names the doses.",
  source:"https://www.usnews.com/news/health-news/articles/2026-11-13/coffee-gets-your-colon-hopping-study-finds",
  text:"A Copenhagen study: regular coffee drinkers had a more diverse gut microbiome and lower pH in the small intestine.\n\nIt doesn't show cause yet. We already pair the two in SILT Mornings: 80 mg caffeine with 5 g PHGG fibre and 6 billion probiotics.\n\nDoes coffee agree with your gut?" },
 { product:"brand", angle:"Regulation / transparency", format:"Single post",
  trend:"FSSAI acted against six nutraceutical manufacturers on 16 Nov (expired materials, hygiene, thiamin above the daily reference per serving, labelling failures)",
  why:"This week's biggest regulation story. Turns 'vitamin above the limit' into a point about 100% RDA and lab reports. No firm named.",
  source:"https://www.deccanchronicle.com/lifestyle/food/fssai-acts-against-six-nutraceutical-manufacturers-over-violations-2004894",
  text:"FSSAI acted against six nutraceutical makers this week, citing expired materials, poor hygiene and a vitamin above the daily limit per serving.\n\nMore isn't better. The vitamins in SILT Mornings sit at 100% RDA, and every ingredient has a lab report.\n\nDo you check % RDA on labels?" },
 { product:"brand", angle:"Brand / social proof", format:"Single post",
  trend:"Our own Instagram: nutritionist series part 2, the Skip list (17 Nov)",
  why:"Carries the Instagram series to X with no product or dose, and asks a question people enjoy answering.",
  source:"https://www.instagram.com/silt.nutrition/reel/Df2BDe-zmo3/",
  text:"Part 2 of our nutritionist's series is the skip list: BCAAs, melatonin, detox drinks and fat burners.\n\nEach one is overhyped, thinly researched or hard on the stomach, so the money goes further on sleep, fibre and the basics.\n\nWhat's one supplement you stopped buying?" },
 { product:"education", angle:"Education", format:"Single post",
  trend:"PNAS mouse study (Princeton, Ludwig Institute): gut bacteria starved of fibre start digesting the gut's mucus lining",
  why:"Read-past-the-headline education. Clear that it is a mouse study, practical Indian food takeaway, no product.",
  source:"https://www.sciencedaily.com/releases/2026/11/261105083622.htm",
  text:"A mouse study making the rounds: gut bacteria starved of fibre start feeding on the gut's own mucus lining.\n\nIt was in mice, so it says little yet about people. The sensible move is the same either way: more dal, fruit and whole grains.\n\nHow's your fibre today?" }
];

const c = [
 ["IndiaCoffee","Why does coffee send me straight to the toilet? Is that normal?","Look for someone asking why coffee causes urgency, bloating or an upset stomach.","mornings",
  "Very normal. Coffee gets the colon moving within minutes for a lot of people, and decaf does it for some too, so it isn't only the caffeine. A Copenhagen study this month also found regular coffee drinkers had a more diverse gut microbiome, though what that means for health is still open. If the urgency is a problem, try a smaller cup with food rather than on an empty stomach, and check whether milk makes it worse, since lactose is a common second culprit.",
  "Recurring question, ties to this week's coffee and gut study, zero pitch."],
 ["sleep","Waking up at 3 or 4 AM every night and can't fall back asleep","Look for someone describing early waking without a medical diagnosis or medication question.","nights",
  "Early waking often has boring causes worth ruling out first: alcohol in the evening (it wears off in the second half of the night), caffeine after early afternoon, a warm room, or going to bed so early that your sleep need is met by 3 AM. If you wake, keep the lights and phone off, and if you're still awake after about 20 minutes, get up and do something dull in dim light until you feel sleepy. A fixed wake time, even after a bad night, builds sleep pressure for the next one. If it has gone on for weeks alongside low mood, it's worth raising with a doctor.",
  "3 AM waking is one of our quiz answers and a core Nights pain point. Careful sub, so behavioural only."],
 ["IndianFitness","Is ashwagandha actually worth taking? What dose did the studies use?","Look for someone asking whether ashwagandha works or how much to take, not a medical or medication question.","nights",
  "Most human trials used a root extract (KSM-66 is the most studied) at 300 to 600 mg a day, often 600 mg split into two doses, for about 8 weeks. Results on stress and sleep scores were positive but modest, and many trials were small or industry funded, so treat it as 'might help a bit' rather than a must. Give it 6 to 8 weeks before judging. Skip it if you're pregnant or have a thyroid condition, and check with a doctor if you take sedatives or thyroid medication.",
  "Dose honesty per LEARNINGS: states the studied range openly. No mention of our 300 mg."],
 ["Fitness_India","How do I stop sugar cravings after lunch and in the evening?","Look for someone struggling with sweet cravings or snacking at work.","mornings",
  "A few things make a real difference. Put protein and fibre on the lunch plate (dal, chana, curd, a sabzi with some bulk) so the meal keeps you full longer, and drink water before reaching for a snack, since thirst often reads as hunger. Short sleep is the one people miss: a bad night raises appetite the next day, especially for sweet food. Keep a planned snack like fruit with a handful of nuts for 4 PM so the craving doesn't make the decision for you.",
  "Hunger cravings is one of our quiz answers. Practical Indian food help."],
 ["Nootropics","What ratio of caffeine to L-theanine do the studies actually use?","Look for someone asking about caffeine and L-theanine dosing or ratios.","mornings",
  "The classic studies mostly used around 1:2, for example 50 mg caffeine with 100 mg L-theanine, or 40 mg with 97 mg, and a few used higher doses like 150 mg with 250 mg. The most consistent findings were for attention and task switching, measured within a couple of hours, and the effects were small. There's no strong evidence that one exact ratio is best. In practice, keeping the caffeine moderate matters more than the ratio, and many people find the theanine takes the edge off jitters.",
  "Careful sub that values citations. Study doses only, no product."],
 ["bangalore","Quick healthy breakfast ideas before a long commute to office?","Look for someone asking for fast breakfasts, office-goer meal prep, or eating before a commute.","mornings",
  "Things that take under 10 minutes and hold you till lunch: overnight oats with curd and a banana, besan or moong dal chilla (the batter keeps 2 days in the fridge), boiled eggs with a fruit, or poha with peanuts and some sprouts thrown in. The trick is getting protein and some fibre in, so you don't crash by 11 and grab whatever the canteen has. If you're out the door at 7, prep the night before and eat it in the cab.",
  "Local, useful and food-specific. Mornings audience, no pitch."],
 ["StartUpIndia","D2C founders: how did you get your first 100 customers?","Look for a founder asking how others found early customers or validated demand before launch.","brand",
  "For us it was a pre-booking list built before launch. We had 1,870 pre-bookings by the time we launched in late October, and about 250 people bought in the first 15 days. The most useful thing we did was ask pre-bookers what stopped them from buying similar products, and the answer shaped the product. The honest lesson: first customers come from people who already trust you, so build that list before you spend on ads.",
  "Founder sub where saying who we are is welcome. Real numbers from the playbook."],
 ["productivity","How do I stop scrolling my phone in bed?","Look for someone who loses sleep to late-night scrolling and wants a fix.","nights",
  "What works for most people is changing the setup rather than relying on willpower. Charge the phone outside the bedroom or across the room, and get a cheap alarm clock so there's no excuse. Pick a fixed phone-down time, say 30 minutes before bed, and swap the scroll for something easy like a paper book or a shower. The first week is the hard part. After that, falling asleep tends to get quicker, partly because you stop pushing bedtime later one video at a time.",
  "Evergreen question with fresh posts daily. Pure help."]
];
const comments = c.map((r,i)=>({
  date, platform:"reddit_comment", slot:i+1, status:"pending", account:"u/Silt_Nutrition", subreddit:r[0],
  thread_title:"Find a post from the last 3 days: "+r[1], thread_url:feed(r[0]), thread_summary:r[2],
  product:r[3], angle:"Community help", text:r[4], why:r[5], max_age_days:3,
  format:"Comment bank (pick a post from the last 3 days)",
  rules:`${COMMON} Check the r/${r[0]} sidebar before commenting.`
}));

const posts = [
 ...x.map((p,i)=>({date,platform:"x",slot:i+1,status:"pending",...p,id:`${date}_x${i+1}`})),
 ...comments.map(p=>({...p,id:`${date}_c${p.slot}`}))
];
for (const p of posts) {
  const t = p.text;
  if (/[–—]/.test(t)) throw new Error(p.id+" dash");
  if (p.platform==="x" && wlen(t)>280) throw new Error(p.id+" x len "+wlen(t));
  if (p.platform==="reddit_comment" && (t.length>1200 || /\bI\b|\bI'm\b|\bmy\b/.test(t))) throw new Error(p.id+" comment");
  fs.writeFileSync(path.join(dir,p.id+".json"), JSON.stringify(p,null,2));
  console.log(p.id, p.platform==="x"?wlen(t):t.length);
}
const brief = { date,
 summary:"Thursday 19 Nov. Themes: coffee and sleep (genes and caffeine clearance), coffee and the gut microbiome for Mornings, FSSAI's 16 Nov action against six nutraceutical makers, the Instagram skip list carried to X, and a mouse study on fibre and the gut lining. No LinkedIn (Thursday) and no poll. Reddit is blocked for Claude, so there are 8 bank comments on coffee and the toilet, 3 AM waking, ashwagandha doses, sugar cravings, caffeine and L-theanine ratios, office breakfasts, first 100 customers and phone scrolling in bed.",
 trends:[
  {topic:"Genes may shape coffee's link to Parkinson's risk; benefit seen mainly in fast caffeine metabolisers (UK Biobank, observational)",angle:"Nights: caffeine lingers, so time your last cup",platform:"X",source:"https://dailycoffeenews.com/2026/11/17/study-says-genes-may-determine-coffees-link-to-parkinsons-risk/"},
  {topic:"Coffee drinkers had more gut microbial diversity and lower small-intestine pH (University of Copenhagen)",angle:"Mornings: caffeine plus gut, with the no-cause caveat",platform:"X, Reddit r/IndiaCoffee",source:"https://www.usnews.com/news/health-news/articles/2026-11-13/coffee-gets-your-colon-hopping-study-finds"},
  {topic:"FSSAI action against six nutraceutical manufacturers, 16 Nov (expired materials, thiamin above the daily reference, labelling)",angle:"Transparency: 100% RDA and per-ingredient lab reports",platform:"X",source:"https://www.deccanchronicle.com/lifestyle/food/fssai-acts-against-six-nutraceutical-manufacturers-over-violations-2004894"},
  {topic:"Mouse study (PNAS): fibre-starved gut bacteria feed on the mucus lining",angle:"Education: mechanism, not proof in people",platform:"X",source:"https://www.sciencedaily.com/releases/2026/11/261105083622.htm"},
  {topic:"Coffee 2 to 3 cups a day linked to lower dementia risk; decaf showed no comparable link (JAMA, observational)",angle:"Held back to avoid a third coffee post. Usable later as an education post",platform:"Backlog",source:"https://www.sciencedaily.com/releases/2026/11/261105224550.htm"},
  {topic:"Fibre blend (resistant starch plus psyllium) improved gut measures in IBS without worsening symptoms (Eur J Nutr, Edith Cowan)",angle:"Backlog for a fibre education post; avoid any IBS treatment claim for PHGG",platform:"Backlog",source:"https://www.sciencedaily.com/releases/2026/11/261112230450.htm"},
  {topic:"Indian IT staff pushing back on late-night US meetings, right to disconnect",angle:"Already used (late US calls). Save for a Friday LinkedIn angle later",platform:"Backlog",source:"https://www.whalesbook.com/news/English/other/Indian-IT-Workers-Challenge-Late-Night-Meetings-With-US-Teams/6aec41b54fc30694db5e5bd7"},
  {topic:"L-theanine 31-trial meta-analysis (reported as Molecular Psychiatry 2026): modest acute stress effect",angle:"NOT USED: only found on secondary and vendor sites, primary paper not verified",platform:"Research",source:"https://www.reachlink.com/advice/anxiety/l-theanine-and-anxiety-evidence/"}
 ],
 instagram:"Two reels since the last check: 16 Nov 'Most supplements? Wasted money' (19 likes, 0 comments) and 17 Nov 'Part 2: the skip list' on BCAAs, melatonin, detox drinks and fat burners (11 likes, 0 comments). No customer complaints visible on either. Profile at 1,831 followers, unchanged. Comments can't be read in full without logging in.",
 competitors:"No new rival product moves found this week. Category news is regulatory: FSSAI's action against six manufacturers (16 Nov) and the Maharashtra FDA seizure (13 Nov). Wellness marketing coverage points to influencer and celebrity pushes and pharma-style claims ('nature's Ozempic'), which our evidence-first voice should keep contrasting without naming anyone. No competitor named in any public draft."
};
fs.writeFileSync(path.join(__dirname,`brief-${date}.json`), JSON.stringify(brief,null,2));
console.log("brief written, posts:", posts.length);
