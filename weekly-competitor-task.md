# Proposed weekly task: SILT weekly competitors + ad teardowns refresh

Schedule: every Monday at 7:30 PM (cron `30 19 * * 1`), after the 6 PM drafting run.

What it does:
1. Runs `node scripts/desk.mjs weekly-ads` in SILT_Content_Desk/cloudflare. This re-harvests the running Meta ads of the 9 tracked brands, compares them with the last snapshot, and updates the "This week" block on each Ad teardowns card.
2. Searches the last 7 days of competitor news. That covers Supply6/Mellow, The Upside, The Stack, Setu, Fast&Up, Wellbeing, OZiva, Cosmix, The Whole Truth, AG1/AGZ and IM8, plus any new sleep or energy launches and any FSSAI or ASCI actions.
3. Adds a dated entry to the "What changed" section of the Competitors tab (`updates` in competitors/competitors-2026-11-16.json), then stores it with `node scripts/desk.mjs doc competitors ...`.
4. Adds one line to PLAYBOOK.md under "Competitive position" only if something big changed, so the daily drafts pick it up.
5. Ends with a 3-line summary.

It's read-only research plus updates to our own dashboard. It never posts or logs in anywhere.
