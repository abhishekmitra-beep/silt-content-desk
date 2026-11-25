# Deploying the SILT sites from a Mac

These steps let a Mac deploy two SILT sites:

- **SILT Content Desk**: https://silt-content-desk.pages.dev (Cloudflare Pages + a D1 database)
- **SILT Static Engine**: https://silt-static-engine.pages.dev (Cloudflare Pages)

Both sites sit on the Cloudflare account ashutosh.gaurav@drinksilt.com.

## One-time setup

1. **Cloudflare access: done.** abhishek.mitra@drinksilt.com has access to the SILT Cloudflare account, which holds both sites and the database. Sign in with that email in step 4.

2. **Install the tools** (in Terminal):
   ```
   brew install node ffmpeg
   ```
   - Node 20 or newer is needed.
   - ffmpeg is optional. Without it, the Static Engine makes its JPG previews with macOS `sips`.
   - Google Chrome must be installed in /Applications. The Static Engine renders statics with it.

3. **Get the project from GitHub** (public repo; to push changes, Ashutosh adds you as a collaborator):
   ```
   git clone https://github.com/ashutoshgauravsilt/silt-content-desk.git ~/SILT_Content_Desk
   ```
   - Secrets are never in the repo: the team password, the rules key and `.dev.vars`.
   - Generated files are not in the repo either: rendered statics, previews and the site build. `npm run build-and-deploy` makes them.

4. **Install the Content Desk dependencies and sign in to Cloudflare:**
   ```
   cd ~/SILT_Content_Desk/cloudflare
   npm install
   npx wrangler login
   ```
   - The login opens a browser. Sign in as abhishek.mitra@drinksilt.com.
   - The Static Engine reuses this Cloudflare tool, so it needs no install of its own.

5. **Team password file (optional, Content Desk only).** The Content Desk password is already set on Cloudflare. You only need `cloudflare/TEAM_PASSWORD.txt` to change it. It is never copied with the project; ask Ashutosh for it in person or through a password manager. The Static Engine has no password.

## Making statics needs no deploy

The Static Engine (https://silt-static-engine.pages.dev) is open in any browser, on any computer, with no login. The daily flow happens on the site and is saved for everyone straight away:

1. **Maker:** "Make today's batch" with your own Claude or ChatGPT.
2. **Checker:** runs by itself.
3. **Approval:** the statics that pass wait here for someone to approve them.
4. **Download:** approved statics go into the funnel tabs, each with a ZIP download.

Deploy only when the site's code, layouts or the 30 built-in statics change.

## Deploy the Content Desk

```
cd ~/SILT_Content_Desk/cloudflare
npm run deploy
```

## Make and deploy statics (SILT Static Engine)

```
cd ~/SILT_Content_Desk/static-engine
npm run build-and-deploy
```

That command does three things:

1. Renders all 46 built-in statics in 3 sizes into `out/`. This takes about 5 minutes.
2. Builds the site.
3. Deploys it.

On a fresh clone, always use `build-and-deploy`. `npm run deploy` skips rendering and only works once `out/` has the renders; it refuses to run without them, so the site never goes live empty.

**Where to change things:**

| What | File |
|---|---|
| Copy for each static | `static-engine/statics.js` |
| Layouts, colours and sizes | `static-engine/engine.js` |
| Contact sheet of all 30 (writes `out/_contact_sheet_4x5.png`) | run `npm run sheet` |

Before anything goes to Meta, check every line against the pack.

## Content Desk data (helper)

Run these from `cloudflare/`:

| Command | What it does |
|---|---|
| `node scripts/desk.mjs count 2026-11-26` | Counts the posts stored for that day |
| `node scripts/desk.mjs load 2026-11-26` | Loads that day's drafts from `drafts/` |
| `node scripts/desk.mjs doc retention ../retention/retention-flow.json` | Updates the Retention tab. Existing reviews are kept. |
| `node scripts/desk.mjs doc scripts ../ad-scripts/scripts.json` | Updates the Ad scripts tab. Existing reviews are kept. |

## Important: one source of truth

Each deploy replaces the whole site with the files on that computer. The Windows PC still runs two scheduled jobs:

- the 6 PM daily drafts
- the Monday competitor refresh

So if the Mac and the PC have different code, the last deploy wins. GitHub is the one source of truth:

- **Before changing anything:** run `git pull`.
- **After a change works and is deployed:** run `git add -A`, then `git commit -m "what changed"`, then `git push`.
- **Never deploy** from a copy that's behind GitHub.

The daily drafts don't need this. They go into the database, not into the site files.

## House rules key

Adding or removing house rules on the Static Engine needs the rules key. Ashutosh passes it on in person or through a password manager; it is never in this folder or in chat. Making statics doesn't need it.

## Not part of the Mac setup

- **The scheduled tasks** (6 PM drafts, Monday competitor refresh) run in the Claude app on the Windows PC.
- **The competitor ad harvesting** (`desk.mjs weekly-ads`) needs the separate `silt-ad-tools` folder. Point to it with `SILT_AD_TOOLS=/path/to/silt-ad-tools`.
