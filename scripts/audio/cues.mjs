// Print a reel's timeline (BEATS, CUES, SFX_CUES, ...) as JSON so the sound scripts can score to it.
//   node scripts/audio/cues.mjs gradient-descent > cues.json
// The timeline is TypeScript that imports the kit and JSON; esbuild bundles it into a temp module.
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const slug = process.argv[2];
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("usage: node scripts/audio/cues.mjs <slug>");
  process.exit(1);
}
const entry = path.resolve("src", "reels", slug, "timeline.ts");
// inside the repo so the bundle resolves node_modules
const out = path.resolve("node_modules", ".cache", "cues", `${slug}.mjs`);
fs.mkdirSync(path.dirname(out), { recursive: true });
await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: out,
  logLevel: "error",
  // the timeline only needs constants from the kit; React/Remotion components are never called
  external: ["react", "react-dom", "remotion", "@remotion/*"],
});
const m = await import(pathToFileURL(out).href);
const keep = Object.fromEntries(Object.entries(m).filter(([, v]) => typeof v !== "function"));
process.stdout.write(JSON.stringify(keep, null, 1) + "\n");
