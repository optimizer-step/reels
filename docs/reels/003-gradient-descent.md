# Reel 003 — Why AI overshoots

**Hook:** Same start. Two step sizes. The faster-looking one learns more slowly.
**Runtime:** 36 seconds, portrait 1080 × 1920, 30 fps.
**Status:** Motion-graphics storyboard and silent edit. Hinglish voiceover pending, not simulated.
**Caption:** Bigger steps don't always mean faster learning. Watch two exact gradient-descent runs on the *same* loss surface. Comment GRADIENT for the equations. #PyTorch #MachineLearning #GradientDescent #OptimizerStep
**Pinned comment:** Why does the red point keep crossing the minimum? Answer: the step size multiplies the gradient.

| Sec | Hinglish VO draft (record later) | On-screen copy | Visual |
| --- | --- | --- | --- |
| 0–4 | Ek hi starting point, do learning rates. Kaun pehle seekhega? | SAME START. TWO STEP SIZES. | Premium close-up, bright headline |
| 4–9 | Gradient direction batata hai. Step size decide karta hai kitni door jaana hai. | THE GRADIENT SHOWS THE WAY | Sculpted loss surface is revealed |
| 9–22 | Blue chhote steps leta hai. Red bar bar minimum ko cross karta hai. | WATCH THE TWO PATHS. | Two simulated points, trails and exact loss readouts |
| 22–28 | Bada learning rate hamesha faster nahi hota. | BIGGER STEPS AREN'T FASTER. | Smooth blue path vs. red overshoot |
| 28–32 | Isliye learning rate ko tune karte hain. | THE RIGHT STEP CHANGES EVERYTHING. | Points settle near optimum |
| 32–36 | Comment GRADIENT. | COMMENT GRADIENT | Graphic payoff; fade for loop |

## Mathematical fact sheet (all motion derived from this model)

Illustrative two-parameter *quadratic* loss (not an actual LLM training run):

- Loss: **L(w, b) = (w − 2)² + (b − 1)²**.
- Exact gradient: **∂L/∂w = 2(w − 2)** and **∂L/∂b = 2(b − 1)**.
- Update: **(w, b) ← (w, b) − η∇L(w, b)**.
- Shared start: (w, b) = (−1, −0.5), L = 11.25.
- Steady blue path: η = 0.16; each coordinate error gets multiplied by 0.68.
- Overshooting red path: η = 0.88; each coordinate error gets multiplied by −0.76. The sign flip crosses the minimum on every step, yet the magnitude decays. It **still converges**: overshoot here is not divergence.
- After 8 steps the blue run has lower loss than red, even though its learning rate is smaller.

**Data integrity:** Colors, markers, positions, path trails, and card readouts use the same deterministic arrays from src/reels/gradient-descent/math.ts. No fake loss values, model benchmarks or scraped screenshots.

**Design:** Retain Optimizer Step near-black/yellow house style, differentiate trajectories blue/red, keep every moving word above the caption safe band, never overlap formulas with loss cards. Render QA: 0, 4, 9.8, 13, 17, 22, 28, 33, 35 seconds and the cover.

**Publishing caveat:** Record/attach narration, music and sound design *before release*. This PR does not claim to ship a voiceover or fully mixed release reel.
