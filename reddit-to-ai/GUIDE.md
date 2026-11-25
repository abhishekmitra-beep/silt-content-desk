# Reddit comments with the "Reddit to AI" extension

This is how the team turns fresh Reddit threads into SILT comments in about 10 minutes a day. The extension copies a thread you have open and pastes it into Claude with our SILT comment template.

**The rule that never changes: only reply to posts from the last 3 days.** The extension doesn't show a thread's date, so check it on Reddit before you copy the thread.

---

## One-time setup (about 5 minutes, in Google Chrome)

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** (the switch at the top right).
3. Click **Load unpacked** and choose this folder:
   `C:\Users\ASHUTOSH\SILT_Content_Desk\external\Reddit-to-AI\src`
4. Pin it: click the puzzle-piece icon, then the pin next to **Reddit to AI**.
5. Open the extension's **Options**: right-click its icon and choose Options.
   - **Prompts:** under "Select Analysis Type", pick **Custom**. Paste the whole text of `SILT_comment_template.txt` (it's in this folder) into the template box. Keep the `{content}` line at the end.
   - **AI platform:** choose **Claude** (claude.ai). Make sure you're signed in to claude.ai in Chrome.
   - **Anonymous Usage Stats:** switch this **off**. It's on by default and sends anonymous counts to the extension's developer.
   - Leave the API key fields empty. They aren't needed.
6. Optional: under Content filters, set comments to **Top** with a **Small** or **Balanced** size, so the AI sees the best replies without a huge prompt.

The extension lives in the folder above. If that folder is moved or deleted, Chrome removes the extension, so leave it where it is.

---

## Every day (about 10 minutes)

1. **Find fresh threads.** Open the newest-posts page of 3 or 4 of our subreddits:
   - https://www.reddit.com/r/bangalore/new/
   - https://www.reddit.com/r/developersIndia/new/
   - https://www.reddit.com/r/IndianFitness/new/
   - https://www.reddit.com/r/StartUpIndia/new/
   - https://www.reddit.com/r/productivity/new/
   - https://www.reddit.com/r/IndiaCoffee/new/
   - r/sleep and r/Nootropics, with extra care
   - **Never r/Supplements.** It bans brand accounts permanently.
2. **Pick 6 to 8 posts.** Each one must be **posted in the last 3 days** (the date is shown under the title). Choose posts with fewer than about 40 comments, where we can genuinely help: sleep, the 3 PM slump, coffee and chai, fibre and gut health with Indian food, reading labels, building a D2C brand.
3. **Draft.** Open each thread and press **Alt+Shift+S**, or click the extension icon, then send. Claude opens with the thread and our template, and drafts a comment.
   - Batch option: in the extension, use **Batch / Multi-thread**, paste all the thread links at once, and send them together. You get one comment per thread.
4. **Review.** Read each draft. Skip anything marked "WORTH REPLYING: no". Make the comment sound like us and fix anything that's wrong.
5. **Post** from **u/Silt_Nutrition**. Reply to the post, not to a random comment, unless that comment asked the question.
6. **Record it, optional but useful.** Paste the thread link and the comment you posted into the Claude Code chat with "log these comments". They'll be added to the dashboard's Reddit comments tab as **Posted**. The next morning's drafts then learn from what we actually said.

---

## Do and don't

- **Do:** answer first, be specific, be honest about mixed evidence, and use "we".
- **Don't:** post links, discount codes, "check out SILT", medical advice, or copy-paste the same comment into several threads.
- **Pace:** about 6 to 10 comments a day, spread through the day. A burst of comments from a new account looks like spam.
- **Phase 2 (posting):** once we have about a month of activity and 100+ comment karma, the team decides when to start posting. Post first in the subreddits where our comments got upvotes.
