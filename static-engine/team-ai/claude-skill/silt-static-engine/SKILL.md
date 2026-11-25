---
name: silt-static-engine
description: The thinker for SILT Nutrition's Meta ad statics. Picks up the ideas waiting in the team's SILT Static Engine (https://silt-static-engine.pages.dev), thinks each one through against everything already made, writes every static with a ChatGPT image prompt, reviews its own work, and saves it under the idea. Use when someone says "make the waiting SILT ideas", asks for SILT statics, static ideas, Problem / Solution creatives, or to add a house rule for SILT creatives.
---

# SILT Static Engine: Claude is the thinker

The SILT Static Engine is the team's website for Meta ad statics: https://silt-static-engine.pages.dev (open, no login).

**The roles:**
1. **The team** types ideas on the site's Ideas tab and presses *Send to Claude*. The ideas wait in a queue.
2. **You (Claude) are the thinker.** You pick up a waiting idea, take your time, and write each static: the concept, the exact words, a preview, a complete **ChatGPT prompt** for the finished image, and your honest **review**.
3. **ChatGPT is the generator.** It makes each static image from your prompt. The team uploads the image onto that static.
4. **The team ticks** each static on the Ideas tab: ✓ sends it to Team Approval, ✕ drops it. Only a team approval makes a static live.

Take your time. Quality beats speed: think about the person, the moment, the joke and the line before writing.

## 1. Read the house rules and what already exists

```
curl -s https://silt-static-engine.pages.dev/api/queue
```

The reply has:
- `ideas`: the ideas waiting (oldest first), each with `id`, `idea`, `count`, `funnel`, `product`, `asked_by`, and `already_made_for_this_idea`.
- `house_rules`: Abhishek's rules. **They override everything below.**
- `brief`: what the engine already has. It lists what the team approved (keep the spirit, find new situations) and what was rejected (avoid anything like it). It also gives every existing line (never repeat one), past ideas, the least-used formats, and new angles to explore.
- `need_images`: statics that already have your prompt but still need ChatGPT's image (for the person to hand to ChatGPT).

No ideas waiting? Ask the person for one, or pick an angle from the brief nobody has covered, and send it to the queue yourself:

```
curl -s -X POST https://silt-static-engine.pages.dev/api/items -H "content-type: application/json" -H "x-silt-name: <your name>" \
  -d '{"kind":"idea","status":"waiting","doc":{"text":"<the idea>","count":6,"funnel":"auto","product":"auto","made":[]}}'
```

## 2. Claim the idea, so nobody else works on it

```
curl -s -X PUT https://silt-static-engine.pages.dev/api/items/<idea id> -H "content-type: application/json" -H "x-silt-name: <your name>" -d '{"status":"working"}'
```

## 3. Think, then write each static

Make `count` statics (default 6). Each one is a **different moment, a different person and a different format**, and nothing on the brief's lists may repeat. Use Indian characters, with Indian women as the lead in many of them. Never invent a customer quote, review, rating or result.

Save each static under the idea (`idea_id`). Your review is the `status`: `"approved"` if it's good (it shows as **AI approved**), `"rejected"` if it isn't (**AI rejected**). Put the reason in `ai_note`.

```
curl -s -X POST https://silt-static-engine.pages.dev/api/items -H "content-type: application/json" -H "x-silt-name: <your name>" -d '{
  "kind":"static", "status":"approved",
  "doc":{
    "idea_id":"<idea id>",
    "t":"scene", "funnel":"TOFU", "product":"nights", "concept":"Tax season", "cta":"Try Nights",
    "scene":"ceiling-2am", "headline":"ITR filed. *Mind still filing.*", "sub":"SILT Nights. Log off properly.",
    "chatgpt_prompt":"<the full prompt for ChatGPT, see below>",
    "ai_note":"New persona (CA in tax season), new line, on brand."
  }}'
```

- `t` and its text keys (the table below) make the site's **preview** of the static until ChatGPT's image arrives. Wrap a word in `*stars*` to highlight it.
- `chatgpt_prompt` must be complete enough for ChatGPT to make the **finished** static on its own:
  - the size: 1080 x 1350 (4:5)
  - every word to print, in quotes, exactly as written
  - who is in the picture: Indian; age; man or woman; what they wear; where they are; their expression
  - the layout: where the words and the person go
  - SILT's look: clean and warm. Mornings is sunrise yellow and orange, Nights is deep navy blue.
  - always end it with: *"Place the SILT pack from the attached image in the lower right, about a third of the image height, on a soft shadow. Don't redraw the logo or add any other text."*

  The site adds a download link for the real pack image when the team copies the prompt.

After the last static, the idea shows as briefed on the site. Tell the person:
- how many statics you made
- that they are on the Ideas tab
- that they now go to ChatGPT: *Copy for ChatGPT* on each static, then *⬆ Image* to upload the result
- that they then tick ✓ or cross ✕

**No network from your Claude?** On the site, an idea's *Copy for Claude* button gives you the same brief as one prompt. Reply with `{"statics":[...]}`, each static with the fields above plus `"review": {"ok": true|false, "note": "..."}`. The person pastes your reply with *Paste Claude's reply*.

## Formats and their text keys (for the preview)

**Our signature format is `problemsolution`, our version of a before / after.** Use it often, but not for every static.

```
{"t":"problemsolution","scene_problem":"night-phone","scene_solution":"product","problem":"1 AM. Still wide awake.","solution":"SILT Nights. Log off."}
```

| Format | Text keys |
|---|---|
| problemsolution | problem, solution, scene_problem (a scene key or "jars"), scene_solution ("product") |
| scene | headline, sub, scene |
| meme | top, bottom, scene_a, scene_b |
| poll | kicker, question, options (3 or 4) |
| tweet | text |
| notes | title, items (list), last |
| chat | with, msgs (list of {t, me}) |
| email | from, subject, lines (list), sig |
| calendar | title, items |
| checklist | title, items |
| statement | kicker, headline, sub |
| newscard | dateline, headline, good |
| offer | kicker, headline, code, sub |
| mistakes | headline, items, turn |
| vs | headline, us, them, rows ([label, 1/0, 1/0]) |

Scene keys for the preview photo: tired-3pm, ceiling-2am, mug-calm, jar-january, founder-2am, night-phone, pillow-office, bear, awake-eyes, peek-blanket, eye-bw, pillow-hug, ugly-sleep, onesie, cloud, morning-light, deep-dark, outdoors, eye-mask, brain-glow, line-drawn, blinds, curled-night, peek-blinds, purple-top, clay-tired. These are all men or nobody. When your static needs a woman, say so in the ChatGPT prompt; ChatGPT's image replaces the preview photo.

## Publishing finished images you already have

Upload them as they are. One static takes up to 3 files (its 4:5, 1:1 and 9:16 versions), each at most 1.9 MB as a JPG. They go to Team Approval.

```
curl -s -X POST https://silt-static-engine.pages.dev/api/upload -H "x-silt-name: <your name>" -F title="Pillow not office" -F funnel=TOFU -F product=nights -F file=@pillow_4x5.jpg -F file=@pillow_9x16.jpg
```

To put ChatGPT's image onto a static you wrote, add `-F static_id=<static id>`. It then becomes that static's image.

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

**Product placement (Abhishek's rules):** the engine places the pack in its previews, and your ChatGPT prompt must ask for the same. It's always the box + stick together (the hero, about a third of the image height, lower right on a soft shadow; the Combo shows both packs, Mornings left and Nights right), never a lone stick, never on a face, the headline or the CTA. In problemsolution the Solution side is always the pack. In 9:16 everything stays between 230 and 1165 px from the top.

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
