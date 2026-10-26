// Reel 004 timeline. Every time is in SECONDS.
//
// Voice-driven: each beat starts on a voiceover line (vo-lines.json, written by the voice tools in
// scripts/gen), and cue("word") lands animation on spoken words (words.json). Fallbacks below are
// the designed times for when no voice exists yet.
import { END_CARD, FPS, makeCue, type Impact, type SfxCue, type Word } from "../../kit";
import voLines from "./vo-lines.json";
import words from "./words.json";

export { FPS };
export const SLUG = "lazy-import";
export const ASSETS = `reels/${SLUG}`;

type Line = { i: number; start: number; end: number };
const lines = voLines as Line[];
const L = (i: number, fallback: number) => lines.find((l) => l.i === i)?.start ?? fallback;
const LE = (i: number, fallback: number) => lines.find((l) => l.i === i)?.end ?? fallback;
const cue = makeCue(words as Word[]);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// ---------- Asset flags (files in public/reels/lazy-import/) ----------
export const USE_VO = lines.length > 0;
export const USE_MUSIC = true;
export const USE_SFX = true;
/** mix.mp3 (voice + score + SFX, mastered by scripts/audio/lazy_import.py) instead of live layers */
export const USE_MIX = true;

// ---------- Beats (each begins on a voice line) ----------
const l2 = L(2, 3.54);
const l3 = L(3, 6.67);
const l4 = L(4, 10.38);
const l5 = L(5, 15.04);
const l6 = L(6, 18.58);
const l7 = L(7, 21.59);
const l8 = L(8, 28.42);
const l9 = L(9, 36.35);
const l10 = L(10, 42.93);
/** brand end card (logo + Follow) after the comment box has sent, before the loop whip */
const END_START = Math.max(l10 + 2.35, LE(10, 44.68) + 0.5);
export const DURATION_S = END_START + END_CARD.length + 0.72;
export const DURATION_FRAMES = Math.round(DURATION_S * FPS);

export const BEATS = {
  hook: { start: 0, end: l2 - 0.15 },
  why: { start: l2 - 0.15, end: l3 - 0.1 },
  cascade: { start: l3 - 0.1, end: l4 - 0.1 },
  total: { start: l4 - 0.1, end: l5 - 0.1 },
  hack: { start: l5 - 0.1, end: l6 - 0.1 },
  lazy: { start: l6 - 0.1, end: l7 - 0.1 },
  token: { start: l7 - 0.1, end: l8 - 0.15 },
  history: { start: l8 - 0.15, end: l9 - 0.15 },
  payoff: { start: l9 - 0.15, end: l10 - 0.1 },
  cta: { start: l10 - 0.1, end: END_START },
  end: { start: END_START, end: DURATION_S },
} as const;
const B = BEATS;

// ---------- The race (hook), shown slowed 4x ----------
export const SLOW = 4;
export const RUN = { normalMs: 788, lazyMs: 48, normalModules: 892, lazyModules: 67, normalMB: 125, lazyMB: 22 };
export const RACE = {
  start: 0.12,
  /** both runs start here; lazy finishes at 48 ms x 4, normal at 788 ms x 4 (clamped to the beat) */
  lazyEnd: 0.12 + (RUN.lazyMs / 1000) * SLOW,
  normalEnd: Math.min(B.hook.end - 0.15, 0.12 + (RUN.normalMs / 1000) * SLOW),
};

export const CUES = {
  hook: {
    // both lines are on screen by ~1.2 s so the hook reads on mute (line 2 leads the spoken "sixteen")
    lines: [0.3, Math.min(1.2, cue("sixteen", 1, 1.2))] as number[],
    tag: 1.0,
  },
  why: {
    pull: B.why.start,
    run: [cue("every", 1, B.why.start + 0.5), cue("starts", 1, B.why.start + 2.2)] as [number, number],
    waiting: cue("starts", 1, B.why.start + 2.2),
  },
  cascade: {
    lift: B.cascade.start,
    bloom: [cue("pandas", 1, B.cascade.start + 0.2) + 0.15, cue("sixty-five", 1, B.cascade.start + 2.7) + 0.35] as [number, number],
  },
  total: {
    zoom: B.total.start,
    bloom: [B.total.start + 0.3, cue("ninety-two", 1, B.total.start + 2.4) + 0.4] as [number, number],
    help: cue("modules", 1, B.total.start + 2.8),
    stamp: cue("none", 1, B.total.start + 3.9),
  },
  hack: {
    sink: [cue("hide", 1, B.hack.start + 0.7), cue("functions", 1, B.hack.start + 1.9) + 0.4] as [number, number],
    mess: cue("dodge", 1, B.hack.start + 2.4),
    tag: cue("functions", 1, B.hack.start + 1.9),
  },
  lazy: {
    rise: B.lazy.start,
    stamp: cue("lazy", 1, B.lazy.start + 2.1),
  },
  token: {
    collapse: B.token.start,
    tokens: cue("token", 1, B.token.start + 0.9),
    dosa: cue("dosa", 1, B.token.start + 1.9),
    useA: cue("used", 2, B.token.start + 3.3),
    useB: cue("used", 2, B.token.start + 3.3) + 0.55,
    never: cue("never", 1, B.token.start + 4.9),
    stamp: cue("loaded", 1, B.token.start + 5.9),
  },
  history: {
    whip: B.history.start,
    a: cue("making", 1, B.history.start + 0.9),
    reject: cue("rejected", 1, B.history.start + 2.4),
    risky: cue("risky", 1, B.history.start + 4.6),
    b: cue("opt-in", 1, B.history.start + 5.9) - 0.3,
    accept: cue("opt-in", 1, B.history.start + 5.9) + 0.2,
    c: cue("line", 1, B.history.start + 6.6) + 0.35,
  },
  payoff: {
    whip: B.payoff.start,
    cards: [cue("faster", 2, B.payoff.start + 0.2), cue("memory", 1, B.payoff.start + 1.0), cue("cleaner", 1, B.payoff.start + 1.6)] as number[],
    catch: cue("catch", 1, B.payoff.start + 2.7),
    fail: cue("fails", 1, B.payoff.start + 4.3),
  },
  cta: {
    headline: B.cta.start + 0.15,
    sub: B.cta.start + 0.7,
    whip: DURATION_S - 0.7,
  },
};

