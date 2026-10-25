// Visual QA for a reel without rendering the video:
//   npm run check -- AttentionBank            (a frame every 2 s + first and last)
//   npm run check -- AttentionBank 1          (every 1 s)
// Writes out/check/<Id>/f*.png and contact sheets out/check/<Id>/sheet-N.png,
// and reports how closely the last frame matches frame 0 (for seamless loops).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { browserExecutable } from "./chrome.mjs";

const [id, everyArg] = process.argv.slice(2);
if (!id) {
  console.error("usage: npm run check -- <CompositionId> [everySeconds]");
  process.exit(1);
}
const every = Number(everyArg ?? 2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable, logLevel: "error" });
const { fps, durationInFrames } = composition;
const frames = new Set([0, durationInFrames - 1]);
for (let s = every; s * fps < durationInFrames - 1; s += every) frames.add(Math.round(s * fps));
const sorted = [...frames].sort((a, b) => a - b);

const dir = path.join("out", "check", id);
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const files = [];
for (const frame of sorted) {
  const output = path.join(dir, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame, browserExecutable, logLevel: "error", imageFormat: "png" });
  files.push(output);
}
const per = 6;
for (let i = 0; i < files.length; i += per) {
  const sheet = path.join(dir, `sheet-${i / per + 1}.png`);
  execFileSync("python3", [path.join("scripts", "sheet.py"), sheet, ...files.slice(i, i + per)], { stdio: "inherit" });
  console.log("sheet", sheet);
}
const diff = execFileSync("python3", [
  "-c",
  "import sys;from PIL import Image;import numpy as np;" +
    "a=np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int);" +
    "b=np.asarray(Image.open(sys.argv[2]).convert('RGB')).astype(int);" +
    "print(round(float(np.abs(a-b).mean()),2))",
  files[0],
  files[files.length - 1],
]).toString().trim();
console.log(`loop check: mean pixel difference first vs last frame = ${diff} (under ~6 is seamless; grain alone is ~3-5)`);
