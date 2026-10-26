// Fast frame previews without a full H.264 encode.
// npm run preview -- gradient-descent
// npm run preview -- gradient-descent 0 9.8 15.2 22.8 33
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { browserExecutable } from "./chrome.mjs";

const slug = process.argv[2];
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("Usage: npm run preview -- <slug> [seconds ...]");
  process.exit(1);
}
const id = slug.split("-").map((x) => x[0].toUpperCase() + x.slice(1)).join("");
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable, logLevel: "error" });
const maxSec = (composition.durationInFrames - 1) / composition.fps;
const requested = process.argv.slice(3).map(Number);
if (requested.some((n) => !Number.isFinite(n) || n < 0 || n > maxSec)) {
  console.error("Frame times must be finite seconds between 0 and " + maxSec.toFixed(2));
  process.exit(1);
}
const seconds = requested.length ? requested : [0, 3, 6, 10, 15, 20, 25, 30, 34].filter((t) => t <= maxSec);
const dest = path.join("out", "preview", slug);
fs.mkdirSync(dest, { recursive: true });
for (const t of [...new Set(seconds)]) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = path.join(dest, "f" + String(frame).padStart(4, "0") + ".png");
  await renderStill({ serveUrl, composition, output, frame, browserExecutable, logLevel: "error", imageFormat: "png" });
  console.log(output);
}
const cover = await selectComposition({ serveUrl, id: id + "-Cover", browserExecutable, logLevel: "error" });
await renderStill({
  serveUrl, composition: cover, output: path.join(dest, "cover.png"),
  frame: 0, browserExecutable, logLevel: "error", imageFormat: "png",
});
console.log("Preview complete: " + dest);
