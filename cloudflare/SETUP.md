# SILT Content Desk on Cloudflare (free plan)

Site: **https://silt-content-desk.pages.dev**
Cloudflare account: ashutosh.gaurav@drinksilt.com. Pages project `silt-content-desk`, D1 database `silt_desk`.

## How it works
- **Cloudflare Pages** hosts the page (`public/`) and a small API (`functions/api/`).
- **D1** stores posts and briefs as JSON (`schema.sql`).
- **Login** uses one shared team password plus each person's name. The name is shown on the posts they review. A session lasts 30 days. Changing the password signs everyone out.
- The 7 AM task loads drafts with `node scripts/desk.mjs load <date>`, using this PC's `wrangler login`. The website has no public endpoint for adding posts.

## Ideas & calendar tab
- Anyone signed in can add a content idea (title, details, where it goes, product, optional date).
- The team approves, asks for changes or rejects each idea, and gives approved ideas a calendar date. The calendar shows approved ideas in solid colour and undecided ones faded.
- Data: table `ideas` (one row per idea). `node scripts/desk.mjs ideas-status` prints every idea with its status, date and note.
- `node scripts/desk.mjs schema` creates any missing tables on a new database.

## Competitor ad teardowns
- Full teardown pages live in `public/teardowns/<brand>.html` and open only for signed-in people (`functions/teardowns/_middleware.js`).
- The list on the **Ad teardowns** tab comes from `../competitors/teardowns.json`, stored with `node scripts/desk.mjs doc teardowns ..\competitors\teardowns.json`.
- To add a brand: build the report with the scripts in `C:\Users\ASHUTOSH\silt-ad-tools`, run `node to-desk.mjs <report.html> <brand>`, add an entry to teardowns.json, store it, then `npm run deploy`.

## Local testing
- `.dev.vars` holds a local-only test password (never deployed). Run `npx wrangler pages dev public` and prefix desk.mjs commands with `DESK_LOCAL=1` to use the local database.

## Team password
- The current password is in `TEAM_PASSWORD.txt` in this folder. Share it only with reviewers.
- To change it, for example when someone leaves:
  ```
  cd C:\Users\ASHUTOSH\SILT_Content_Desk\cloudflare
  node scripts/set-password.mjs
  npm run deploy
  ```

## Handy commands (run in this folder)
- `npm run deploy` publishes changes to the page or API.
- `node scripts/desk.mjs count 2026-11-17` shows how many posts are stored for a day.
- `node scripts/desk.mjs reviews 2026-11-10` lists review statuses and notes since a date.
- If Cloudflare says you're not logged in, run `npx wrangler@4 login`.

## Free plan limits (well above what this needs)
Pages allows 500 deploys a month. D1 allows 5 GB of storage and 5 million row reads a day. Functions allow 100,000 requests a day.

## Content agent tab (added 17 Nov 2026)
- **What it does:** reads the competitor analysis (`docs` key `competitors`), the ad teardowns (`teardowns` plus `lib/teardown-digest.json`), the calendar and the team's earlier review notes. Then it:
  - writes a two-week content strategy with ChatGPT;
  - makes static ads with ChatGPT images, using the real pack photo from `public/teardowns/assets/`;
  - suggests reel ideas.
- **Statics:** approve, reject or ask for changes. "Make a new image" uses the note. Every version is kept. An approved static goes straight onto the content calendar (`ideas` table, id `c-a-…`).
- **Reels:** approve the idea first. That puts it on the calendar faded. Then press "Write the script", edit it and approve it. The calendar entry then turns solid and carries the script and shot list.
- **Rules:** the "Agent rules" box at the bottom of the tab holds the brand, statics and reels instructions the agent follows. The defaults are in `lib/agent-rules.js`; anything saved in the box overrides them (`docs` key `agent-rules`). The old static ad prompts page is not used.
- **Data:** tables `agent_items` and `media` are created automatically on first use (they're also in `schema.sql`). Images are stored in D1 as base64, about 0.5 to 1 MB each.
- **OpenAI key (required):** run this once, paste the key when asked, then deploy:
  ```
  npx wrangler pages secret put OPENAI_API_KEY --project-name silt-content-desk
  npm run deploy
  ```
- **Optional Pages variables:** `OPENAI_TEXT_MODEL` (default `gpt-5.6-sol`), `OPENAI_IMAGE_MODEL` (default `gpt-image-2`), `OPENAI_IMAGE_SIZE` (default `1088x1920`; must be multiples of 16), `OPENAI_IMAGE_QUALITY` (default `high`).
- **Cost:** one run makes one strategy call plus one image per static (4 by default). Rewrites and new images cost one call each.
- **New teardown added?** Run `node scripts/teardown-digest.mjs`, then `npm run deploy`, so the agent reads it.
- **Local testing without OpenAI:** add `AGENT_MOCK=1` to `.dev.vars`. The agent then returns made-up answers and placeholder images.
- `wrangler.toml` now sets `compatibility_flags = ["nodejs_compat"]`, which `/api/media` uses to decode images.
