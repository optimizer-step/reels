import { Easing, spring } from "remotion";
import { FPS } from "./theme";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const ease = {
  out: Easing.out(Easing.cubic),
  in: Easing.in(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  outBack: Easing.out(Easing.back(1.6)),
  outExpo: Easing.out(Easing.exp),
};

/** 0..1 progress of t between a and b, eased. */
export const prog = (t: number, a: number, b: number, e: (x: number) => number = ease.inOut) =>
  e(clamp01((t - a) / (b - a)));

/** Snappy spring that starts at `start` seconds. Returns 0 before it starts. */
export const springAt = (
  t: number,
  start: number,
  config: { damping?: number; stiffness?: number; mass?: number } = {},
) => {
  if (t < start) return 0;
  return spring({
    frame: (t - start) * FPS,
    fps: FPS,
    config: { damping: 14, stiffness: 170, mass: 0.9, ...config },
  });
};

/** Piecewise-linear lookup in a [[t, value], ...] table. */
export const piecewise = (table: [number, number][], t: number) => {
  if (t <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    const [t1, v1] = table[i];
    const [t0, v0] = table[i - 1];
    if (t <= t1) {
      const p = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return lerp(v0, v1, ease.inOut(p));
    }
  }
  return table[table.length - 1][1];
};

/** Deterministic hash-based random in [0,1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

/** Fade in at a, fade out at b (with optional durations). */
export const window01 = (t: number, a: number, b: number, fin = 0.25, fout = 0.25) =>
  Math.min(prog(t, a, a + fin, ease.out), 1 - prog(t, b - fout, b, ease.in));
