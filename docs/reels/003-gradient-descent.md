# 003 — One number can break AI training (learning rate)

- **Folder:** `src/reels/gradient-descent` · compositions `GradientDescent`, `GradientDescent-Cover`
- **Length:** 41 s · 1080×1920 · 30 fps
- **Status:** v2 rebuild (replaces the v1 draft from PR #1). English voiceover to be recorded by Venkatesh.
- **Craft goal:** every transition motivated by the story; one valley world; the cold open is a
  flash-forward of the climax; motion blur, squash and stretch, camera shake and sound on every event.

## Edit structure

| Time (s) | Beat | Transition in | What moves |
| --- | --- | --- | --- |
| 0–2.5 | Cold open (flash-forward) | — (frame 0 = last frame) | The 0.22 run already mid zig-zag; walls get hit harder each bounce; the ball escapes, the camera shakes, glitch |
| 2.5–3.7 | Rewind | **VHS time-reversal** of the escape | Ball flies back along its path to the start |
| 3.7–9.6 | The valley | Continuous camera pull-back and orbit | Terrain reveals; labels pin onto the walls and the goal |
| 9.6–15.6 | The rule | Continuous push-in to the ball | Slope arrow; kinetic formula; slider rises in; arrow length tracks the knob |
| 15.6–19.4 | Too small (0.02) | Knob click | 40 tiny hops; step counter races; ball barely moves |
| 19.4–20.0 | Rewind | Time-reversal | — |
| 20.0–22.4 | Just right (0.18) | Knob click | Confident arcs, shrinking zig-zag, lands in the goal, particle burst |
| 22.4–23.0 | Rewind | Time-reversal | — |
| 23.0–27.0 | Too big (0.22) | Knob slams | The cold-open footage, now in context: zig-zag grows, escape, loss counter explodes |
| 27.0–27.5 | — | **Whip pan up** with motion blur | — |
| 27.5–31.5 | Payoff | — | Loss-vs-steps chart: three curves draw; the 0.22 curve breaks through the top of the chart |
| 31.5–37.0 | Twist | **Axis morph** (chart axes re-label, curves swap) | Learning-rate schedule: warmup, peak, cosine decay; the knob rides the curve |
| 37.0–41.0 | CTA + loop | Whip pan down | Slider CTA, then back into the valley at the exact cold-open frame |

## Voiceover (English, to record) and on-screen text

| # | Time | Voiceover | On screen |
| --- | --- | --- | --- |
| 1 | 0.0 | One wrong number… and the whole AI training crashes. | ONE NUMBER CAN BREAK AI TRAINING |
| 2 | 2.5 | Wait. Let's rewind. | REWIND |
| 3 | 3.8 | AI learns by walking downhill. Up high, it's very wrong. Down low, less wrong. And the very bottom — that's the right answer. | AI LEARNS BY GOING DOWNHILL · HIGH = MORE WRONG · LOW = LESS WRONG · GOAL |
| 4 | 9.7 | At every step, it checks the slope and multiplies it by one number — the learning rate. That number decides how big each step is. | STEP = LEARNING RATE × SLOPE |
| 5 | 15.7 | Too small? It inches along… and barely gets anywhere. | TOO SMALL · STEP 40 · STILL FAR |
| 6 | 20.0 | Just right? It lands right on target. | JUST RIGHT |
| 7 | 23.0 | Too big? It bounces wall to wall… and flies right out. | TOO BIG |
| 8 | 27.6 | Same problem. Only one number changed. | SAME PROBLEM. ONE NUMBER CHANGED. · LOSS EXPLODES |
| 9 | 31.6 | That's why big models like GPT-3 don't stick to one number. They warm up slowly, peak, then slow down. | BIG MODELS WARM UP, THEN SLOW DOWN |
| 10 | 37.1 | Comment a learning rate, and I'll run yours in the next reel. | COMMENT A LEARNING RATE · I'll run yours in the next reel |

**Recording guide:** phone voice memo, quiet room with soft furnishings (a bedroom beats a
bare room), phone 15–20 cm from your mouth, slightly off to the side. Read the 10 lines in
order in one take, with a clear 1–2 second pause between lines (the take is split at the pauses
to sync the animation). Energy a notch above normal conversation; smile on line 6; slow down on
"and flies right out" in line 7. Send the file as-is (m4a, mp3 or wav).

## Caption

```text
One number decides whether AI learns… or crashes. It's called the learning rate.

Too small: it crawls. Just right: it lands. Too big: it bounces out of the valley and the loss explodes.
That's why big models like GPT-3 warm up first, then slow down.

Comment a learning rate between 0 and 0.3 — I'll run yours in the next reel.

#AI #MachineLearning #DeepLearning #GradientDescent #LearnAI #OptimizerStep
```

**Pinned comment:** The valley is a simplified 2-parameter example: L = ½(x² + 10y²). Every
position and loss value on screen is computed, not drawn by hand. GPT-3's schedule: Brown et
al., 2020 (warmup, then cosine decay to 10%).

## Fact sheet

| Claim | Status | Source |
| --- | --- | --- |
| Training follows the slope downhill; step = learning rate × slope | True: gradient descent update θ ← θ − η∇L | standard |
| Valley L(x, y) = ½(x² + 10y²), start (−3.2, 0.9), loss 9.17 | Computed; tested in `tests/gradient-descent.test.mjs` | `math.ts` |
| 0.02 crawls: after 40 steps loss is still 1.02 | Computed | `math.ts` |
| 0.18 lands: after 14 steps loss is 0.028 (0.18 ≈ 2/11, the best fixed step for this valley) | Computed; optimal fixed step for a quadratic is 2/(λmin+λmax) | standard result |
| 0.22 escapes at step 7 and loss reaches ~2.28 lakh by step 30 | Computed: steep-direction factor 1 − 0.22×10 = −1.2, so the zig-zag grows | `math.ts` |
| Too large a learning rate can make real training diverge ("loss explodes") | True, widely observed; the reel shows it on the toy valley | standard |
| GPT-3 used learning-rate warmup, then cosine decay to 10% of the peak | True | [Brown et al., 2020](https://arxiv.org/abs/2005.14165); restated in [Bergsma et al., 2025](https://arxiv.org/pdf/2502.15938) |
| Warmup is standard practice in LLM pre-training | True | [Bergsma et al., 2025](https://arxiv.org/pdf/2502.15938) |
| On-screen tag during the valley: "Simplified 2-parameter example" | Required label | — |

Rejected wording: "Bigger steps aren't faster" (false: on this valley 0.1–0.18 are bigger than
0.02 and much faster). The reel says "too small / just right / too big" instead.
