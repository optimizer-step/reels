// HeyGen (API v3) voice and avatar generation for a reel.
//   node scripts/gen/heygen.mjs voices                 list your cloned voices (to find HEYGEN_VOICE_ID)
//   node scripts/gen/heygen.mjs tts <slug> [--force]   English voiceover from src/reels/<slug>/vo.json
//   node scripts/gen/heygen.mjs avatar <slug> [--force] presenter clips from src/reels/<slug>/presenter.json
// Auth: HEYGEN_API_KEY (x-api-key). Voice: vo.json voice_id or HEYGEN_VOICE_ID. Avatar: presenter.json
// avatar_id or HEYGEN_AVATAR_ID. Docs: https://developers.heygen.com (v3: /v3/voices/speech, /v3/videos).
//
// tts writes public/reels/<slug>/vo.mp3, public/reels/<slug>/vo/line-NN.mp3, src/reels/<slug>/vo-lines.json
// (line starts: the reel's beats) and src/reels/<slug>/words.json (word timings for cue()).
import fs from "node:fs";
import path from "node:path";
import { download, fetchJson, idemKey, recordManifest, requireEnv, requireSlug, sleep } from "./lib.mjs";
import { assemble } from "./vo-assemble.mjs";

const [cmd, slugArg, ...rest] = process.argv.slice(2);
const force = rest.includes("--force");
requireEnv("HEYGEN_API_KEY");
const BASE = process.env.HEYGEN_BASE_URL ?? "https://api.heygen.com";
const H = { "x-api-key": process.env.HEYGEN_API_KEY, "Content-Type": "application/json" };
const data = (j) => j.data ?? j;

if (cmd === "voices") {
  for (const url of [`${BASE}/v3/models/audio/voices`, `${BASE}/v3/voices?type=private`]) {
    try {
      const j = data(await fetchJson(url, { headers: H }));
      const list = Array.isArray(j) ? j : j.voices ?? j.items ?? [];
      console.log(`\n${new URL(url).pathname}:`);
      for (const v of list) console.log(`  ${v.voice_id ?? v.id}  ${v.name ?? ""}  ${v.mode ?? v.type ?? ""}  ${v.status ?? ""}  ${v.language ?? ""}`);
    } catch (e) {
      console.warn(String(e));
    }
  }
  process.exit(0);
}

const { slug, srcDir, pubDir } = requireSlug(slugArg);

if (cmd === "tts") {
  const vo = JSON.parse(fs.readFileSync(path.join(srcDir, "vo.json"), "utf8"));
  const voiceId = vo.voice_id || process.env.HEYGEN_VOICE_ID;
  if (!voiceId) throw new Error("No voice: set voice_id in vo.json or the HEYGEN_VOICE_ID secret");
  const lineDir = path.join(pubDir, "vo");
  const lines = [];
  for (let i = 0; i < vo.lines.length; i++) {
    const L = vo.lines[i];
    const file = path.join(lineDir, `line-${String(i + 1).padStart(2, "0")}.mp3`);
    const meta = file.replace(/\.mp3$/, ".json");
    if (fs.existsSync(file) && fs.existsSync(meta) && !force) {
      lines.push({ file, ...JSON.parse(fs.readFileSync(meta, "utf8")), hold: L.hold });
      console.log(`= line ${i + 1}: exists`);
      continue;
    }
    console.log(`> line ${i + 1}: ${L.text}`);
    const body = { text: L.text, voice_id: voiceId, speed: L.speed ?? vo.speed ?? 1, language: "en" };
    const j = data(await fetchJson(`${BASE}/v3/voices/speech`, { method: "POST", headers: { ...H, "Idempotency-Key": idemKey(slug, i, L.text, voiceId) }, body: JSON.stringify(body) }));
    await download(j.audio_url, file);
    const m = { text: L.text, duration: j.duration, words: (j.word_timestamps ?? []).map((w) => ({ text: w.word, start: w.start, end: w.end })), audio_url: j.audio_url };
    fs.writeFileSync(meta, JSON.stringify(m, null, 2));
    lines.push({ file, ...m, hold: L.hold });
  }
  assemble({ slug, srcDir, pubDir, lines, gap: vo.gap ?? 0.35 });
  recordManifest(pubDir, { tool: "heygen-tts", name: "vo", voice_id: voiceId, lines: vo.lines.length });
  process.exit(0);
}

if (cmd === "avatar") {
  const pres = JSON.parse(fs.readFileSync(path.join(srcDir, "presenter.json"), "utf8"));
  const avatarId = pres.avatar_id || process.env.HEYGEN_AVATAR_ID;
  if (!avatarId) throw new Error("No avatar: set avatar_id in presenter.json or the HEYGEN_AVATAR_ID secret");
  for (const clip of pres.clips) {
    const ext = clip.transparent === false ? "mp4" : "webm";
    const out = path.join(pubDir, "broll", `${clip.name}.${ext}`);
    if (fs.existsSync(out) && !force) {
      console.log(`= ${clip.name}: exists`);
      continue;
    }
    // lip-sync to the generated voiceover line when available, else speak the script
    let audio_url;
    if (clip.line) {
      const meta = path.join(pubDir, "vo", `line-${String(clip.line).padStart(2, "0")}.json`);
      if (fs.existsSync(meta)) audio_url = JSON.parse(fs.readFileSync(meta, "utf8")).audio_url;
    }
    const body = {
      type: "avatar",
      avatar_id: avatarId,
      aspect_ratio: clip.aspect_ratio ?? "9:16",
      resolution: clip.resolution ?? "1080p",
      title: `${slug} · ${clip.name}`,
      ...(audio_url ? { audio_url } : { script: clip.script, voice_id: pres.voice_id || process.env.HEYGEN_VOICE_ID }),
      ...(ext === "webm" ? { output_format: "webm" } : { background: { type: "color", value: clip.background ?? "#0B0B0F" } }),
    };
    console.log(`> ${clip.name}: avatar ${avatarId}${audio_url ? " (lip-sync to VO line)" : ""}`);
    const created = data(await fetchJson(`${BASE}/v3/videos`, { method: "POST", headers: { ...H, "Idempotency-Key": idemKey(slug, clip.name, JSON.stringify(body)) }, body: JSON.stringify(body) }));
    const id = created.video_id;
    let v = created;
    const started = Date.now();
    while (!["completed", "failed"].includes(v.status)) {
      if (Date.now() - started > 30 * 60 * 1000) throw new Error(`${clip.name}: timed out (video ${id})`);
      await sleep(10000);
      v = data(await fetchJson(`${BASE}/v3/videos/${id}`, { headers: H }));
      process.stdout.write(`  ${v.status}\r`);
    }
    if (v.status !== "completed") throw new Error(`${clip.name}: failed ${v.failure_code ?? ""} ${v.failure_message ?? ""}`);
    await download(v.video_url, out);
    recordManifest(pubDir, { tool: "heygen-avatar", name: clip.name, avatar_id: avatarId, video_id: id, lip_sync: Boolean(audio_url) });
  }
  process.exit(0);
}

console.error("usage: heygen.mjs voices | tts <slug> | avatar <slug>");
process.exit(1);
