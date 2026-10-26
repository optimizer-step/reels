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
/** mix.mp3: voice + music + every SFX cue below, mastered by scripts/audio/gradient_descent.py.
 * When on, the reel plays this one track (no clipping from summing layers); off = live layers. */
export const USE_MIX = true;
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

/** The ball escapes the valley (step 7 lands) on the word "crashes"; the cold open starts part-way
 * into the 0.22 run, and if the line is long the hops slow a little so step 7 still lands on the word. */
const hookEscape = Math.min(B.hook.end - 0.6, cue("crashes", 1, 1.53));
export const HOOK_S0 = Math.max(0.3, 7 - hookEscape / 0.34);
/** Seconds per gradient step in each run. */
export const STEP_DUR = { hook: hookEscape / (7 - HOOK_S0), small: 0.0625, right: 0.13, big: 0.34 };
const hookHit = (k: number) => (k - HOOK_S0) * STEP_DUR.hook;
const hookK0 = Math.ceil(HOOK_S0 + 0.01);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** The 0.22 run starts so the ball leaves the valley (step 7) on "...flies right out". */
const bigSteps = clamp(cue("out", 1, 0) - 7 * STEP_DUR.big, B.big.start + 0.25, B.big.start + 0.9);

export const CUES = {
  // the three headline lines slam on bounces, all on screen inside the first ~1.5 s (works on mute)
  hook: { lines: [hookHit(hookK0), hookHit(Math.min(5, hookK0 + 2)), hookHit(Math.min(6, hookK0 + 3))] as number[], escape: hookEscape },
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
  small: {
    knob: B.small.start,
    steps: B.small.start + 0.5,
    label: cue("too small", 1, B.small.start + 0.3),
    stillFar: Math.max(B.small.start + 0.6 + 40 * STEP_DUR.small, cue("barely", 1, 0)),
  },
  right: { knob: B.right.start, steps: B.right.start + 0.25, label: cue("just right", 1, B.right.start + 0.15), land: B.right.start + 0.25 + 14 * STEP_DUR.right },
  big: { knob: B.big.start, steps: bigSteps, label: cue("too big", 1, B.big.start + 0.15), explode: bigSteps + 7 * STEP_DUR.big },
  chart: {
    whip: B.chart.start,
    headline: B.chart.start + 0.6,
    draw: [B.chart.start + 0.7, B.chart.start + 2.3] as [number, number],
    bigDraw: [B.chart.start + 2.3, B.chart.start + 3.3] as [number, number],
    breakout: B.chart.start + 3.05,
  },
  twist: (() => {
    // "...don't use one fixed number" draws a flat line; "warm up, peak, then slow down" draws the
    // schedule, its head passing each label as the word is spoken (keys: [time, head 0..1])
    const fixed = cue("fixed", 1, B.twist.start + 1.6) - 0.2;
    const k0 = Math.max(fixed + 0.9, cue("warm", 1, B.twist.start + 2.6) - 0.15);
    const k1 = Math.max(k0 + 0.35, cue("peak", 1, k0 + 0.5) + 0.05);
    const k2 = Math.max(k1 + 0.6, cue("slow", 1, k1 + 0.9) + 0.25);
    const k3 = Math.max(k2 + 0.5, B.twist.end - 0.2);
    return {
      morph: B.twist.start,
      headline: B.twist.start + 0.3,
      tag: B.twist.start + 1.2,
      fixed,
      keys: [[k0, 0], [k1, 0.12], [k2, 0.58], [k3, 1]] as [number, number][],
      curve: [k0, k3] as [number, number],
    };
  })(),
  cta: { headline: B.cta.start + 0.15, sub: B.cta.start + 0.9, whip: DURATION_S - 0.75 },
};

export const RUN_WINDOWS = {
  small: { from: CUES.small.steps, steps: 40 },
  right: { from: CUES.right.steps, steps: 14 },
  big: { from: CUES.big.steps, steps: 9.85 },
};

// ---------- Impacts (camera shake) ----------
// hits on every wall bounce; step 7 is the escape itself (its own, bigger impact)
const hookHits = Array.from({ length: Math.max(0, 7 - hookK0) }, (_, i) => hookHit(hookK0 + i));
const bigHits = [1, 2, 3, 4, 5, 6].map((k) => CUES.big.steps + k * STEP_DUR.big);
export const IMPACTS: Impact[] = [
  ...hookHits.map((t, i) => ({ t, amp: 3 + i * 3.5 })),
  { t: CUES.hook.escape, amp: 26, decay: 6 },
  { t: CUES.small.knob + 0.35, amp: 3 },
  { t: CUES.right.land, amp: 6 },
  { t: CUES.big.knob + 0.12, amp: 10 },
  ...bigHits.map((t, i) => ({ t, amp: 2 + i * 3 })),
  { t: CUES.big.explode, amp: 28, decay: 5 },
  { t: CUES.chart.breakout, amp: 24, decay: 6 },
];

