import { Config } from "@remotion/cli/config";
import fs from "fs";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);

// Use a locally installed headless Chrome if present (set REMOTION_CHROME to override).
const chrome =
  process.env.REMOTION_CHROME ??
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (fs.existsSync(chrome)) {
  Config.setBrowserExecutable(chrome);
}
