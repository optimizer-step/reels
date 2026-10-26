// The valley scene as a pure function of time: which run the ball belongs to, how far along it
// is (in gradient steps, fractional while hopping), and where the camera is. Rewinds are simply
// time running backwards through the same function.
import { COLORS, clamp01, ease, lerp, prog, remap, type OrbitCam, type V3 } from "../../kit";
import { A, C, RATES, RUNS, loss, type Point, type RunId } from "./math";
import { BEATS, CUES, DURATION_S, HOOK_S0, RUN_WINDOWS, STEP_DUR } from "./timeline";

export const HS = 0.05; // world height per unit of loss
export const BALL_R = 0.2;

/** Parameters (x, y) -> world [x, height, z]: steep y runs left-right, the long x axis runs into depth. */
export const world = (x: number, y: number, lift = 0): V3 => [y, loss(x, y) * HS + lift, -x];
export const surfaceHeight = (wx: number, wz: number) => loss(-wz, wx) * HS;

export type BallRun = RunId | "idle";
export type ValleyState = { run: BallRun; s: number; cam: OrbitCam; color: string };

export const RUN_COLOR: Record<BallRun, string> = { idle: COLORS.text, small: COLORS.blue, right: COLORS.yellow, big: COLORS.red };

const HOOK_END_S = HOOK_S0 + BEATS.hook.end / STEP_DUR.hook;

/** Step progress for each phase of the valley timeline. */
export const valleyRun = (t: number): { run: BallRun; s: number } => {
  if (t < BEATS.hook.end) return { run: "big", s: HOOK_S0 + t / STEP_DUR.hook };
  if (t < BEATS.rewind1.end) {
    const s = remap([{ t: BEATS.rewind1.start, s: HOOK_END_S }, { t: BEATS.rewind1.end - 0.1, s: 0, ease: ease.inOut }], t);
    return { run: "big", s: Math.max(0, s) };
  }
  if (t < BEATS.small.start) return { run: "idle", s: 0 };
  if (t < BEATS.rewind2.start) return { run: "small", s: clamp01((t - RUN_WINDOWS.small.from) / (RUN_WINDOWS.small.steps * STEP_DUR.small)) * RUN_WINDOWS.small.steps };
  if (t < BEATS.right.start) return { run: "small", s: RUN_WINDOWS.small.steps * (1 - ease.inOut(prog(t, BEATS.rewind2.start, BEATS.rewind2.end - 0.05))) };
  if (t < BEATS.rewind3.start) return { run: "right", s: clamp01((t - RUN_WINDOWS.right.from) / (RUN_WINDOWS.right.steps * STEP_DUR.right)) * RUN_WINDOWS.right.steps };
  if (t < BEATS.big.start) return { run: "right", s: RUN_WINDOWS.right.steps * (1 - ease.inOut(prog(t, BEATS.rewind3.start, BEATS.rewind3.end - 0.05))) };
  if (t < BEATS.chart.start + 0.5) return { run: "big", s: Math.max(0, Math.min(RUN_WINDOWS.big.steps, (t - RUN_WINDOWS.big.from) / STEP_DUR.big)) };
  // closing whip back into the valley: the same 0.22 run arriving at the cold-open frame
  return { run: "big", s: Math.max(0, HOOK_S0 + (t - DURATION_S) / STEP_DUR.hook) };
};

// ---------- camera ----------
const cam = (target: V3, yaw: number, pitch: number, dist: number, focal = 1180, cx = 500, cy = 880): OrbitCam => ({ target, yaw, pitch, dist, focal, cx, cy });
const mix = (a: OrbitCam, b: OrbitCam, p: number): OrbitCam => ({
  target: [lerp(a.target[0], b.target[0], p), lerp(a.target[1], b.target[1], p), lerp(a.target[2], b.target[2], p)],
  yaw: lerp(a.yaw, b.yaw, p),
  pitch: lerp(a.pitch, b.pitch, p),
  dist: Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), p)),
  focal: lerp(a.focal, b.focal, p),
  cx: lerp(a.cx, b.cx, p),
  cy: lerp(a.cy, b.cy, p),
});

