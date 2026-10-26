# Optimizer Step — reel kit

AI/ML explainer reels for Instagram and YouTube Shorts, built entirely in code with
[Remotion](https://www.remotion.dev/) (React + TypeScript). Every graphic is drawn with SVG/CSS,
so every word, number and timing is exact and editable.

| # | Reel | Folder | Length | Status |
| --- | --- | --- | --- | --- |
| 001 | AI is eating its own homework (model collapse) | `src/reels/model-collapse` | 54 s | Rendered, awaiting voiceover |
| 002 | SBI or river bank? How AI decides (attention) | `src/reels/attention-bank` | 47 s | Rendered, awaiting voiceover |
| 003 | One number can break AI training (learning rate) | `src/reels/gradient-descent` | 44 s | Rendered with a scratch English voice, full score and mastered mix; swap in the HeyGen voice when ready |
| 004 | One word that makes Python start 16× faster (lazy imports, Python 3.15) | `src/reels/lazy-import` | 46 s | Rendered with a scratch English voice, full score and mastered mix; real benchmark in `docs/reels/004-lazy-import/` |

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
python3 scripts/gen/kokoro_tts.py gradient-descent   # offline English voice from vo.json (no key)
python3 scripts/audio/gradient_descent.py           # SFX + score + mastered mix.mp3, cut to the timeline
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
| `Terrain` | Shaded 3D surface (painter's algorithm, contour lines, fog, specular) for loss landscapes |
| `LineChart` | Glowing lines drawn over time; a line can escape the plot and burn out (`fadeTop`) |
| `Slider`, `Odometer` | On-screen control with zones and ticks; rolling-digit counters (Indian grouping) |
| `WhipPan`, `RewindFX`, `Flash` | Motion-blurred whip pans between scenes, VHS time-reversal, impact flashes |
| `Space3D` `declutter` | Labels fade where they would collide with a higher-priority label |
| `motion.ts` | `remap`, `shake`, `shutterSamples`, `squashStretch`, `stepValue` |

Sound: `scripts/audio/sfxlib.py` synthesises everything from code: whooshes, flights, impacts,
risers, glitches, pops, typing, beams, swells and two music engines (v1 bed; v2 production tools:
punchy kick, clap, 808-style hats, saturated sub, FM plucks and bells, supersaw pads, convolution
reverb, sidechain pump, tape stop, voice ducking, limiter, loudness metering). A reel's sound
script reads its timeline through `scripts/audio/cues.mjs`, so the score is cut to the picture.

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
  reels/<slug>/           vo.mp3, vo/, music.mp3, mix.mp3, sfx/, broll/, generated.json
scripts/
  new-reel.mjs  render.mjs  stills.mjs  check.mjs  preview.mjs  sheet.py  chrome.mjs
  audio/                  sfxlib.py, cues.mjs + one sound script per reel
  gen/                    heygen.mjs, higgsfield.mjs, kokoro_tts.py, align.py, vo-assemble.mjs
docs/
  playbook.md             ranking signals, rules, formats, concept bank
  reels/                  one brief per reel (script, caption, fact sheet)
```

## Voice, sound and generated assets

Reels are voice-driven: `src/reels/<slug>/vo.json` holds the English lines; each beat starts on a
line (`vo-lines.json`) and `cue("word")` lands animation on spoken words (`words.json`). Any of
these produces the voice, places it on the beats and writes both files:

| Voice | Command | Needs |
| --- | --- | --- |
| HeyGen (your cloned voice) | *Generate reel assets* workflow, task `voice` | `HEYGEN_API_KEY`, `HEYGEN_VOICE_ID` secrets |
| Kokoro (offline scratch voice) | `python3 scripts/gen/kokoro_tts.py <slug>` or workflow task `voice-local` | `pip install kokoro-onnx soundfile pocketsphinx` |
| A human recording | `node scripts/gen/vo-assemble.mjs <slug> take.m4a` | one take, 1–2 s pauses between lines |

Then re-run the reel's sound script (`python3 scripts/audio/<slug>.py`; the workflow does it):
it re-cuts the score to the new beats, ducks it under the voice and masters `mix.mp3`
(-14 LUFS, -1.5 dBFS), which the reel plays when `USE_MIX` is on in `timeline.ts`.

The *Generate reel assets* workflow (`.github/workflows/generate.yml`, Actions tab, must be on the
default branch to be dispatchable) also makes HeyGen presenter clips (`presenter.json`) and
Higgsfield / Kling 3.0 b-roll (`shots.json`), and commits everything back. Keys stay in repo
secrets: `HEYGEN_API_KEY`, `HEYGEN_VOICE_ID`, `HEYGEN_AVATAR_ID`, `HIGGSFIELD_API_KEY_ID`,
`HIGGSFIELD_API_KEY_SECRET`. Flip the reel's `BROLL` / `PRESENTER` flags once the files exist.

## B-roll

Describe shots in `src/reels/<slug>/shots.json` (9:16, no text, no logos, no people) and run the
workflow task `shots`, or generate by hand in Kling or Higgsfield and save them in
`public/reels/<slug>/broll/`. Wire them in with `OffthreadVideo` behind a flag.

## Rendering notes

- A local headless Chrome is used when present (`scripts/chrome.mjs`); set `REMOTION_CHROME`
  to override, or let Remotion download its own.
- Fonts load from `public/fonts`, so rendering needs no network.
- Keep all `@remotion/*` packages on the same exact version.
- ~50 s reels take 8–12 min to render on 2 CPUs, plus ~7 min for the upload encode.
