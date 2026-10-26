import { clamp01, ease, lerp, rand } from "./anim";

/**
 * Editing-grade motion helpers. Everything is a pure function of time, so any of these can be
 * scrubbed, reversed (rewinds) or re-timed without state.
 */

/** A keyframe on a time remap: at real time `t`, the scene shows scene-time `s`. */
export type TimeKey = { t: number; s: number; ease?: (p: number) => number };

/**
 * Piecewise time remap. Before the first key and after the last, time runs at normal speed
 * relative to that key. Use it for rewinds (s goes backwards), freeze frames (s constant),
 * speed ramps and flash-forwards.
 */
export const remap = (keys: TimeKey[], t: number): number => {
  if (t <= keys[0].t) return keys[0].s - (keys[0].t - t);
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t <= b.t) {
      const p = clamp01((t - a.t) / (b.t - a.t));
      return lerp(a.s, b.s, (b.ease ?? ((x) => x))(p));
    }
  }
  const last = keys[keys.length - 1];
  return last.s + (t - last.t);
};

export type Impact = { t: number; amp: number; decay?: number; freq?: number };

/** Camera shake from a list of impacts: smooth decaying oscillation in x, y and rotation (deg). */
export const shake = (t: number, impacts: Impact[], seed = 1) => {
  let x = 0;
  let y = 0;
  let r = 0;
  impacts.forEach((im, i) => {
    const dt = t - im.t;
    if (dt < 0) return;
    const env = im.amp * Math.exp(-(im.decay ?? 9) * dt);
    if (env < 0.05) return;
    const f = im.freq ?? 21;
    x += env * Math.sin(2 * Math.PI * f * dt + rand(seed + i * 7.1) * 6.28);
    y += env * 0.8 * Math.sin(2 * Math.PI * f * 1.13 * dt + rand(seed + i * 3.7) * 6.28);
    r += env * 0.04 * Math.sin(2 * Math.PI * f * 0.71 * dt + rand(seed + i * 1.3) * 6.28);
  });
  return { x, y, r };
};

/** Sub-frame samples of a moving value over the shutter interval (for true motion blur). */
export const shutterSamples = <T,>(fn: (t: number) => T, t: number, fps: number, n = 6, shutter = 0.5): T[] =>
  Array.from({ length: n }, (_, i) => fn(t - (shutter / fps) * (i / (n - 1))));

/** Squash & stretch scale for a bouncing object: squash after landing, stretch while fast. */
export const squashStretch = (sinceLanding: number, speed: number) => {
  const squash = 0.3 * Math.exp(-22 * Math.max(0, sinceLanding)) * Math.cos(Math.max(0, sinceLanding) * 40);
  const stretch = Math.min(0.25, speed * 0.012);
  return { sx: 1 + squash - stretch * 0.5, sy: 1 - squash + stretch };
};

/** Value that eases between steps of a discrete sequence (e.g. loss per step) for counters. */
export const stepValue = (values: number[], s: number) => {
  if (s <= 0) return values[0];
  if (s >= values.length - 1) return values[values.length - 1];
  const k = Math.floor(s);
  return lerp(values[k], values[k + 1], ease.inOut(s - k));
};
