# Working on the Optimizer Step reel kit

This repo makes AI/ML explainer reels for **Optimizer Step** (Venkatesh): Instagram Reels and
YouTube Shorts for working professionals without CS backgrounds. Read `docs/playbook.md` before
writing a script.

## House rules

- **Language:** voiceover in Hinglish (Roman script); all on-screen text in English, so the reel
  reads on mute.
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

1. `npm run new -- <slug>`; write `copy.ts` (all strings) and `timeline.ts` (all times, seconds).
2. Build beats in `scenes/` from `src/kit` components. Animation must be a pure function of time
   (`t` in seconds) so beats can be retimed and cut seamlessly. Use `rand(seed)`, never `Math.random()`.
3. Check visually before rendering the full reel: `npm run stills -- <CompId> <frames...>`, then
   `python3 scripts/sheet.py out/sheet.png <pngs>` and look at the sheet. Check every beat,
   every wipe, the peak-effect frame, the cover, and that the last frame matches frame 0.
4. `npm run render -- <slug>`. Deliver `out/<slug>/<slug>.mp4` (upload copy) and `cover.png`.
5. Update the table in `README.md` and the reel's brief in `docs/reels/`.

## Gotchas

- Font subsets lack `→`; use `<Arrow />` from `src/kit/components/Icons.tsx`. `↓` and `·` are fine.
- Remotion `<Folder name>` allows only letters, digits and `-`.
- Google Fonts is unreachable from the sandbox; fonts come from `@fontsource` into `public/fonts`.
- Film grain makes masters big (~600 MB for 54 s at CRF 18); the render script's upload copy is
  ~110 MB. Never commit `out/`.
- A 54 s reel takes ~8 min to render with 2 CPUs; run it in the background.
