// The learning-rate slider and the HUD readouts as pure functions of time.
import { COLORS, clamp01, ease, lerp, prog } from "../../kit";
import { RATES, RUNS, run, schedule } from "./math";
import { BEATS, CUES, RUN_WINDOWS, STEP_DUR } from "./timeline";
import { valleyRun } from "./state";

const outBack = (p: number) => ease.outBack(p);

/** Slider value at time t. */
export const sliderValue = (t: number): number => {
  const d = CUES.rule.demo;
  let v = 0.12;
  if (t >= d[0]) {
    const p = prog(t, d[0], d[1], (x) => x);
    // demo sweep: 0.12 -> 0.05 -> 0.25 -> 0.12
    v = p < 0.3 ? lerp(0.12, 0.05, ease.inOut(p / 0.3)) : p < 0.7 ? lerp(0.05, 0.25, ease.inOut((p - 0.3) / 0.4)) : lerp(0.25, 0.12, ease.inOut((p - 0.7) / 0.3));
  }
  if (t >= CUES.small.knob) v = lerp(0.12, RATES.small, outBack(prog(t, CUES.small.knob, CUES.small.knob + 0.35)));
  if (t >= CUES.right.knob) v = lerp(RATES.small, RATES.right, outBack(prog(t, CUES.right.knob, CUES.right.knob + 0.3)));
  if (t >= CUES.big.knob) v = lerp(RATES.right, RATES.big, outBack(prog(t, CUES.big.knob, CUES.big.knob + 0.14)));
  if (t >= BEATS.twist.start) v = lerp(RATES.big, 0, prog(t, BEATS.twist.start, CUES.twist.curve[0]));
  if (t >= CUES.twist.curve[0]) v = RATES.right * schedule(scheduleHead(t));
  if (t >= BEATS.cta.start) v = lerp(RATES.right * schedule(1), 0.15 + 0.08 * Math.sin((t - BEATS.cta.start) * 2.2), prog(t, BEATS.cta.start, BEATS.cta.start + 0.5));
  return v;
};

/** Progress of the schedule curve's head (0..1) in the twist beat. */
export const scheduleHead = (t: number) => ease.inOut(prog(t, CUES.twist.curve[0], CUES.twist.curve[1]));

export const sliderColor = (v: number) => (v > 0.2 ? COLORS.red : v < 0.07 ? COLORS.blue : COLORS.yellow);

export const sliderAppear = (t: number) => {
  const inP = ease.outBack(prog(t, CUES.rule.slider - 0.1, CUES.rule.slider + 0.35));
  const out = ease.in(prog(t, CUES.cta.whip - 0.2, CUES.cta.whip + 0.15));
  return Math.max(0, Math.min(inP, 1 - out));
};

/** Pulse when the knob is set (each run) — drives glow. */
export const sliderPulse = (t: number) =>
  [CUES.small.knob, CUES.right.knob, CUES.big.knob].reduce((m, k) => Math.max(m, t >= k ? 1 - prog(t, k + 0.2, k + 0.8) : 0), 0);

// ---------- HUD ----------
const BIG_LONG = run(RATES.big, 30);

/** Step and loss shown in the HUD during the runs (null when the HUD is hidden). */
export const hudReadout = (t: number): { step: number; loss: number; color: string } | null => {
  if (t < BEATS.small.start || t > BEATS.chart.start + 0.2) return null;
  const r = valleyRun(t);
  if (r.run === "idle") return null;
  const pts = RUNS[r.run];
  const color = r.run === "small" ? COLORS.blue : r.run === "right" ? COLORS.yellow : COLORS.red;
  if (r.run === "big" && t > CUES.big.explode + 0.35) {
    // after the escape, keep counting the real run to step 30 (the loss explodes)
    const s = lerp(7, 30, ease.in(prog(t, CUES.big.explode + 0.35, CUES.big.explode + 1.6)));
    const k = Math.floor(s);
    const f = s - k;
    const a = BIG_LONG[k].loss;
    const b = BIG_LONG[Math.min(30, k + 1)].loss;
    return { step: s, loss: a * Math.pow(b / a, f), color };
  }
  const s = Math.min(pts.length - 1, r.s);
  const k = Math.floor(s);
  const f = clamp01(s - k);
  const a = pts[k].loss;
  const b = pts[Math.min(pts.length - 1, k + 1)].loss;
  return { step: s, loss: lerp(a, b, f), color };
};

export { RUN_WINDOWS, STEP_DUR };