const HOOK_CAM = (t: number) => cam([0, 0.75, 1.0], 0.2 - 0.02 * t, 0.66, 6.6 - 0.22 * t, 1180, 500, 860);
const OVERVIEW_A = cam([0, 0.3, 1.3], -0.36, 1.02, 10.6, 1180, 500, 860);
const OVERVIEW_B = cam([0, 0.3, 1.3], 0.1, 0.96, 9.9, 1180, 500, 860);
const START_W = world(-3.2, 0.9);
const PUSH = cam([START_W[0] - 0.5, START_W[1], START_W[2] - 0.9], 0.12, 0.8, 6.2, 1180, 500, 860);
const RUNS_CAM = cam([0, 0.35, 1.4], 0.0, 0.95, 9.3, 1180, 500, 850);

export const camAt = (t: number): OrbitCam => {
  if (t < BEATS.rewind1.start) return HOOK_CAM(t);
  if (t < BEATS.valley.start) return mix(HOOK_CAM(BEATS.rewind1.start), OVERVIEW_A, ease.inOut(prog(t, BEATS.rewind1.start + 0.4, BEATS.valley.start + 0.6)));
  if (t < CUES.rule.pushIn) {
    const a = mix(HOOK_CAM(BEATS.rewind1.start), OVERVIEW_A, ease.inOut(prog(t, BEATS.rewind1.start + 0.4, BEATS.valley.start + 0.6)));
    return mix(a, OVERVIEW_B, ease.inOut(prog(t, BEATS.valley.start + 0.6, CUES.rule.pushIn)));
  }
  if (t < BEATS.small.start) {
    const drift = mix(PUSH, cam(PUSH.target, PUSH.yaw - 0.08, PUSH.pitch, PUSH.dist * 0.94, 1180, 500, 860), prog(t, CUES.rule.pushIn + 1.2, BEATS.small.start, (x) => x));
    return mix(OVERVIEW_B, drift, ease.inOut(prog(t, CUES.rule.pushIn, CUES.rule.pushIn + 1.2)));
  }
  if (t < BEATS.chart.start + 0.5) {
    const end = cam(PUSH.target, PUSH.yaw - 0.08, PUSH.pitch, PUSH.dist * 0.94, 1180, 500, 860);
    const drift = cam(RUNS_CAM.target, RUNS_CAM.yaw + 0.05 * Math.sin((t - BEATS.small.start) * 0.35), RUNS_CAM.pitch, RUNS_CAM.dist, 1180, 500, 850);
    return mix(end, drift, ease.inOut(prog(t, BEATS.small.start, BEATS.small.start + 0.5)));
  }
  // closing segment: continuous with the cold open (t = 0 maps onto t = DURATION)
  return HOOK_CAM(t - DURATION_S);
};

export const valleyState = (t: number): ValleyState => {
  const r = valleyRun(t);
  return { ...r, cam: camAt(t), color: RUN_COLOR[r.run] };
};

export const pointsFor = (run: BallRun): Point[] => (run === "idle" ? [RUNS.small[0]] : RUNS[run]);

/** Ball position in world space for a run at step progress s. Each gradient step is a ballistic
 * hop: a chord between the two landing points (never below the surface) plus a parabola. */
export const hopPoint = (a: Point, b: Point, f: number) => {
  const x = lerp(a.x, b.x, f);
  const y = lerp(a.y, b.y, f);
  const chord = lerp(loss(a.x, a.y), loss(b.x, b.y), f) * HS;
  const base = Math.max(chord, loss(x, y) * HS);
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const hop = Math.min(0.9, 0.04 + 0.22 * dist) * 4 * f * (1 - f);
  return { x, y, w: [y, base + BALL_R + hop, -x] as V3 };
};

export const ballAt = (run: BallRun, s: number) => {
  const pts = pointsFor(run);
  const maxS = pts.length - 1;
  const ss = Math.min(Math.max(0, s), maxS);
  const k = Math.min(maxS, Math.floor(ss));
  const f = ss - k;
  const h = hopPoint(pts[k], pts[Math.min(maxS, k + 1)], f);
  return { ...h, k, f, loss: loss(h.x, h.y) };
};

/** Seconds since the ball last landed (large if it is resting at the start). */
export const sinceLanding = (t: number, run: BallRun, s: number) => {
  if (run === "idle" || s < 1) return 99;
  const stepDur = run === "small" ? STEP_DUR.small : run === "right" ? STEP_DUR.right : STEP_DUR.big;
  return (s - Math.floor(s)) * stepDur;
};

export const rateFor = (run: BallRun) => (run === "idle" ? 0 : RATES[run]);
export { A, C };
