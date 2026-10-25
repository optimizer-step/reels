import fs from "fs";

// Use a locally installed headless Chrome when one exists (set REMOTION_CHROME to override);
// otherwise Remotion downloads its own.
const candidates = [
  process.env.REMOTION_CHROME,
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
].filter(Boolean);

export const browserExecutable = candidates.find((p) => fs.existsSync(p)) ?? null;
