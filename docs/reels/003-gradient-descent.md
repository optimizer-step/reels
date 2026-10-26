# 003 — One number can break AI training (learning rate)

- **Folder:** `src/reels/gradient-descent` · compositions `GradientDescent`, `GradientDescent-Cover`
- **Length:** 44.4 s · 1080×1920 · 30 fps
- **Status:** v2 rendered with a scratch voice (Kokoro `af_heart`, offline). Swap in Venkatesh's
  HeyGen voice or a recording when ready: the beats, word cues, score and mix all re-time to it.
- **Craft goal:** every transition motivated by the story; one valley world; the cold open is a
  flash-forward of the climax; motion blur, squash and stretch, camera shake and a sound on every event.

## Edit structure

Times are from the current voice; they move with it (every beat starts on a voice line).

| Time (s) | Beat | Transition in | What moves |
| --- | --- | --- | --- |
| 0–3.2 | Cold open (flash-forward) | — (frame 0 = last frame) | The 0.22 run mid zig-zag; headline lines slam on the first bounces (all on screen by 1.3 s); the ball escapes on "crashes": shake, glitch, flash |
| 3.2–4.7 | Rewind | **VHS time-reversal** (tape-stop in the music) | Ball flies back along its path |
| 4.7–11.5 | The valley | Continuous camera pull-back and orbit | HIGH / LOW / GOAL pins land on their spoken words |
| 11.5–17.9 | The rule | Continuous push-in to the ball | Slope arrow; STEP = LEARNING RATE × SLOPE, tokens on their words; slider rises in and sweeps (one ratchet tick per 0.01) |
| 17.9–21.7 | Too small (0.02) | Knob click | 40 tiny hops (a tick per step); HUD counts; STEP 40 · STILL FAR |
| 21.7–22.3 | Rewind | Time-reversal | — |
| 22.3–24.7 | Just right (0.18) | Knob click | Shrinking zig-zag climbs a pentatonic scale and lands in the goal (bell chord) |
| 24.7–25.3 | Rewind | Time-reversal | — |
| 25.3–29.3 | Too big (0.22) | Knob slams | The cold open in context: escape lands on "out"; loss counter explodes |
| 29.3 | — | **Whip pan up** with motion blur | — |
| 29.3–33.8 | Payoff | — | Loss chart: three curves draw; music cuts and sucks in; the 0.22 line smashes through the top on the drop |
| 33.8–40.5 | Twist | **Axis morph** (LOSS → LEARNING RATE, STEP → TRAINING TIME) | A flat dashed line on "one fixed number" (one steady tone); then the schedule draws as "warm up, peak, slow down" is spoken (its pitch follows the curve); the knob rides it |
| 40.5–44.4 | CTA + loop | Whip pan down | COMMENT A LEARNING RATE; a comment box types 0.15; back into the valley at the cold-open frame |

## Voiceover and on-screen text

| # | Starts at | Voiceover (English) | On screen |
| --- | --- | --- | --- |
| 1 | 0.05 | One wrong number… and the whole AI training crashes. | ONE NUMBER CAN BREAK AI TRAINING |
| 2 | 3.3 | Wait. Let's rewind. | REWIND |
| 3 | 4.9 | AI learns by walking downhill. High means very wrong. Low, less wrong. The bottom is the right answer. | AI LEARNS BY GOING DOWNHILL · HIGH = MORE WRONG · LOW = LESS WRONG · GOAL |
| 4 | 11.6 | Each step, it checks the slope and multiplies it by one number: the learning rate. It sets how big each step is. | STEP = LEARNING RATE × SLOPE |
| 5 | 18.0 | Too small? It inches along… and barely gets anywhere. | TOO SMALL · STEP 40 · STILL FAR |
| 6 | 22.3 | Just right? It lands right on target. | JUST RIGHT |
| 7 | 25.3 | Too big? It bounces wall to wall… and flies right out. | TOO BIG · LOSS EXPLODES |
| 8 | 29.9 | Same problem. Only one number changed. | SAME PROBLEM. ONE NUMBER CHANGED. · LOSS → 2,28,229 BY STEP 30 |
| 9 | 33.9 | That's why big models like GPT-3 don't use one fixed number. They warm up, peak, then slow down. | BIG MODELS WARM UP, THEN SLOW DOWN · ONE FIXED NUMBER · WARM UP · PEAK · SLOW DOWN · GPT-3 schedule · Brown et al., 2020 · not to scale |
| 10 | 40.6 | Comment a learning rate, and I'll run yours in the next reel. | COMMENT A LEARNING RATE · I'll run yours in the next reel |

The lines live in `src/reels/gradient-descent/vo.json` (`hold` = minimum beat length; a longer
line stretches its beat).

**Voice options** (each re-times the reel; then run `python3 scripts/audio/gradient_descent.py`):

- **Scratch voice (current):** `python3 scripts/gen/kokoro_tts.py gradient-descent` (Kokoro-82M,
  Apache-2.0, voice `af_heart` at 1.08×; word timings by forced alignment).
- **HeyGen voice:** the *Generate reel assets* workflow, task `voice` (needs `HEYGEN_API_KEY` and
  `HEYGEN_VOICE_ID`); it re-scores the soundtrack and commits.
- **Your own recording:** phone voice memo in a quiet, soft room, phone 15–20 cm away and slightly
  off to the side. Read the 10 lines in order in one take with a clear 1–2 s pause between lines.
  Energy a notch above conversation; smile on line 6; slow down on "and flies right out".
  Then `node scripts/gen/vo-assemble.mjs gradient-descent take.m4a`.

## Sound design

Everything is synthesised in `scripts/audio/gradient_descent.py` and cut to the timeline:

- **Score:** 120 BPM, A minor, built in blocks that start on picture cuts: sparse in the valley,
  building through the rule, a driving 16th bass in the 0.22 run, a dark chart groove that cuts out
  and sucks in (reversed swell) before the breakout drop, brighter chords for the twist, and the
  cold open's drone at the end so the audio loops. Every rewind tape-stops the music.
- **Sonification:** the slider ticks once per 0.01 (pitch = rate); the small run ticks once per
  step; the right run climbs a pentatonic scale into a bell chord; the HUD counter ticks per step as
  the loss explodes; "one fixed number" is one steady tone and the schedule is played as pitch.
- **Mix:** each music stem ducks under the voice by a different amount (melody -22 dB, so the
  arpeggio answers in the gaps; drums -8 dB; bass -6 dB); SFX dip 6 dB under the voice; the
  master is limited to -1.5 dBFS and normalised to -14 LUFS (`mix.mp3`, played when `USE_MIX`).

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
| GPT-3 did not use one fixed learning rate | True: linear warmup over the first 375M tokens, then cosine decay over 260B tokens | [Brown et al., 2020](https://arxiv.org/abs/2005.14165), Appendix B; restated as "the original GPT-3 recipe" in [Li et al., 2021](https://arxiv.org/abs/2108.06084), §5.2 |
| On-screen tag during the valley: "Simplified example · every number is computed" | Required label | — |
| On-screen tag during the twist: "GPT-3 schedule · Brown et al., 2020 · not to scale" (the curve's shape, not its numbers) | Required label | — |

Rejected wording: "Bigger steps aren't faster" (false: on this valley 0.1–0.18 are bigger than
0.02 and much faster). The reel says "too small / just right / too big" instead.
