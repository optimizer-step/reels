// Reel 003 timeline. Every time is in SECONDS.
//
// The edit is voice-driven: each beat starts on a voiceover line. vo-lines.json (written by
// scripts/gen/heygen.mjs tts or scripts/gen/vo-assemble.mjs) holds the real line starts; until it
// exists the designed fallback times below are used. Inside a beat, cue("word") lands animation on
// a spoken word (words.json), and everything else is an offset from the beat start.
import { FPS, makeCue, type Impact, type SfxCue, type Word } from "../../kit";
import voLines from "./vo-lines.json";
import words from "./words.json";

export { FPS };
export const SLUG = "gradient-descent";
export const ASSETS = `reels/${SLUG}`;

type Line = { i: number; start: number; end: number };
const lines = voLines as Line[];
/** Start of voiceover line i (1-based), or the designed fallback. */
const L = (i: number, fallback: number) => lines.find((l) => l.i === i)?.start ?? fallback;
const LE = (i: number, fallback: number) => lines.find((l) => l.i === i)?.end ?? fallback;
const cue = makeCue(words as Word[]);

// ---------- Asset flags (files in public/reels/gradient-descent/) ----------
export const USE_VO = lines.length > 0; // vo.mp3 exists once vo-lines.json is filled
export const USE_MUSIC = true; // music.mp3 (scripts/audio/gradient_descent.py)
export const USE_SFX = true; // sfx/*.mp3
export const BROLL = {
  alarm: false, // broll/alarm.mp4 (Higgsfield): smash cut when the loss explodes
  datacenter: false, // broll/datacenter.mp4 (Higgsfield): plate behind the schedule
};
export const PRESENTER = false; // broll/presenter-cta.webm (HeyGen avatar, transparent)

// ---------- Beats (each begins on a voiceover line) ----------
const l2 = L(2, 2.55);
const l3 = L(3, 3.9);
const l4 = L(4, 9.7);
const l5 = L(5, 15.7);
const l6 = L(6, 20.05);
const l7 = L(7, 23.05);
const l8 = L(8, 27.6);
const l9 = L(9, 31.6);
const l10 = L(10, 37.15);
export const DURATION_S = Math.max(l10 + 3.85, LE(10, 40.6) + 0.5);
export const DURATION_FRAMES = Math.round(DURATION_S * FPS);

export const BEATS = {
  hook: { start: 0, end: l2 - 0.05 },
  rewind1: { start: l2 - 0.05, end: l3 - 0.2 },
  valley: { start: l3 - 0.2, end: l4 - 0.1 },
  rule: { start: l4 - 0.1, end: l5 - 0.1 },
  small: { start: l5 - 0.1, end: l6 - 0.65 },
  rewind2: { start: l6 - 0.65, end: l6 - 0.05 },
  right: { start: l6 - 0.05, end: l7 - 0.65 },
  rewind3: { start: l7 - 0.65, end: l7 - 0.05 },
  big: { start: l7 - 0.05, end: l8 - 0.6 },
  chart: { start: l8 - 0.6, end: l9 - 0.1 },
  twist: { start: l9 - 0.1, end: l10 - 0.1 },
  cta: { start: l10 - 0.1, end: DURATION_S },
} as const;
const B = BEATS;

/** Seconds per gradient step in each run (the cold open replays the 0.22 run at the same speed). */
export const STEP_DUR = { hook: 0.34, small: 0.0625, right: 0.13, big: 0.34 };
/** The ball escapes the valley (step 7 lands) on the word "crashes"; the cold open starts earlier in that run. */
const hookEscape = Math.min(B.hook.end - 0.6, cue("crashes", 1, 1.53));
export const HOOK_S0 = Math.max(0.3, 7 - hookEscape / STEP_DUR.hook);
const hookHit = (k: number) => (k - HOOK_S0) * STEP_DUR.hook;

export const CUES = {
  hook: { lines: [hookHit(Math.ceil(HOOK_S0 + 0.01)), hookHit(5), hookHit(7)] as number[], escape: hookEscape },
  valley: {
    headline: cue("learns", 1, B.valley.start + 0.3),
    high: cue("high", 1, B.valley.start + 1.9),
    low: cue("low", 1, B.valley.start + 3.0),
    goal: cue("bottom", 1, B.valley.start + 4.6),
    tag: B.valley.start + 0.9,
  },
  rule: {
    pushIn: B.rule.start,
    slope: cue("slope", 1, B.rule.start + 0.9),
    formula: cue("multiplies", 1, B.rule.start + 1.6),
    slider: cue("learning", 1, B.rule.start + 2.7),
    demo: [B.rule.start + 3.8, B.rule.end - 0.6] as [number, number],
  },
  small: { knob: B.small.start, steps: B.small.start + 0.5, label: B.small.start + 0.3, stillFar: B.small.start + 0.6 + 40 * STEP_DUR.small },
  right: { knob: B.right.start, steps: B.right.start + 0.35, label: B.right.start + 0.15, land: B.right.start + 0.35 + 14 * STEP_DUR.right },
  big: { knob: B.big.start, steps: B.big.start + 0.3, label: B.big.start + 0.15, explode: B.big.start + 0.3 + 7 * STEP_DUR.big },
  chart: {
    whip: B.chart.start,
    headline: B.chart.start + 0.6,
    draw: [B.chart.start + 0.7, B.chart.start + 2.3] as [number, number],
    bigDraw: [B.chart.start + 2.3, B.chart.start + 3.3] as [number, number],
    breakout: B.chart.start + 3.05,
  },
  twist: { morph: B.twist.start, headline: B.twist.start + 0.3, curve: [B.twist.start + 0.8, B.twist.start + 4.1] as [number, number], tag: B.twist.start + 1.5 },
  cta: { headline: B.cta.start + 0.15, sub: B.cta.start + 0.9, whip: DURATION_S - 0.75 },
};

