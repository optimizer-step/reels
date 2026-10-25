// Render check stills for a composition.
//   node scripts/stills.mjs ModelCollapse 15 150 330
//   node scripts/stills.mjs ModelCollapse-Cover        (a Still: renders frame 0)
// Output: out/stills/<CompositionId>/f0015.png ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "fs";
import path from "path";
import { browserExecutable } from "./chrome.mjs";

const [id, ...rest] = process.argv.slice(2);
if (!id) {
  console.error("usage: node scripts/stills.mjs <CompositionId> [frame ...]");
  process.exit(1);
}
const frames = rest.length ? rest.map(Number) : [0];
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable, logLevel: "error" });
const dir = path.join("out", "stills", id);
fs.mkdirSync(dir, { recursive: true });
for (const frame of frames) {
  const output = path.join(dir, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame, browserExecutable, logLevel: "error", imageFormat: "png" });
  console.log("wrote", output);
}
