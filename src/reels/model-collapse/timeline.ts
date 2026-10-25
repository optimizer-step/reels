// Every time in this file is in SECONDS. Change these to match your voiceover;
// all animation is driven from here, so the reel retimes itself.

import { FPS } from "../../kit/theme";
import type { SfxCue } from "../../kit/components/ReelAudio";

export { FPS };
export const DURATION_S = 54;
export const DURATION_FRAMES = Math.round(DURATION_S * FPS);

// All of this reel's files live in public/reels/model-collapse/
export const ASSETS = "reels/model-collapse";

// ---------- Asset flags ----------
// When a flag is false, the code-made fallback is used. Missing files never crash the render
// as long as their flag is false. Paths are inside public/reels/model-collapse/.
export const USE_VO = false; // vo.mp3
export const USE_MUSIC = true; // music.mp3 (generated bed ships with the repo)
export const USE_SFX = true; // sfx/*.mp3 (generated SFX ship with the repo)
export const USE_CAPTIONS = false; // captions.json
export const BROLL = {
  copier: false, // broll/copier.mp4
  robotCopy: false, // broll/robot-copy.mp4
  humanHand: false, // broll/human-hand.mp4
};

// ---------- Beats ----------
export const BEATS = {
  hook: { start: 0, end: 3 },
  stakes: { start: 3, end: 9 },
  proof: { start: 9, end: 15 },
  openLoop: { start: 15, end: 19.5 },
  reveal: { start: 19.5, end: 24.5 },
  rehook: { start: 24.5, end: 32.5 },
  whyCare: { start: 32.5, end: 39 },
  twist: { start: 39, end: 47 },
  cta: { start: 47, end: DURATION_S },
} as const;

export type BeatId = keyof typeof BEATS;
export const BEAT_ORDER: BeatId[] = [
  "hook",
  "stakes",
  "proof",
  "openLoop",
  "reveal",
  "rehook",
  "whyCare",
  "twist",
  "cta",
];

// Beat boundaries that get the 6-frame photocopier light-bar wipe.
// (openLoop->reveal, rehook->whyCare and whyCare->twist are continuous on purpose.)
export const WIPES: number[] = [
  BEATS.stakes.start,
  BEATS.proof.start,
  BEATS.openLoop.start,
  BEATS.rehook.start,
  BEATS.cta.start,
];
export const WIPE_FRAMES = 6;

// ---------- In-beat cues ----------
export const CUES = {
  hook: {
    headline: 0.3,
    wordStagger: 0.17,
    // COPY #1, #2, #3, #5, #9
    copyFlips: [
      { t: 0.0, n: 1, level: 0 },
      { t: 0.6, n: 2, level: 0.18 },
      { t: 1.0, n: 3, level: 0.34 },
      { t: 1.4, n: 5, level: 0.58 },
      { t: 1.8, n: 9, level: 0.92 },
    ],
    brollCopierEnd: 1.0,
  },
  stakes: {
    brollEnd: 4.2,
    grid: 3.1,
    flip: 4.6,
    stat: 4.85,
    statCountEnd: 5.9,
    loop: 6.6,
  },
  proof: {
    pill: 9.2,
    conveyor: 9.3,
    labels: 9.8,
    tag: 10.2,
  },
  openLoop: {
    raceStart: 16.8,
    raceStep: 0.18,
    freeze: 18.0,
    pulse: 18.35,
  },
  reveal: {
    unfreeze: 19.5,
    typeStart: 19.75,
    typeEnd: 22.4,
    overflow: 22.7,
    rabbits: [
      { t: 20.1, count: 2 },
      { t: 21.1, count: 4 },
      { t: 22.1, count: 8 },
      { t: 23.1, count: 16 },
    ],
  },
  rehook: {
    draw: 24.6,
    headline: 24.85,
  },
  whyCare: {
    labels: [33.5, 34.7, 35.9],
    blackout: 38.5,
  },
  twist: {
    stroke: 39.0,
    springBack: 39.5,
    twistWord: 39.25,
    headline: 40.0,
    tag: 41.0,
    card: 43.5,
    brollHandStart: 43.5,
  },
  cta: {
    split: 47.15,
    comment: 48.3,
    meta: 51.0,
    loopWipe: 52.3,
  },
};

// ---------- GEN counter (HUD) ----------
// Each event sets the HUD text at time t. Colour comes from HUD_COLOR below.
const race = Array.from({ length: 6 }, (_, i) => ({
  t: CUES.openLoop.raceStart + i * CUES.openLoop.raceStep,
  text: `GEN ${4 + i}`,
}));
export const HUD_EVENTS: { t: number; text: string }[] = [
  { t: CUES.stakes.loop, text: "GEN 0" },
  { t: 10.5, text: "GEN 1" },
  { t: 12.0, text: "GEN 2" },
  { t: 13.5, text: "GEN 3" },
  ...race,
  { t: 27.0, text: "GEN 10" },
  { t: 28.8, text: "GEN 11" },
  { t: 30.6, text: "GEN 12" },
  { t: 36.7, text: "GEN 13" },
  { t: 37.5, text: "GEN 14" },
  { t: 38.3, text: "GEN 15" },
  { t: 39.6, text: "GEN 15 + REAL DATA" },
];
export const HUD_HIDE = 52.4; // fades out for the loop

// Curve narrowing: on each tick the bell curve's width (sigma) steps down.
export const CURVE_TICKS: number[] = [27.0, 28.8, 30.6, 36.7, 37.5, 38.3];
export const CURVE_SIGMAS: number[] = [1, 0.86, 0.76, 0.68, 0.5, 0.35, 0.23];

// ---------- Global degradation (0..1) ----------
export const DEGRADATION: [number, number][] = [
  [0, 0],
  [9.0, 0],
  [15.0, 0.2],
  [19.5, 0.35],
  [24.5, 0.42],
  [32.5, 0.6],
  [39.0, 0.85],
  [41.0, 0],
  [DURATION_S, 0],
];

// ---------- Audio ----------
export const VO_VOLUME = 1;
export const MUSIC_VOLUME = USE_VO ? 0.07 : 0.18;
// Music drops out completely for the silence beat.
export const MUSIC_SILENCE = { start: CUES.openLoop.freeze, end: BEATS.reveal.start };

export const SFX_CUES: SfxCue[] = [
  { file: "whirr", t: 0.0, volume: 0.55 },
  ...CUES.hook.copyFlips.slice(1).map((c) => ({ file: "stamp", t: c.t, volume: 0.7 })),
  { file: "whirr", t: 3.0, volume: 0.35, end: 3.8 },
  { file: "riser", t: 9.0, volume: 0.45, end: CUES.openLoop.freeze },
  { file: "scratch", t: 19.5, volume: 0.7 },
  ...CURVE_TICKS.map((t) => ({ file: "whoosh", t, volume: 0.55 })),
  { file: "bass", t: 36.5, volume: 0.85 },
  { file: "swell", t: 39.0, volume: 0.6 },
  { file: "whirr", t: 52.3, volume: 0.5 },
];
