// Reel 003 maths: exact gradient descent on a stretched valley. Every position, height and loss
// value on screen comes from these functions (tested in tests/gradient-descent.test.mjs).
export type Point = { x: number; y: number; loss: number };

/** Curvature along x (long, shallow direction) and y (steep walls). */
export const A = 1;
export const C = 10;
export const START = { x: -3.2, y: 0.9 } as const;
export const OPTIMUM = { x: 0, y: 0 } as const;

export const loss = (x: number, y: number): number => 0.5 * (A * x * x + C * y * y);
export const gradient = (x: number, y: number) => ({ dx: A * x, dy: C * y });

export const next = (p: Point, rate: number): Point => {
  if (!(rate > 0) || !Number.isFinite(rate)) throw new Error("Learning rate must be positive and finite");
  const g = gradient(p.x, p.y);
  const x = p.x - rate * g.dx;
  const y = p.y - rate * g.dy;
  return { x, y, loss: loss(x, y) };
};

export const run = (rate: number, steps: number): Point[] => {
  if (!Number.isInteger(steps) || steps < 0) throw new Error("Invalid step count");
  const pts: Point[] = [{ ...START, loss: loss(START.x, START.y) }];
  for (let i = 0; i < steps; i++) pts.push(next(pts[pts.length - 1], rate));
  return pts;
};

export const RATES = { small: 0.02, right: 0.18, big: 0.22 } as const;
export const STEPS = { small: 40, right: 14, big: 30 } as const;
export type RunId = keyof typeof RATES;
export const RUNS: Record<RunId, Point[]> = {
  small: run(RATES.small, STEPS.small),
  right: run(RATES.right, STEPS.right),
  big: run(RATES.big, STEPS.big),
};

/** Above 2 / C the steep direction's factor (1 − rate·C) passes −1, so the zig-zag grows. */
export const STABLE_LIMIT = 2 / C;
/** Best fixed step for a quadratic: 2 / (A + C) = 0.1818… (shown rounded as 0.18). */
export const BEST_RATE = 2 / (A + C);
/** Half-width of the drawn valley in y; a point beyond it has left the valley. */
export const VALLEY_HALF_WIDTH = 3;
export const escapeStep = (pts: Point[]) => pts.findIndex((p) => Math.abs(p.y) > VALLEY_HALF_WIDTH);

/**
 * Learning-rate schedule shape used in the twist: linear warmup to the peak, then cosine decay
 * to 10% of the peak (the GPT-3 recipe). u is training progress 0..1; warmup is NOT to scale.
 */
export const schedule = (u: number, warm = 0.12, floor = 0.1): number => {
  if (u <= 0) return 0;
  if (u < warm) return u / warm;
  const p = Math.min(1, (u - warm) / (1 - warm));
  return floor + (1 - floor) * 0.5 * (1 + Math.cos(Math.PI * p));
};
