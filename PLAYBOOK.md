# SILT Content Desk playbook

Schedule: the drafting run happens every day at 6 PM and prepares TOMORROW's content, so the team reviews it the evening before posting.
Dashboard: https://silt-content-desk.pages.dev (Cloudflare Pages, D1 database `silt_desk`, team-password login). Setup notes are in `cloudflare/SETUP.md`.
Daily drafts are loaded with `node cloudflare/scripts/desk.mjs load <date>` (tables `posts` and `briefs`). Local copies live in `drafts/`.
The old claude.ai dashboard (https://claude.ai/artifact/LzWZY5zWnuXW38qmDRhZ9J) is retired and no longer updated.

## Brand facts (only claim what is here)
- SILT Nutrition: evidence-backed wellness rituals for busy professionals, from busy professionals. Founder Abhishek Mitra (10+ years corporate, 70+ scuba dives). Site siltnutrition.com, Instagram @silt.nutrition, founder IG @buildingwithmitra.
- SILT Mornings (Lemon Orange, 8.8 g stick): 80 mg caffeine + 200 mg L-theanine (steady energy), 5 g PHGG fibre (SunFibre) + 6 billion probiotics (gut), D3, K2, B12, C at 100% RDA.
- SILT Nights (Chamomile Lemon, 8.6 g stick): 3 g glycine (sleep onset), 250 mg elemental magnesium from bisglycinate (recovery; the 250 mg is the elemental magnesium, confirmed 17 Nov 2026, not the compound weight), 300 mg KSM-66 ashwagandha root + 200 mg L-theanine (stress, cortisol).
- Rs 900 for 15 sticks (about Rs 60 a day), Combo Rs 1,800. No melatonin, no added sugar, no maltodextrin. No proprietary blends; every dose on the pack. 19 ingredients, each with a lab report; 293 lab checks, 0 failed.
- Traction (Nov 2026): 1,870 pre-bookers; launched late Oct; 250 customers and 10 repeat buyers in 15 days; 4.9/5 on verified reviews.
- SILT does not treat deficiencies, insomnia or sleep disorders. Never make disease or cure claims (FSSAI).

## Plan of Action (from the team's "SILT Plan of Action" doc, added 24 Nov 2026)
Source: https://docs.google.com/document/d/1DoBWXG30ZUSUnY339FCdDC_S0PALbUzY (SILT Plan of Action.docx).

**Two pillars. Every draft gets a `pillar` field, "Adherence" or "Trust", and each day's set mixes both, roughly 3 Adherence to 2 Trust on X.**
- Adherence:
  - simple and convenient (one stick replaces the stack)
  - tasty (the tastiest night drink)
  - solves their problem, shown through reviews
  - cool (wellness celebrated, not medicinal)
- Trust: 100% honest, 100% transparent, 100% evidence backed.

**Story structure for reels and longer posts** (the reference is Supply6's ads):
| Time | Part |
|---|---|
| 0 to 3 s | Hook |
| 3 to 15 s | Problem |
| 15 to 25 s | Solution |
| 25 to 40 s | Reason to believe (RTB) |
| 40 to 45 s | CTA |

X posts and LinkedIn use the same order in miniature: a hook line, the problem, what helps, the proof, and a soft ask or question.

**Messaging per product:**
- **Mornings.**
  - Problem: too many supplements, and gut, fatigue and vitamin gaps.
  - Solution: convenience, all in one, backed by science.
  - RTB: ingredients at studied doses, and reviews.
  - CTA: order, with 10% off the Combo.
- **Nights.**
  - Problem: sleep has three parts (falling asleep, deep sleep, stress or cortisol), magnesium alone isn't enough, and melatonin isn't the answer.
  - Solution: solve sleep as a whole with magnesium + ashwagandha + glycine + L-theanine, and no melatonin.
  - RTB: science, reviews and sleep scores. Use only real sleep-score exports; never generate or fake one.
  - CTA: 10% off the Combo.
- **Combo.**
  - Problem: supplements matter, but nobody keeps up with many a day.
  - Solution: a ritual, with one for the morning (gut, vitamins, energy for the grind) and one for the night (sleep and recovery).
  - RTB: reviews, value for money, and most buyers choosing the Combo. The doc says 80%; get the team to confirm the current figure before using a number publicly.
  - CTA: extra 10% off the Combo with code COMBO10.

**When people feel it** (from our site; use it to set honest expectations):
- Within 1 week: energy and falling asleep. Instant gratification, and good for proof posts.
- 2 to 4 weeks: gut, digestion, relaxed muscles. Delayed gratification.
- Over months: vitamins, stress and cortisol (4 to 12 weeks). Not felt day to day, so Trust content has to carry these.
- Best results come from 3 months of consistent use.

**Formats to plan for:** object demonstration, street format, before and after (real customers only), unboxing, podcast with the founders, behind the scenes.

**Influencers** (planning reference; not for the daily drafts):
| Who | How many | Budget each | Reference |
|---|---|---|---|
| UGC creators | 5 to 6 | Rs 5 to 10k | Supply6 |
| Science creators | 5 to 6 | Rs 5 to 10k | The Stack |
| Fitness, athletes, nutritionists | 5 to 6 | Rs 5 to 10k | |
| Doctors (panel and influencer) | 2 | Rs 25 to 30k per reel | |

**Retention:** the post-purchase flow (SILT Nutrition Buddy messages, check-ins, reorder nudges, the "Kya aapne SILT liya?" streak, regularity score, leaderboard, power-user community) lives on the dashboard's **Retention** tab.
- The source file is `retention/build-retention.js`.
- The team reviews each message there.
- Once it's loaded, don't reload the file over it with `desk.mjs doc`: that would wipe the team's reviews. Change messages through the tab, or ask Claude to merge.
- Daily X, LinkedIn and Reddit drafts can borrow retention themes (adherence tips, "what did you feel?" prompts, cheeky no-gyan education), but never quote customer data.

## Voice
- Which account posts where:
  - **X: the SILT brand account.** Write as "we" and never as a first-person founder.
  - **LinkedIn: the SILT Nutrition company page.** Write as "we", never as a first-person founder.
  - **Reddit comments: the brand account u/Silt_Nutrition.** Write as "we", helpful first and never salesy (see "Reddit: comments first").
- Conversational paragraphs that sound human. X is raw and short. On X and in Reddit comments, refer to the founder in the third person ("our founder") only when it adds something.
- No em dashes or en dashes. No staccato fragment lists. No "not X, it's Y" reversals. No narrated candor ("Honestly,", "Let's be real"). 2 hashtags max, usually none on X.
- Specific numbers beat adjectives. End many posts with a real question.
- No hard selling. At most 2 of 5 X posts name a product with a dose; the rest are education, founder story, or trend takes.

## Competitive position (from the analysis dated 16 Nov 2026; full version in competitors/competitors-2026-11-16.json and on the dashboard's Competitors tab)
- Closest rivals to SILT Nights:
  - Supply6 Mellow, launched 18 Oct: Rs 45 a serving, 1.25 g glycine, 150 mg KSM-66, on Blinkit and Zepto, with Kriti Sanon as the face.
  - Setu Sleep + Recovery: about Rs 50 to 60.
  - The Upside 3AM Rescue: about Rs 27, a chewable with 3 g glycine.
- 23 Nov 2026: AG1 launched AG1 Energy+ in the US (100 mg caffeine + 100 mg L-theanine + greens and probiotics, with Lewis Hamilton). Globally the Mornings idea now has a big-brand version. In India it still has no drink-mix rival. Don't name AG1 in posts, but "caffeine + L-theanine + gut support in one drink" is becoming a known format, so lead with dose, Indian price and no added sugar.
- Mornings has no direct rival in India. We found no caffeine + L-theanine drink mix, only capsules and gum.
- Our edge is the combination: a morning and a night drink, every dose printed, no melatonin, no added sugar, no maltodextrin, and a named lab report for every ingredient. No rival publishes per-ingredient lab reports; The Whole Truth publishes lab reports for protein only.
- Price: effervescent tablets (Fast&Up, OZiva) cost Rs 10 to 19 and Cosmix powders Rs 12. Argue Rs 60 as what one stick replaces, never as cheap.
- Positioning: for Indian professionals at a desk (the 3 PM slump, a mind that won't switch off at night). Fast&Up speaks to athletes, OZiva to women, Wellbeing to people who like new formats.
- Claims: after the ASCI report of 28 Oct, write "the dose studied in X". Never say SILT improves, treats or cures anything.
- Never name a competitor or quote its dose in public posts. Compare our dose against the dose used in studies instead.

## Daily mix
- X (5): roughly 1 trend reply on Nights, 1 on Mornings, 1 transparency or regulation, 1 founder or social proof, 1 pure education. Each 280 weighted characters or fewer (Rs symbol and emoji count as 2).
- X polls: on about 3 days a week (for example Monday, Wednesday and Saturday), make one of the 5 X posts a poll. See "X polls" below.
- Reddit: during Phase 1 (see "Reddit: comments first" below), write 8 comments a day and no posts. The rules below apply to posts once Phase 2 starts.
- Reddit posts (5, Phase 2 only): the team picks the account when Phase 2 starts. A brand-named account will still be removed in many health subreddits. Mostly discussion and education with no product and no links to the store. Only founder-friendly subs (r/StartUpIndia, r/Entrepreneur, r/IndianStartups) may name SILT. Rotate subs: r/Supplements (only from a personal account, never u/Silt_Nutrition), r/sleep, r/Nootropics, r/Biohackers, r/developersIndia, r/bangalore, r/Fitness_India, r/IndianFitness, r/productivity, r/StartUpIndia. Do not repeat a subreddit two days in a row.

## X polls (from 2026-11-17; quiz-based poll ideas at https://siltnutrition.com/pages/quiz)
Our quiz asks two questions:
- "What is the sleep issue you face the most?" Falling asleep, Waking up at 3AM, Feeling tired in the morning, or All of the above.
- "What is the main health issue in the day?" Fatigue in the afternoon, Bloating, Hunger cravings, or All of the above.

These make good polls. They're low effort to answer, they tell us what our audience struggles with, and the answers map onto Mornings (daytime issues) and Nights (sleep issues).

- **Format:** a short question (the post text) plus 2 to 4 options, each 25 characters or fewer, running 1 day. In the draft, add `poll: {options: [...], duration: "1 day", followup: "<what to post next day>"}`. The `text` field is the question, plus one line of context if it helps.
- **The X intent link can't create polls.** The reviewer types the options into X's poll button. The dashboard shows the options with a character count.
- **Follow-up:** the next day, post the result with one useful, evidence-based tip for the winning answer (for example, waking at 3 AM leads into sleep pressure and alcohol and late caffeine). A follow-up can also mention the quiz once: "Not sure which SILT fits? Our 2-question quiz: siltnutrition.com/pages/quiz". That's the only kind of link allowed on X, and no more than once a week.
- **Poll ideas** (rotate them, and never repeat one within 2 weeks):
  - What wrecks your sleep most? Falling asleep / Waking at 3 AM / Tired on waking / All of the above
  - Your toughest part of the workday? 3 PM slump / Bloating after lunch / Snack cravings / All of the above
  - Your last caffeine of the day is usually... Before noon / 12 to 3 PM / 3 to 6 PM / After 6 PM
  - Morning ritual? Filter coffee / Chai / Green tea / Just water
  - How many supplements do you take daily? None / 1 to 2 / 3 to 5 / 6 or more
  - Do you read the dose on a supplement label? Always / Sometimes / Never / What dose?
  - What would make you trust a new supplement brand? Lab reports / Doctor-backed / Reviews / Price
  - Late calls ruin your sleep how often? Daily / Few times a week / Rarely / Never
  - How do you fight the 3 PM crash? More coffee / A walk / A snack / Push through
- **Voice:** the brand "we", light and curious, never selling inside the poll itself.

## Reddit: comments first (from 2026-11-17)
Moderators removed our first Reddit posts. Until the account has history, we earn it by commenting.
- **Account:** the brand account u/Silt_Nutrition (https://www.reddit.com/user/Silt_Nutrition/) and our community r/SILTNutrition (https://www.reddit.com/r/SILTNutrition/). Comments use the brand voice ("we"), and the username already discloses who we are.
- **Phase 1, now: comments only.**
  - Write 8 comments a day as `<date>_c1..c8`, with platform "reddit_comment".
  - Write no Reddit posts except at most one a week inside r/SILTNutrition.
- **Phase 2: start posting when the team says so.** A good point to suggest it is about 30 days of activity, 100+ comment karma, and a few comments with upvotes in a subreddit. Then post first in the subreddits where comments did well.
- **Where to comment.** Subreddits where a helpful brand comment usually survives: r/StartUpIndia, r/indianstartups, r/IndianFitness, r/Fitness_India, r/bangalore, r/developersIndia, r/IndiaCoffee, r/productivity, r/GetMotivated (habits), r/sleep (careful), r/Nootropics (careful).
- **Never comment in r/Supplements.** It bans brand-name usernames with no appeal.
- **NON-NEGOTIABLE: only comment on posts from the last 3 days (72 hours).** Never draft a reply to anything older, however relevant. If no recent thread fits a topic, drop that comment and write fewer. Every comment draft carries `max_age_days: 3`, and the dashboard shows the rule on each card.
- **Picking threads:**
  - Prefer threads from the last 24 to 48 hours with fewer than about 40 comments, where we can genuinely help: sleep, the 3 PM slump, coffee habits, gut and fibre with Indian food, reading supplement labels, building a D2C brand in India.
  - Skip medical questions about conditions, medication or pregnancy. Skip threads that ask for brand recommendations unless SILT is asked about by name.
- **How a comment sounds:**
  - Answer the question first, with something specific: a number, a study dose, an Indian food example, a habit that works.
  - Keep it to 2 to 6 sentences and vary the length. Write like a person, with no headings and no bullet lists.
  - No product pitch, no links to our site, and no "check out SILT". Mention SILT only when someone asks what we make, or when it's directly relevant. Then say it once, plainly, with no discount.
  - Follow the same voice rules as everywhere: no em dashes and no AI phrasing.
- **Draft fields:** `date, platform: "reddit_comment", slot, status: "pending", account: "u/Silt_Nutrition", subreddit, thread_title, thread_url, thread_age (e.g. "6 h"), thread_comments (number), thread_summary (one line on what OP asked), text (our comment), why, rules`.
- **Reading Reddit:** Claude can't open reddit.com at all. It's on Claude's blocked-sites list in the built-in browser, in WebSearch, and in the Claude in Chrome extension (Edge connected fine on 2026-11-17, but Reddit was refused). Don't try mirrors or workarounds. Live threads come from the team, through the Reddit to AI extension and by pasting into chat. The daily run writes the comment bank.
- **Manual helper:** the team also drafts comments for live threads with the "Reddit to AI" Chrome extension and our template. See `reddit-to-ai/GUIDE.md`. When they paste posted comments into chat with "log these comments", load them as `<date>_c<n>` with status "posted" and the real thread_url, numbering after any existing comments for that day. These are the strongest voice examples, so weight them highly when learning from reviews.
- **If Chrome isn't connected, write a comment bank.** Write 8 comments answering questions that come up again and again in each subreddit.
  - Set thread_title to "Find a post from the last 3 days: <the question>" and thread_summary to what kind of thread to look for.
  - Set thread_url to the subreddit's newest-posts feed, `https://www.reddit.com/r/<sub>/new/`. Never use Reddit search links: search returns posts that are years old, even with a time filter.
  - Set max_age_days to 3, and set format to "Comment bank (pick a post from the last 3 days)". See drafts/2026-11-17-comments.js for the pattern.
  - Pick topics that come up often in that subreddit, so a fresh post on that topic is likely to exist.
  - Don't reuse a question from the last 5 days.

## Reddit and X introductions (drafted 2026-11-16)
- Reddit opened with 3 introduction posts: r/StartUpIndia (founder intro asking for feedback), r/AMA (founder AMA), and our own r/SILTNutrition (pinned welcome post, the one place where we link the site and lab reports).
- X opened with a pinned brand intro post from the SILT account.
- Don't write new introduction posts on later days. Point product questions to r/SILTNutrition. In other subs, stay with discussion and education.
- New Reddit accounts get auto-removed in most subs, which is why we're in Phase 1 (comments only). Spread comments through the day, about 6 to 10 in total.

## LinkedIn (Monday, Wednesday and Friday only: 1 post each)
On 17 Nov 2026 it was briefly stopped and then restored the same day. Drafts are written the evening before, at the 6 PM run.
- Posted from the **SILT Nutrition company page**, never as a personal profile. Write in the brand's "we" voice: no "I", no personal diary tone, no "I launched", "I read every review" or "my corporate years". The founder can appear in the third person when it adds something ("our founder Abhishek spent 10+ years in corporate"), at most once a week.
- Conversational and paragraph-driven, 900 to 1,500 characters. The first 210 characters show before "see more", so open with the strongest line. End with a real question. 2 hashtags max.
- Weekly rhythm:
  - Monday: competitor and category view. A founder take on what other brands are doing (deals, campaigns, label or lab controversies, regulation), seen from a small brand's seat. Never attack a competitor by name; comment on the move.
  - Wednesday: ingredient series. One ingredient, its dose in SILT, what the studies say, and where the evidence is thin.
  - Friday: building in public. Numbers, a customer story (first name only, with permission), production or packaging behind the scenes, or a lesson.
- Every LinkedIn post needs an image suggestion (`image: {concept, source, overlay, alt, link}`). Keep text on images to a minimum: the SILT logo plus at most one short line. Prefer the real shoot assets: Drive folder https://drive.google.com/drive/folders/1D6suq4BOLzr2PGow-FK7A-9LgFDIW9Bz ("Shoot Photos" has 50 box photos; "Raw cilps" has packaging-line videos for stills). Other good sources are founder photos, lab report crops and screenshots of real reviews.
- Every LinkedIn post also carries a `competitor` field: which competitor pattern it borrows from or answers.
- On LinkedIn days, the brief also gets `linkedin_competitors: [{brand, what, takeaway, source}]`: 3 to 5 things competitors did recently on LinkedIn or in the news.
- Doc id: `<date>_l1`, platform "linkedin", slot 1. Optionally add a second option as `<date>_l2`, and say in `why` that the team should pick one.
- On LinkedIn days, the brief also gets `linkedin_trends: [{topic, date, day, angle, source}]`, which covers what's going around in Indian work culture, D2C and supplement news. On Mondays, also add `linkedin_formats` (a list of strings) and `linkedin_week: [{day, title, format, notes}]`.
- Plan for the week of 16 Nov 2026:
  - Wed 18 Nov: "250 mg magnesium: what that number actually means". A document carousel covering elemental magnesium against compound weight, why bisglycinate is gentle on the stomach, the daily need for Indian adults, why evidence is strongest for people who are low, ending on the lab report.
  - Fri 20 Nov: "3 weeks after launch, in the month ASCI and FSSAI came down on supplements". Real numbers, what we checked on our own labels, and one thing we'd change. A short founder video or a text post with one chart.
- Formats that work in 2026: document carousels (highest engagement), short vertical founder video, and specific numbers. Reply to comments in the first hour. Avoid "proud to announce" and generic motivation.
- The biggest category story in Nov 2026 is ASCI's 28 Oct report: 60 of 61 reviewed nutraceutical ads broke the ad code. Our answer is printed doses plus a lab report per ingredient.

## Post document shape (`posts/<date>_x1..x5`, `posts/<date>_r1..r5`; Reddit comments are `<date>_c1..c8` with the comment fields listed above)
`date, platform ("x"|"reddit"), slot (1-5), status: "pending", product ("mornings"|"nights"|"both"|"brand"|"education"), pillar ("Adherence"|"Trust"), angle, format, trend, why, source (URL), text` (every X, LinkedIn and Reddit-comment draft carries `pillar`; see "Plan of Action") and for Reddit also `subreddit (no r/), flair, title, rules`.
Reviewers add `status` (approved / changes / rejected / posted), `note`, `edited_text`, `edited_title`.

## Brief document shape (`briefs/<date>`)
`date, summary, trends: [{topic, angle, platform, source}], instagram, competitors`. The dashboard lists a day only once its brief exists.
