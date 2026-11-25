// Finds Chrome or Edge on Windows or macOS (or use CHROME=/path/to/chrome).
import fs from "node:fs";
export const CHROME = [process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium"].find(f => f && fs.existsSync(f));
if (!CHROME) throw new Error("Chrome not found. Install Google Chrome, or set CHROME=/path/to/chrome.");