export const RUN_WINDOWS = {
  small: { from: CUES.small.steps, steps: 40 },
  right: { from: CUES.right.steps, steps: 14 },
  big: { from: CUES.big.steps, steps: 9.85 },
};

// ---------- Impacts (camera shake) ----------
const hookHits = [3, 4, 5, 6, 7].filter((k) => k > HOOK_S0).map(hookHit);
const bigHits = [1, 2, 3, 4, 5, 6, 7].map((k) => CUES.big.steps + k * STEP_DUR.big);
export const IMPACTS: Impact[] = [
  ...hookHits.map((t, i) => ({ t, amp: 4 + i * 4 })),
  { t: CUES.hook.escape, amp: 26, decay: 6 },
  { t: CUES.small.knob + 0.35, amp: 3 },
  { t: CUES.right.land, amp: 6 },
  { t: CUES.big.knob + 0.12, amp: 10 },
  ...bigHits.map((t, i) => ({ t, amp: 2 + i * 3 })),
  { t: CUES.big.explode, amp: 28, decay: 5 },
  { t: CUES.chart.breakout, amp: 24, decay: 6 },
];

// ---------- Audio ----------
export const MUSIC_VOLUME = USE_VO ? 0.1 : 0.24;
export const MUSIC_SILENCES = [{ start: CUES.chart.bigDraw[0] + 0.2, end: CUES.chart.breakout }];
export const SFX_CUES: SfxCue[] = [
  ...hookHits.map((t, i) => ({ file: `thud${Math.min(4, i)}`, t, volume: 0.55 + i * 0.08 })),
  { file: "escape", t: CUES.hook.escape, volume: 0.8 },
  { file: "rewind", t: B.rewind1.start, volume: 0.7 },
  { file: "swell", t: B.valley.start, volume: 0.45 },
  { file: "pop", t: CUES.valley.high, volume: 0.45 },
  { file: "pop", t: CUES.valley.low, volume: 0.45 },
  { file: "chime", t: CUES.valley.goal, volume: 0.5 },
  { file: "whoosh", t: CUES.rule.pushIn, volume: 0.45 },
  { file: "pop2", t: CUES.rule.slope, volume: 0.45 },
  { file: "type", t: CUES.rule.formula, volume: 0.5 },
  { file: "rise", t: CUES.rule.slider - 0.1, volume: 0.5 },
  { file: "ratchet", t: CUES.rule.demo[0], volume: 0.45, end: CUES.rule.demo[1] },
  { file: "click", t: CUES.small.knob + 0.35, volume: 0.7 },
  { file: "ticks", t: CUES.small.steps, volume: 0.35 },
  { file: "rewind_short", t: B.rewind2.start, volume: 0.6 },
  { file: "click", t: CUES.right.knob + 0.25, volume: 0.7 },
  { file: "hops", t: CUES.right.steps, volume: 0.5 },
  { file: "land", t: CUES.right.land, volume: 0.6 },
  { file: "rewind_short", t: B.rewind3.start, volume: 0.6 },
  { file: "slam", t: CUES.big.knob + 0.1, volume: 0.8 },
  ...bigHits.map((t, i) => ({ file: `thud${Math.min(4, Math.floor(i * 0.7))}`, t, volume: 0.45 + i * 0.07 })),
  { file: "escape", t: CUES.big.explode, volume: 0.85 },
  { file: "counter", t: CUES.big.explode + 0.15, volume: 0.4 },
  { file: "whip", t: CUES.chart.whip - 0.05, volume: 0.7 },
  { file: "draw", t: CUES.chart.draw[0], volume: 0.4 },
  { file: "tension", t: CUES.chart.bigDraw[0], volume: 0.55, end: CUES.chart.breakout },
  { file: "escape", t: CUES.chart.breakout, volume: 0.85 },
  { file: "whoosh", t: CUES.twist.morph, volume: 0.45 },
  { file: "draw", t: CUES.twist.curve[0], volume: 0.35 },
  { file: "pop2", t: CUES.cta.headline, volume: 0.5 },
  { file: "whip", t: CUES.cta.whip - 0.05, volume: 0.7 },
];
