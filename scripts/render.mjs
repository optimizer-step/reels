// Render a reel end to end:
//   npm run render -- model-collapse
// Produces out/<slug>/master.mp4 (CRF 18), out/<slug>/<slug>.mp4 (upload-sized, ~16 Mbps cap)
// and out/<slug>/cover.png.
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { browserExecutable } from "./chrome.mjs";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: npm run render -- <slug>   (folder name in src/reels)");
  process.exit(1);
}
const pascal = slug
  .replace(/^_/, "")
  .split(/[-_]/)
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join("");
const out = path.join("out", slug);
fs.mkdirSync(out, { recursive: true });
const browser = browserExecutable ? ["--browser-executable", browserExecutable] : [];
const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });

console.log(`Rendering ${pascal} ...`);
run("npx", ["remotion", "render", pascal, path.join(out, "master.mp4"), "--codec=h264", "--crf=18", ...browser]);
run("npx", ["remotion", "still", `${pascal}-Cover`, path.join(out, "cover.png"), ...browser]);
console.log("Encoding upload copy ...");
run("ffmpeg", [
  "-v", "error", "-y", "-i", path.join(out, "master.mp4"),
  "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-maxrate", "16M", "-bufsize", "32M",
  "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
  "-c:a", "aac", "-b:a", "192k", path.join(out, `${slug}.mp4`),
]);
console.log(`Done: ${path.join(out, `${slug}.mp4`)}`);
