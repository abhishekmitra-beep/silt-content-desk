---
name: silt-static-engine
description: Make SILT Nutrition Meta ad statics and put them straight into the team's SILT Static Engine (https://silt-static-engine.pages.dev). Use when someone asks for SILT statics, static ideas, Problem / Solution creatives, or to add a house rule for SILT creatives.
---

# SILT Static Engine

The SILT Static Engine is the team's website for Meta ad statics: https://silt-static-engine.pages.dev. It is open; no login.
Everything you make lands in the site's **Approval** tab. The team approves it there, and only then does it go live in the TOFU, MOFU, BOFU and Retention tabs. You are the Maker; the site checks the copy (the Checker) and the team approves.

## Before writing anything, read the house rules

```
curl -s https://silt-static-engine.pages.dev/api/rules
```

Every rule in that list overrides anything below. Follow all of them.

## Quick option: let the site write the statics (lower quality)

Send the idea and the site writes the statics with its own AI, following the brand facts, the Plan of Action and the house rules:

```
curl -s -X POST https://silt-static-engine.pages.dev/api/generate \
  -H "content-type: application/json" -H "x-silt-name: <your name>" \
  -d '{"idea":"<the idea>","count":6,"funnel":"auto","product":"auto"}'
```

- `count`: 1 to 30.
- `funnel`: auto, TOFU, MOFU, BOFU or RET.
- `product`: auto, mornings, nights or combo.

The reply lists the statics it made. Tell the person to open the Approval tab to review them.

Writing them yourself (below) gives better statics: prefer that.

## Preferred: write the statics yourself

Post each static as JSON:

```
curl -s -X POST https://silt-static-engine.pages.dev/api/items \
  -H "content-type: application/json" -H "x-silt-name: <your name>" \
  -d '{"kind":"static","status":"approval","doc":{ ... }}'
```

A doc always has these fields:

- `t`: the format
- `funnel`: TOFU, MOFU, BOFU or RET
- `product`: mornings, nights or combo
- `concept`: 2 to 4 words
- `slug`: short-words-with-dashes
- an optional `cta` of up to 5 words
- the text keys of its format

**Our signature format is `problemsolution`, our version of a before/after.** Use it for about half of everything.

```
{"t":"problemsolution","funnel":"TOFU","product":"nights","concept":"Late nights","slug":"late-nights",
 "scene_problem":"night-phone","scene_solution":"product","problem":"1 AM. Still wide awake.","solution":"SILT Nights. Log off."}
```

- `scene_problem` and `scene_solution` take one of the scene keys below, or `product` (the stick on brand colour), or `jars` (the supplement shelf).
- The solution side shows the SILT ritual. Never show a promised result.

**Other formats and their text keys:**

| Format | Text keys |
|---|---|
| scene | headline, sub, scene |
| meme | top, bottom, scene_a, scene_b |
| poll | kicker, question, options (3 or 4) |
| tweet | text |
| notes | title, items (list), last |
| chat | with, msgs (list of {t, me}) |
| email | from, subject, lines (list), sig |
| statement | kicker, headline, sub |
| newscard | dateline, headline, good |
| offer | kicker, headline, code, sub |
| mistakes | headline, items, turn |
| vs | headline, us, them, rows ([label, 1/0, 1/0]) |

**Scene keys:**

| Key | Shows |
|---|---|
| night-phone | doomscrolling at night |
| pillow-office | working on a pillow |
| bear | curled up under a blanket |
| yawn-duvet | tired morning |
| tired-sitting | woke up exhausted |
| awake-eyes | lying awake |
| peek-blanket | can't sleep |
| pillow-hug | funny |
| ugly-sleep | deep sleep |
| onesie | funny |
| cloud | calm |
| morning-light | not ready for the day |
| deep-dark | deep sleep |
| city-sunset | letting go |
| eye-mask | — |
| blinds | — |
| curled-night | — |
| brain-glow | — |
| baby-sleep | — |
| outdoors | — |

## Publishing finished images (made in Canva, ChatGPT, Photoshop, or by you)

Upload them as they are; no AI rewrite. One static takes up to 3 files, its 4:5, 1:1 and 9:16 versions. Each image can be at most 1.9 MB; use JPG. Everything goes to the Approval tab.

```
curl -s -X POST https://silt-static-engine.pages.dev/api/upload -H "x-silt-name: <your name>"   -F title="Pillow not office" -F funnel=TOFU -F product=nights -F concept="Relatable"   -F file=@pillow_4x5.jpg -F file=@pillow_9x16.jpg
```

The site reads each image's size itself. To add new scene photos for the engine's own statics, ask Ashutosh: they live in static-engine/assets/scenes and SCENES in engine.js, and need a deploy.

## The rules every static follows

**Facts (use only these numbers):**
- **Mornings:** 80 mg caffeine + 200 mg L-theanine, 5 g PHGG fibre, 6 billion probiotics, vitamins D3, K2, B12, C at 100% RDA.
- **Nights:** 3 g glycine, 250 mg magnesium, 300 mg KSM-66 ashwagandha, 200 mg L-theanine. No melatonin.
- No added sugar.
- Rs 900 for 15 sticks.
- COMBO10 = extra 10% off the Combo.
- Damaged or wrong products are replaced (photos within 72 hours). There are no returns.

**Plan of Action:**
- Hook > Problem > Solution > Reason to believe > CTA.
- Pillars: Adherence and Trust.
- TOFU, MOFU and BOFU say "Replaces the stack". RET (existing customers) is about the ritual, with no discount push.

**Product placement (Abhishek's rules):** the engine places the pack for you. It's always the box + stick together (the hero, about a third of the image height, lower right on a soft shadow; the Combo shows both packs, Mornings left and Nights right), never a lone stick, never on a face, the headline or the CTA. In problemsolution the Solution side is always the pack. In 9:16 everything stays between 230 and 1165 px from the top.

**People:** every person, name and setting is Indian: Indian faces, names like Priya, Rohan, Ananya or Arjun, and Indian moments (chai, autos, Bengaluru traffic, Diwali, wedding season, back-to-back calls).

**Relatable first:** at least 6 in 10 statics show real moments of busy Indian professionals, not a product shot.

**Less text:** about 22 words per static, 32 at most.

**Never:**
- em or en dashes
- competitor names
- star ratings
- invented reviews, results, sleep scores, numbers or deadlines
- cure or treat claims
- "easy returns"

**Tone:** a friend, not a parent. Tongue-in-cheek; corporate puns welcome.

## Adding a house rule (Abhishek only)

```
curl -s -X POST https://silt-static-engine.pages.dev/api/rules -H "content-type: application/json" \
  -H "x-silt-name: Abhishek" -H "x-rules-key: <the rules key>" -d '{"add":"<the rule>"}'
```

Ask for the rules key; never guess it, and never put it in a static.
