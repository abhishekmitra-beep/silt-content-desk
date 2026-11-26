# SILT Content Desk + SILT Static Engine

Two small websites that run SILT Nutrition's content and ad work, both on Cloudflare (Pages + a D1 database):

| Site | What it does | SILT's live copy |
|---|---|---|
| **Content Desk** (`cloudflare/`) | Daily X, Reddit and LinkedIn drafts to review, an Ideas & calendar tab, competitor analysis, Meta ad teardowns (with a daily "Watch closely" check), a Content agent and the WhatsApp retention playbook. | https://silt-content-desk.pages.dev |
| **Static Engine** (`static-engine/`) | Meta ad statics: the team sends ideas, Claude writes the brief, ChatGPT makes the image, a checker and the team approve, finished statics download in every Meta size. | https://silt-static-engine.pages.dev |

Anyone can copy this repo and run their own copy of both sites on their own free Cloudflare account. Nothing below touches SILT's sites.

## Make your own copy

You need: [Node.js 20+](https://nodejs.org), [Git](https://git-scm.com), Google Chrome (the Static Engine renders its built-in statics with it), and a free [Cloudflare account](https://dash.cloudflare.com/sign-up).

```
git clone https://github.com/ashutoshgauravsilt/silt-content-desk.git
cd silt-content-desk/cloudflare
npm install
npx wrangler login
cd ..
node setup.mjs --name yourbrand
```

- `npx wrangler login` opens a browser: sign in to **your** Cloudflare account.
- `--name` picks your web addresses: `https://yourbrand-content-desk.pages.dev` and `https://yourbrand-static-engine.pages.dev`. Use lowercase letters, digits and hyphens. If a name is taken, run again with another one.
- Want to see the steps first? Add `--dry-run`: it prints everything it would do and changes nothing.

`setup.mjs` does the rest, in about 5 to 10 minutes:

1. Creates a D1 database called `silt_desk` on your account (or reuses it) and its tables.
2. Saves your names in `site.config.json` and `cloudflare/wrangler.toml`.
3. Creates the two Cloudflare Pages projects.
4. Sets the secrets: a Content Desk password (saved to `cloudflare/TEAM_PASSWORD.txt`) and a Static Engine rules key (saved to `static-engine/web/RULES_KEY.txt`). These files are never committed.
5. Renders the built-in statics with Chrome, builds both sites and deploys them.

It's safe to run again; it reuses what already exists.

## After setup

- **Deploy changes:** `node deploy.mjs desk` or `node deploy.mjs engine` (or `npm run deploy` inside `cloudflare/` or `static-engine/`).
- **Content Desk password:** `cloudflare/wrangler.toml` has `DESK_OPEN = "1"`, which means anyone with the link can view and edit. Set it to `"0"` and deploy to require the password from `TEAM_PASSWORD.txt`. Change the password with `node cloudflare/scripts/set-password.mjs`.
- **Static Engine rules:** the house rules can only be changed with the rules key (`x-rules-key` header).
- **Your copy starts empty.** Drafts, ideas, teardowns and statics live in your database, not in the repo. The repo has SILT's own content files (drafts, competitor research, playbook) as examples; replace them with your brand's.
- **Optional extras:** the Content agent uses ChatGPT Plus by copy and paste (`AGENT_MODE = "plus"`); set `AGENT_MODE = "api"` and add an `OPENAI_API_KEY` secret to use the API instead. The Static Engine's "generate" button uses Cloudflare Workers AI, which comes with every account.

## For the SILT team

SILT's own copy has no `site.config.json`, so every script uses SILT's names by default. See [DEPLOY_ON_MAC.md](DEPLOY_ON_MAC.md) for the team's day-to-day steps. Pull before you change anything; commit and push after you deploy.

## What's where

```
cloudflare/        Content Desk: public/ (pages), functions/ (API), lib/, scripts/desk.mjs, schema.sql
static-engine/     Static Engine: engine.js + render.mjs (statics), site.mjs (builds web/public), web/ (site + API + schema.sql)
competitors/       Competitor analysis and the Ad teardowns list
drafts/            Daily social drafts loaded into the Content Desk
retention/         WhatsApp retention playbook
setup.mjs          One-command setup of your own copy
deploy.mjs         Deploys either site to the names in site.config.json
site-config.mjs    Reads site.config.json (falls back to SILT's names)
```
