// Exact, deterministic gradient descent on a two-parameter quadratic.
// The visuals read exclusively from these paths. No illustrative loss values are invented.
export type Point = { w: number; b: number; loss: number };
export const OPTIMUM = { w: 2, b: 1 } as const;
export const START = { w: -1, b: -0.5 } as const;
export const RATES = { steady: 0.16, oversized: 0.88 } as const;
export const STEPS = 8;

export const loss = (w: number, b: number): number =>
  (w - OPTIMUM.w) ** 2 + (b - OPTIMUM.b) ** 2;
export const gradient = (w: number, b: number) => ({
  dw: 2 * (w - OPTIMUM.w),
  db: 2 * (b - OPTIMUM.b),
});
export const next = (p: Point, learningRate: number): Point => {
  if (!(learningRate > 0) || !Number.isFinite(learningRate)) {
    throw new Error("Learning rate must be positive and finite");
  }
  const g = gradient(p.w, p.b);
  const w = p.w - learningRate * g.dw;
  const b = p.b - learningRate * g.db;
  return { w, b, loss: loss(w, b) };
};
export const run = (learningRate: number, steps: number = STEPS): Point[] => {
  if (!Number.isInteger(steps) || steps < 0) throw new Error("Invalid step count");
  const points: Point[] = [{ ...START, loss: loss(START.w, START.b) }];
  for (let i = 0; i < steps; i++) points.push(next(points[points.length - 1], learningRate));
  return points;
};
export const STEADY = run(RATES.steady);
export const OVERSIZED = run(RATES.oversized);
