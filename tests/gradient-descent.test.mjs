// Zero-dependency numerical QC; Node 22+: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { gradient, loss, next, run, OPTIMUM, OVERSIZED, RATES, START, STEADY, STEPS } from "../src/reels/gradient-descent/math.ts";

const near = (actual, expected, eps = 1e-10) =>
  assert.ok(Math.abs(actual - expected) < eps, "Expected " + actual + " ≈ " + expected);

test("optimum and start are calculated, not authored readouts", () => {
  near(loss(OPTIMUM.w, OPTIMUM.b), 0);
  near(loss(START.w, START.b), 11.25);
  near(STEADY[0].loss, 11.25);
  near(OVERSIZED[0].loss, STEADY[0].loss);
});
test("analytic gradient matches centered finite differences", () => {
  for (const [w, b] of [[-1, -0.5], [0.2, 3.1], [2, 1]]) {
    const h = 0.00001;
    const g = gradient(w, b);
    near(g.dw, (loss(w + h, b) - loss(w - h, b)) / (2 * h), 1e-7);
    near(g.db, (loss(w, b + h) - loss(w, b - h)) / (2 * h), 1e-7);
  }
});
test("all steps satisfy the exact update equation and displayed loss", () => {
  for (const rate of Object.values(RATES)) {
    const points = run(rate);
    assert.equal(points.length, STEPS + 1);
    points.forEach((point, step) => {
      near(point.loss, loss(point.w, point.b));
      if (step) {
        const expected = next(points[step - 1], rate);
        near(point.w, expected.w);
        near(point.b, expected.b);
      }
    });
  }
});
test("both runs descend, but the bigger learning rate overshoots", () => {
  for (const points of [STEADY, OVERSIZED]) {
    for (let i = 1; i < points.length; i++) assert.ok(points[i].loss < points[i - 1].loss);
  }
  assert.ok(STEADY[1].w < OPTIMUM.w);
  assert.ok(OVERSIZED[1].w > OPTIMUM.w);
  assert.ok(STEADY[STEPS].loss < OVERSIZED[STEPS].loss);
});
test("invalid learning rates and step counts fail clearly", () => {
  assert.throws(() => next(STEADY[0], 0));
  assert.throws(() => next(STEADY[0], Infinity));
  assert.throws(() => run(RATES.steady, -1));
  assert.throws(() => run(RATES.steady, 2.3));
});
