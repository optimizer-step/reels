# Optimizer Step — reel kit

AI/ML explainer reels for Instagram and YouTube Shorts, built entirely in code with
[Remotion](https://www.remotion.dev/) (React + TypeScript). Every graphic is drawn with SVG/CSS,
so every word, number and timing is exact and editable.

| # | Reel | Folder | Length | Status |
| --- | --- | --- | --- | --- |
| 001 | AI is eating its own homework (model collapse) | `src/reels/model-collapse` | 54 s | Rendered, awaiting voiceover |
| 002 | SBI or river bank? How AI decides (attention) | `src/reels/attention-bank` | 47 s | Rendered, awaiting voiceover |
| 003 | Why AI overshoots (gradient descent, two exact runs) | `src/reels/gradient-descent` | 36 s | Code complete; needs visual QA, VO and final render |

Briefs, scripts and fact sheets: `docs/reels/`. Strategy and concept bank: `docs/playbook.md`.

## Quick start

```bash
npm install
npm run studio                          # live preview of every reel
npm run new -- overfitting-exam         # start a new reel from the template
npm run preview -- gradient-descent         # quick isolated frames + cover (no video encode)
npm run test                             # numerical trajectory tests
npm run check -- AttentionBank          # contact sheets every 2 s + loop check (no video render)
npm run render -- attention-bank        # -> out/attention-bank/{attention-bank.mp4, master.mp4, cover.png}
npm run stills -- AttentionBank 15 300  # specific frames -> out/stills/AttentionBank/
npm run typecheck
python3 scripts/audio/attention_bank.py # regenerate a reel's synthesised sound
```

`out/<slug>/<slug>.mp4` is the upload copy (~16 Mbps cap, fast-start). `master.mp4` is the
CRF 18 master; film grain makes it large, so `out/` is never committed.

## The kit (`src/kit`, import from `src/kit/index.ts`)

| Component | What it does |
| --- | --- |
| `Camera`, `Layer`, `At` | 2.5D camera over a large world canvas: keyframed glides and zooms, parallax layers, automatic directional motion blur from camera speed |
| `Space3D` | SVG 3D scatter with rotation, perspective, depth-sorting, fog, glow, trails and a floor grid (embedding / meaning spaces) |
| `TokenRow`, `tokenLayout` | Monospace token chips with exact positions, focus/highlight/dim states |
| `AttentionBeams` | Weighted attention arcs with glow, % labels and particles flowing toward the attending token |
| `Heatmap` | Attention matrix with diagonal reveal, causal mask and row highlight |
| `DecodeText` | Characters scramble through glyphs before settling (vectors, AI text) |
| `DustField`, `Burst` | Drifting motes for depth; particle bursts for impacts |
| `Glitch` | Slice-and-shift RGB glitch, for cuts and emphasis |
| `Headline`, `Tag` | Word-by-word pop headline (`*word*` = yellow + underline swipe), small source tags |
| `CounterHUD` | "GEN 3" / "STEP 2" counter with flip animation and progress pips |
| `useBeatSwitch`, `LightBar` | Beat sequencing with the photocopier light-bar wipe |
| `Degrade`, `Grain`, `Vignette`, `Backdrop` | House look: decay effect, film grain, vignette, dot-grid background |
| `BellCurve` | Normal distribution with "rare" tails |
| `ReelAudio` | Voiceover, music bed (ducks under VO, silence windows), SFX cue list |
| `makeCue` (`sync.ts`) | Word-synced timing: cues follow the voiceover once `words.json` exists |

Sound: `scripts/audio/sfxlib.py` synthesises whooshes, camera flights, impacts, risers, glitches,
pops, typing, beams, swells and a music bed (kick, hats, sub, pad, pluck arpeggio) from code.

## Layout

```
src/
  kit/                    shared house style + components (above)
  reels/
    _template/            copied by `npm run new`
    model-collapse/       reel 001
    attention-bank/       reel 002 — one continuous camera world
      timeline.ts         every time in SECONDS, camera keys, asset flags, SFX cues
      copy.ts             every on-screen string
      data.ts             illustrative weights, 3D points
      words.json          voiceover word timings (empty until the VO exists)
      scenes/             world stations + screen overlays
  Root.tsx                registers all reels (new-reel.mjs edits it)
public/
  fonts/
  reels/<slug>/           vo.mp3, music.mp3, sfx/, broll/, captions.json
scripts/
  new-reel.mjs  render.mjs  stills.mjs  check.mjs  sheet.py  chrome.mjs
  audio/                  sfxlib.py + one sound script per reel
docs/
  playbook.md             ranking signals, rules, formats, concept bank
  reels/                  one brief per reel (script, caption, fact sheet)
```

## Adding a voiceover to a reel

1. Save it as `public/reels/<slug>/vo.mp3` and set `USE_VO = true` in the reel's `timeline.ts`
   (music ducks automatically).
2. Put the word timings in `src/reels/<slug>/words.json` as `[{ "text", "start", "end" }]`
   (seconds; any speech-to-text with word timestamps produces this). Cues written with
   `cue("word", nth, fallback)` then snap to the real delivery. Adjust any others by hand.
3. `npm run check -- <CompId>` to eyeball it, then `npm run render -- <slug>`.

## B-roll

Generate clips in Kling or Higgsfield (9:16, ~5 s, no text in the prompt), save them in
`public/reels/<slug>/broll/`, and wire them in with `OffthreadVideo` behind a flag.

## Rendering notes

- A local headless Chrome is used when present (`scripts/chrome.mjs`); set `REMOTION_CHROME`
  to override, or let Remotion download its own.
- Fonts load from `public/fonts`, so rendering needs no network.
- Keep all `@remotion/*` packages on the same exact version.
- ~50 s reels take 8–12 min to render on 2 CPUs, plus ~7 min for the upload encode.
