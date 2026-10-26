// Higgsfield cinematic shots for a reel.
//   node scripts/gen/higgsfield.mjs <slug> [--force] [--only name1,name2]
// Reads src/reels/<slug>/shots.json, generates each missing shot and saves it to
// public/reels/<slug>/broll/<name>.mp4 (+ a provenance record in generated.json).
// Auth: HIGGSFIELD_API_KEY_ID + HIGGSFIELD_API_KEY_SECRET (Authorization: Key id:secret).
// API docs: https://docs.higgsfield.ai (requests, file uploads, model pages).
//
// shots.json:
// { "shots": [
//   { "name": "datacenter",
//     "model": "kling-video/v3.0/std/text-to-video",      // endpoint path on api.higgsfield.ai
//     "params": { "prompt": "...", "duration": 5, "aspect_ratio": "9:16", "sound": "off" } },
//   { "name": "orbit", "model": "kling-video/v3.0/std/image-to-video",
//     "image": "public/reels/<slug>/stills/orbit.png",      // uploaded, passed as image_url
//     "params": { "prompt": "...", "duration": 5, "sound": "off" } } ] }
import fs from "node:fs";
import path from "node:path";
import { ROOT, download, fetchJson, idemKey, recordManifest, requireEnv, requireSlug, sleep } from "./lib.mjs";

const args = process.argv.slice(2);
const { slug, srcDir, pubDir } = requireSlug(args[0]);
const force = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only"));
const only = onlyArg ? (onlyArg.split("=")[1] ?? args[args.indexOf(onlyArg) + 1] ?? "").split(",").filter(Boolean) : null;

const shotsFile = path.join(srcDir, "shots.json");
if (!fs.existsSync(shotsFile)) {
  console.log(`No shots.json for ${slug}; nothing to generate.`);
  process.exit(0);
}
requireEnv("HIGGSFIELD_API_KEY_ID", "HIGGSFIELD_API_KEY_SECRET");
const BASE = process.env.HIGGSFIELD_BASE_URL ?? "https://api.higgsfield.ai";
const auth = { Authorization: `Key ${process.env.HIGGSFIELD_API_KEY_ID}:${process.env.HIGGSFIELD_API_KEY_SECRET}` };

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4" };

/** Upload a local file and return a public URL a model can read. */
const upload = async (file) => {
  const contentType = MIME[path.extname(file).toLowerCase()];
  if (!contentType) throw new Error(`Unsupported upload type: ${file}`);
  const u = await fetchJson(`${BASE}/files/generate-upload-url`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ content_type: contentType }),
  });
  // never send our credentials to the presigned storage URL
  const res = await fetch(u.upload_url, { method: "PUT", headers: u.upload_headers ?? { "Content-Type": contentType }, body: fs.readFileSync(file) });
  if (!res.ok) throw new Error(`upload ${file} -> ${res.status}`);
  return u.public_url;
};

const TERMINAL = new Set(["completed", "failed", "nsfw", "canceled"]);

const { shots } = JSON.parse(fs.readFileSync(shotsFile, "utf8"));
for (const shot of shots) {
  if (only && !only.includes(shot.name)) continue;
  const out = path.join(pubDir, "broll", `${shot.name}.mp4`);
  if (fs.existsSync(out) && !force) {
    console.log(`= ${shot.name}: exists, skipping (use --force to regenerate)`);
    continue;
  }
  console.log(`> ${shot.name}: ${shot.model}`);
  const body = { ...shot.params };
  if (shot.image) body.image_url = await upload(path.join(ROOT, shot.image));
  if (shot.last_image) body.last_image_url = await upload(path.join(ROOT, shot.last_image));
  const sub = await fetchJson(`${BASE}/${shot.model.replace(/^\//, "")}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json", "Idempotency-Key": idemKey(slug, shot.name, JSON.stringify(body), force ? Date.now() : "") },
    body: JSON.stringify(body),
  });
  const statusUrl = sub.status_url ?? `${BASE}/requests/${sub.request_id}/status`;
  let st = sub;
  const started = Date.now();
  while (!TERMINAL.has(st.status)) {
    if (Date.now() - started > 20 * 60 * 1000) throw new Error(`${shot.name}: timed out after 20 min (request ${sub.request_id})`);
    await sleep(6000);
    st = await fetchJson(statusUrl, { headers: auth });
    process.stdout.write(`  ${st.status}\r`);
  }
  if (st.status !== "completed") throw new Error(`${shot.name}: ${st.status} ${JSON.stringify(st.error ?? "")}`);
  const url = st.video?.url ?? st.videos?.[0]?.url ?? st.images?.[0]?.url;
  if (!url) throw new Error(`${shot.name}: completed but no output URL in ${JSON.stringify(st).slice(0, 400)}`);
  await download(url, out);
  recordManifest(pubDir, { tool: "higgsfield", name: shot.name, model: shot.model, params: shot.params, image: shot.image ?? null, request_id: sub.request_id });
}
console.log("Higgsfield: done.");