// line-by-line playhead in the "why" beat: one import per step
export const WHY_STEPS = [0, 1, 2, 3].map((k) => CUES.why.run[0] + ((CUES.why.run[1] - CUES.why.run[0]) * k) / 4);
// token beat: playhead reaches the pandas line, then the matplotlib line
export const TOKEN_USE = { pd: clamp(CUES.token.useA - 0.15, B.token.start + 1.5, B.token.end - 2), plt: CUES.token.useB };

// ---------- Impacts (camera shake) ----------
export const IMPACTS: Impact[] = [
  { t: CUES.hook.lines[1], amp: 7 },
  { t: CUES.total.stamp, amp: 14, decay: 7 },
  { t: CUES.lazy.stamp, amp: 10 },
  { t: CUES.token.stamp, amp: 6 },
  { t: CUES.history.reject, amp: 12 },
  { t: CUES.history.accept, amp: 8 },
  { t: CUES.payoff.catch, amp: 8 },
];

// ---------- Audio (scripts/audio/lazy_import.py renders the files and the mix) ----------
export const MUSIC_VOLUME = 0.22;
export const MUSIC_SILENCES: { start: number; end: number }[] = [];
const ctaType = CUES.cta.sub + 0.25; // scenes/Cta.tsx: 4 chars over 0.35–0.95 s, send at 1.15 s
export const SFX_CUES: SfxCue[] = [
  // the race
  { file: "enter", t: RACE.start - 0.02, volume: 0.5 },
  { file: "rain", t: RACE.start, volume: 0.42 },
  { file: "ding", t: RACE.lazyEnd, volume: 0.5 },
  { file: "thunk", t: RACE.normalEnd, volume: 0.5 },
  { file: "hit", t: CUES.hook.lines[0], volume: 0.35 },
  { file: "hit", t: CUES.hook.lines[1], volume: 0.45 },
  // why: each import line runs; the start-up bar grows
  { file: "whip", t: B.why.start - 0.12, volume: 0.5 },
  ...WHY_STEPS.map((t, k) => ({ file: k === 1 || k === 2 ? "seg_l" : "seg_s", t, volume: 0.45 })),
  { file: "clock", t: CUES.why.waiting, volume: 0.35 },
  // cascade and total: every module in the real trees is a tick
  { file: "lift", t: B.cascade.start, volume: 0.4 },
  { file: "cascade", t: CUES.cascade.bloom[0], volume: 0.5 },
  { file: "whoosh", t: B.total.start, volume: 0.3 },
  { file: "bloom", t: CUES.total.bloom[0], volume: 0.45 },
  { file: "stamp", t: CUES.total.stamp, volume: 0.7 },
  // the old hack
  { file: "slide", t: CUES.hack.sink[0], volume: 0.45 },
  { file: "nope", t: CUES.hack.mess, volume: 0.35 },
  // one word
  { file: "rise", t: B.lazy.start + 0.1, volume: 0.35 },
  { file: "type", t: CUES.lazy.stamp, volume: 0.45 },
  { file: "lazyhit", t: CUES.lazy.stamp, volume: 0.7 },
  // tokens
  ...[0, 1, 2].map((k) => ({ file: "print", t: CUES.token.tokens + k * 0.12, volume: 0.4 })),
  { file: "bell", t: CUES.token.dosa, volume: 0.45 },
  { file: "flip", t: TOKEN_USE.pd, volume: 0.5 },
  { file: "flip", t: TOKEN_USE.plt, volume: 0.45 },
  { file: "stamp2", t: CUES.token.stamp, volume: 0.5 },
  // history
  { file: "whipx", t: B.history.start - 0.1, volume: 0.5 },
  { file: "pop", t: CUES.history.a, volume: 0.35 },
  { file: "reject", t: CUES.history.reject, volume: 0.6 },
  { file: "pop", t: CUES.history.b, volume: 0.35 },
  { file: "accept", t: CUES.history.accept, volume: 0.55 },
  { file: "chime", t: CUES.history.c, volume: 0.4 },
  // payoff and the catch
  { file: "whip", t: B.payoff.start - 0.1, volume: 0.5 },
  ...CUES.payoff.cards.map((t) => ({ file: "card", t, volume: 0.4 })),
  { file: "uhoh", t: CUES.payoff.catch - 0.05, volume: 0.5 },
  { file: "error", t: CUES.payoff.fail, volume: 0.45 },
  // CTA
  { file: "hit", t: CUES.cta.headline, volume: 0.35 },
  { file: "hit", t: CUES.cta.headline + 0.28, volume: 0.4 },
  ...[1, 2, 3, 4].map((k) => ({ file: "key", t: ctaType + 0.35 + (k * 0.6) / 4.999, volume: 0.3 })),
  { file: "send", t: ctaType + 1.15, volume: 0.4 },
  // brand end card
  { file: "logo", t: B.end.start - 0.02, volume: 0.6 },
  { file: "tap", t: B.end.start + END_CARD.press, volume: 0.45 },
  { file: "follow", t: B.end.start + END_CARD.following, volume: 0.5 },
  { file: "whip", t: CUES.cta.whip - 0.05, volume: 0.5 },
];
