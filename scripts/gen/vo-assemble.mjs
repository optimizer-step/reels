// Assemble voiceover lines into one track placed on the reel's beats, and write word timings.
//
// Used by heygen.mjs tts, and directly for a human recording:
//   node scripts/gen/vo-assemble.mjs <slug> <recording.(m4a|mp3|wav)>
// For a recording, the take is split at pauses (one line per segment, in vo.json order) and each
// line's words are spread across its speech by syllable count (approximate, but beat-accurate).
//
// Each line starts at max(previous start + previous `hold`, previous end + gap): `hold` is the
// minimum length of that line's beat, so animations always get their designed time and the voice
// never overlaps itself. The reel's beats are derived from the resulting line starts. Outputs:
//   public/reels/<slug>/vo.mp3, src/reels/<slug>/vo-lines.json, src/reels/<slug>/words.json
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { ffprobeDuration, requireSlug } from "./lib.mjs";

const syllables = (w) => Math.max(1, (w.toLowerCase().replace(/[^a-z]/g, "").match(/[aeiouy]+/g) ?? []).length);

/** Spread a line's words over [0, dur] by syllable weight (fallback when no timestamps). */
export const estimateWords = (text, dur) => {
  const words = text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w));
  const weights = words.map(syllables);
  const total = weights.reduce((a, b) => a + b, 0);
  let t = 0;
  return words.map((w, i) => {
    const d = (dur * weights[i]) / total;
    const out = { text: w, start: +t.toFixed(3), end: +(t + d).toFixed(3) };
    t += d;
    return out;
  });
};

export const assemble = ({ slug, srcDir, pubDir, lines, gap = 0.35, lead = 0.05 }) => {
  let prev = null;
  const placed = lines.map((L, i) => {
    const dur = L.duration ?? ffprobeDuration(L.file);
    const byHold = prev ? prev.start + (prev.hold ?? 0) : lead;
    const byEnd = prev ? prev.start + prev.dur + gap : lead;
    const start = Math.max(byHold, byEnd);
    if (prev && byEnd > byHold + 0.05) console.log(`  line ${i} runs ${(byEnd - byHold).toFixed(2)} s past its beat; beat ${i} stretches`);
    prev = { start, dur, hold: L.hold };
    const words = (L.words?.length ? L.words : estimateWords(L.text, dur)).map((w) => ({ text: w.text, start: +(start + w.start).toFixed(3), end: +(start + w.end).toFixed(3) }));
    return { i: i + 1, file: L.file, start: +start.toFixed(3), end: +(start + dur).toFixed(3), text: L.text, words };
  });
  // mix: delay each line to its start and sum
  const inputs = placed.flatMap((p) => ["-i", p.file]);
  const chains = placed.map((p, k) => `[${k}:a]aresample=48000,adelay=${Math.round(p.start * 1000)}|${Math.round(p.start * 1000)}[a${k}]`);
  const mix = `${placed.map((_, k) => `[a${k}]`).join("")}amix=inputs=${placed.length}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9[out]`;
  const out = path.join(pubDir, "vo.mp3");
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", [...chains, mix].join(";"), "-map", "[out]", "-ar", "48000", "-b:a", "192k", out]);
  fs.writeFileSync(path.join(srcDir, "vo-lines.json"), JSON.stringify(placed.map(({ words, ...p }) => ({ ...p, file: path.basename(p.file) })), null, 2) + "\n");
  fs.writeFileSync(path.join(srcDir, "words.json"), JSON.stringify(placed.flatMap((p) => p.words), null, 1) + "\n");
  console.log(`VO assembled: ${placed.length} lines, ends at ${placed.at(-1).end.toFixed(2)} s -> ${path.basename(out)} + words.json`);
  return placed;
};

/** Split a single human take into line clips at silences. */
const splitRecording = (file, nLines, outDir) => {
  // silencedetect reports on stderr
  const log = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "silencedetect=noise=-35dB:d=0.55", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const total = ffprobeDuration(file);
  // speech segments = gaps between silences
  const segs = [];
  let s = 0;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] - s > 0.25) segs.push([s, starts[i]]);
    s = ends[i] ?? total;
  }
  if (total - s > 0.25) segs.push([s, total]);
  if (segs.length !== nLines) {
    console.error(`Found ${segs.length} speech segments but vo.json has ${nLines} lines. Re-record with clearer 1–2 s pauses, or adjust silencedetect.`);
    console.error(segs.map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join("  "));
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  return segs.map(([a, b], i) => {
    const out = path.join(outDir, `line-${String(i + 1).padStart(2, "0")}.wav`);
    const pa = Math.max(0, a - 0.06);
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-ss", String(pa), "-to", String(b + 0.12), "-af", "highpass=f=80,afade=t=in:d=0.02", "-ar", "48000", out]);
    return out;
  });
};

if (process.argv[1] && process.argv[1].endsWith("vo-assemble.mjs")) {
  const [slugArg, rec] = process.argv.slice(2);
  const { slug, srcDir, pubDir } = requireSlug(slugArg);
  const vo0 = JSON.parse(fs.readFileSync(path.join(srcDir, "vo.json"), "utf8"));
  if (rec === "--lines") {
    // per-line clips already in public/reels/<slug>/vo (line-NN.json beside each clip, e.g. from kokoro_tts.py)
    const lines = vo0.lines.map((L, i) => {
      const meta = JSON.parse(fs.readFileSync(path.join(pubDir, "vo", `line-${String(i + 1).padStart(2, "0")}.json`), "utf8"));
      return { ...meta, file: path.join(pubDir, "vo", meta.file), text: meta.text ?? L.text, hold: L.hold };
    });
    assemble({ slug, srcDir, pubDir, gap: vo0.gap ?? 0.35, lines });
    process.exit(0);
  }
  if (!rec || !fs.existsSync(rec)) {
    console.error("usage: node scripts/gen/vo-assemble.mjs <slug> <recording file>");
    process.exit(1);
  }
  const vo = JSON.parse(fs.readFileSync(path.join(srcDir, "vo.json"), "utf8"));
  const files = splitRecording(rec, vo.lines.length, path.join(pubDir, "vo"));
  assemble({ slug, srcDir, pubDir, gap: vo.gap ?? 0.35, lines: vo.lines.map((L, i) => ({ file: files[i], text: L.text, hold: L.hold })) });
}
