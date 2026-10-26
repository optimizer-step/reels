// Numerical checks for reel 003 (Node 22+: npm test). Every number on screen comes from math.ts.
import test from "node:test";
import assert from "node:assert/strict";
import {
  BEST_RATE, OPTIMUM, RATES, RUNS, STABLE_LIMIT, START, STEPS, escapeStep, gradient, loss, next, run, schedule,
} from "../src/reels/gradient-descent/math.ts";

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

test("valley: optimum, start loss and analytic gradient", () => {
  near(loss(OPTIMUM.x, OPTIMUM.y), 0);
  near(loss(START.x, START.y), 9.17);
  for (const [x, y] of [[-3.2, 0.9], [0.4, -1.7], [2, 1]]) {
    const h = 1e-5;
    const g = gradient(x, y);
    near(g.dx, (loss(x + h, y) - loss(x - h, y)) / (2 * h), 1e-6);
    near(g.dy, (loss(x, y + h) - loss(x, y - h)) / (2 * h), 1e-6);
  }
});

test("every step satisfies the update rule and its displayed loss", () => {
  for (const id of Object.keys(RATES)) {
    const pts = RUNS[id];
    assert.equal(pts.length, STEPS[id] + 1);
    pts.forEach((p, k) => {
      near(p.loss, loss(p.x, p.y));
      if (k) {
        const e = next(pts[k - 1], RATES[id]);
        near(p.x, e.x);
        near(p.y, e.y);
      }
    });
  }
});

test("on-screen claims: too small crawls, just right lands, too big escapes and explodes", () => {
  const small = RUNS.small.at(-1);
  assert.ok(small.loss > 1 && small.loss < 1.05, "0.02 still has loss ~1.02 after 40 steps");
  assert.ok(small.x < -1.4, "0.02 is still far from the goal");
  assert.ok(RUNS.right.at(-1).loss < 0.03, "0.18 lands: loss < 0.03 after 14 steps");
  assert.equal(escapeStep(RUNS.big), 7, "0.22 leaves the valley at step 7");
  const big30 = RUNS.big.at(-1).loss;
  assert.ok(big30 > 228000 && big30 < 228400, "0.22 reaches ~2.28 lakh loss at step 30");
  assert.equal(escapeStep(RUNS.small), -1);
  assert.equal(escapeStep(RUNS.right), -1);
});

test("stability limit and best fixed step", () => {
  near(STABLE_LIMIT, 0.2);
  assert.ok(RATES.big > STABLE_LIMIT && RATES.right < STABLE_LIMIT);
  near(Math.round(BEST_RATE * 100) / 100, RATES.right);
});

test("schedule: warmup to the peak, cosine decay to 10%", () => {
  near(schedule(0), 0);
  near(schedule(0.12), 1);
  near(schedule(1), 0.1);
  for (let u = 0.13; u < 1; u += 0.05) assert.ok(schedule(u) <= schedule(u - 0.01) + 1e-12);
});

test("invalid inputs fail clearly", () => {
  assert.throws(() => next(RUNS.small[0], 0));
  assert.throws(() => next(RUNS.small[0], Infinity));
  assert.throws(() => run(0.1, -1));
  assert.throws(() => run(0.1, 2.5));
});