// ---------- Audio ----------
// music.mp3 is scored to this timeline and ducked under the voice by scripts/audio/gradient_descent.py
// (re-run it whenever the voiceover or the timeline changes; the Generate assets workflow does).
export const MUSIC_VOLUME = 0.32;
// the score already drops out before the breakout (and sucks in with a reversed swell)
export const MUSIC_SILENCES: { start: number; end: number }[] = [];
const F = CUES.rule.formula;
const S = CUES.rule.slider;
const typeAt = CUES.cta.sub + 0.35; // CommentBox in scenes/Board.tsx: types 4 chars over 0.6–1.3 s, sends at 1.6 s
export const SFX_CUES: SfxCue[] = [
  // cold open
  ...hookHits.map((t, i) => ({ file: `thud${Math.min(4, i)}`, t, volume: 0.26 + i * 0.05 })),
  { file: "escape", t: CUES.hook.escape, volume: 0.55 },
  { file: "rewind", t: B.rewind1.start, volume: 0.55 },
  // the valley
  { file: "swell", t: B.valley.start, volume: 0.3 },
  { file: "pop", t: CUES.valley.high, volume: 0.4 },
  { file: "pop2", t: CUES.valley.low, volume: 0.4 },
  { file: "chime", t: CUES.valley.goal, volume: 0.45 },
  // the rule: formula tokens, slider in, demo sweep (one detent tick per 0.01)
  { file: "whoosh", t: CUES.rule.pushIn, volume: 0.35 },
  { file: "pop", t: CUES.rule.slope, volume: 0.35 },
  ...[F, F + 0.12, F + 0.3, S, S + 0.15].map((t) => ({ file: "key", t, volume: 0.32 })),
  { file: "rise", t: S - 0.55, volume: 0.4 },
  { file: "ratchet", t: CUES.rule.demo[0], volume: 0.35 },
  // three runs
  { file: "hud", t: B.small.start, volume: 0.4 },
  { file: "click", t: CUES.small.knob + 0.35, volume: 0.6 },
  { file: "ticks", t: CUES.small.steps, volume: 0.4 },
  { file: "meh", t: CUES.small.stillFar, volume: 0.4 },
  { file: "rewind_short", t: B.rewind2.start, volume: 0.5 },
  { file: "click", t: CUES.right.knob + 0.25, volume: 0.6 },
  { file: "hops", t: CUES.right.steps, volume: 0.5 },
  { file: "land", t: CUES.right.land, volume: 0.55 },
  { file: "rewind_short", t: B.rewind3.start, volume: 0.5 },
  { file: "slam", t: CUES.big.knob + 0.1, volume: 0.45 },
  ...bigHits.map((t, i) => ({ file: `thud${Math.min(4, Math.floor(i * 0.8))}`, t, volume: 0.24 + i * 0.05 })),
  { file: "escape", t: CUES.big.explode, volume: 0.6 },
  { file: "counter", t: CUES.big.explode + 0.35, volume: 0.4 },
  // the chart
  { file: "whip", t: CUES.chart.whip - 0.04, volume: 0.6 },
  { file: "draw", t: CUES.chart.draw[0], volume: 0.35 },
  { file: "tension", t: CUES.chart.bigDraw[0], volume: 0.5, end: CUES.chart.breakout },
  { file: "glitch", t: CUES.chart.breakout - 0.03, volume: 0.45 },
  { file: "escape", t: CUES.chart.breakout, volume: 0.75 },
  // the twist: a flat tone for "one fixed number", then the schedule played as pitch
  { file: "whoosh", t: CUES.twist.morph, volume: 0.35 },
  { file: "flat", t: CUES.twist.fixed, volume: 0.35 },
  { file: "sched", t: CUES.twist.curve[0], volume: 0.4 },
  // CTA
  { file: "hit", t: CUES.cta.headline, volume: 0.35 },
  { file: "hit", t: CUES.cta.headline + 0.3, volume: 0.4 },
  ...[1, 2, 3, 4].map((k) => ({ file: "key", t: typeAt + 0.6 + k * 0.175, volume: 0.3 })),
  { file: "send", t: typeAt + 1.6, volume: 0.45 },
  { file: "whip", t: CUES.cta.whip - 0.04, volume: 0.6 },
];
