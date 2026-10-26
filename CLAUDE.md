# Working on the Optimizer Step reel kit

This repo makes AI/ML explainer reels for **Optimizer Step** (Venkatesh): Instagram Reels and
YouTube Shorts for working professionals without CS backgrounds. Read `docs/playbook.md` before
writing a script.

## House rules

- **Language: English, always.** Voiceover and all on-screen text are in English (Venkatesh's
  standing rule). Reels 001–002 were scripted in Hinglish before this rule; convert them to English
  before recording.
- **Accuracy over magnetism.** Every claim on screen must match its source. Keep a fact sheet
  with links in `docs/reels/<nnn>-<slug>.md`, credit quoted material on screen, and never
  overstate (e.g. "a lab test on a small model", not "ChatGPT collapsed").
- **Look:** near-black `#0B0B0F`, yellow `#FFD60A` for emphasis, red `#FF3B30` for danger,
  Space Grotesk 700 headlines, JetBrains Mono for counters/tags. Change style only in
  `src/kit/theme.ts`.
- **Safe zone:** all text inside x 60–940, y 220–1500; keep y 1330–1480 free for captions.
  Centre content on `CX` (500), not the frame centre.
- **Structure:** hook that works on mute in the first 1.5 s → stakes → proof → open loop →
  payoff (a screenshot moment) → re-hook every 7–10 s → twist → one-word comment CTA →
  last frame matches the first so the reel loops. Target 30–45 s.
- **No generated text inside video clips.** Words, numbers and diagrams are drawn in code;
  Kling/Higgsfield only supply mood B-roll.

## Building a reel

1. Write the brief first in `docs/reels/<nnn>-<slug>.md`: script table (time, English VO,
   on-screen text, visual), caption, pinned comment and fact sheet with links. Label any
   made-up numbers as an illustration, on screen and in the brief.
2. `npm run new -- <slug>`; write `copy.ts` (all strings) and `timeline.ts` (all times, seconds;
   use `cue("word", nth, fallback)` for anything that should land on a spoken word).
3. Build from `src/kit`. Prefer one continuous camera world (`Camera` + `Layer`, stations in
   world pixels, screen-space overlays for headlines) over hard cuts; see `src/reels/attention-bank`.
   Animation must be a pure function of time (`t` in seconds). Use `rand(seed)`, never `Math.random()`.
4. When the camera leaves a station, fade that station out, or its content will collide with
   the next beat's headline. Bring it back for fly-overs.
5. Start with `npm run preview -- <slug>` for quick frame review; use `npm run check -- <CompId>` and look at every contact sheet: text inside the safe zone, no
   overlaps, flights readable, peak-effect frames legible, cover, and the loop number (< ~6).
   Fix, re-check the changed frames with `npm run stills`, then render.
6. Sound: add a `scripts/audio/<slug>.py` using `sfxlib.py`; cue files in `timeline.ts`.
7. `npm run render -- <slug>` (background it). Deliver `out/<slug>/<slug>.mp4` and `cover.png`.
8. Update the table in `README.md` and the reel's brief.

## Gotchas

- Font subsets lack `→`; use `<Arrow />` from `src/kit/components/Icons.tsx`. `↓` and `·` are fine.
- Remotion `<Folder name>` allows only letters, digits and `-`.
- Google Fonts is unreachable from the sandbox; fonts come from `@fontsource` into `public/fonts`.
- Film grain makes masters big (~600 MB for 54 s at CRF 18); the render script's upload copy is
  ~110 MB. Never commit `out/`.
- A 54 s reel takes ~8 min to render with 2 CPUs; run it in the background.
- Hugging Face is unreachable from the sandbox, so real model weights/attention can't be computed
  there; label illustrative numbers as such.
- `Camera` motion blur is directional (from screen-space velocity); very fast snaps are best
  hidden under a `Glitch` cut.
- Token chips use JetBrains Mono so widths are exact (0.6 em per character); keep sentences
  under ~23 characters at 40 px to fit the safe zone.
