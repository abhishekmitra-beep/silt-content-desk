# SILT Statics GPT (ChatGPT): the generator

Claude is the thinker: it writes each static and a ChatGPT prompt for it. This GPT is the generator: it makes the static images from those prompts.

Each person sets this up once. It needs a ChatGPT plan that can create GPTs.

1. Go to https://chatgpt.com/gpts/editor and choose **Configure**.
2. **Name:** SILT Statics.
3. **Instructions:** paste everything in `GPT_INSTRUCTIONS.txt` (next to this file).
4. **Capabilities:** turn on **Image Generation**.
5. **Actions:** choose Create new action, then paste the contents of `openapi.json`. Authentication: None.
6. Save it as **Only me**, or **Anyone with the link** inside the team.

## How to use it

- Say **"make the images for the waiting SILT statics"**. It lists the statics Claude wrote that still need an image, then makes them one by one.
- Or paste any static's prompt from the site (**Copy for ChatGPT** on the Ideas tab). Attach the SILT pack image the site links to.
- Download each image, then press **⬆ Image** on its static on the Ideas tab. Tick ✓ to send it to Team Approval, or ✕ to drop it.
