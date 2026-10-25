# Optimizer Step — reel kit

AI/ML explainer reels for Instagram and YouTube Shorts, built entirely in code with
[Remotion](https://www.remotion.dev/) (React + TypeScript). Every graphic is drawn with SVG/CSS,
so every word, number and timing is exact and editable.

| # | Reel | Folder | Status |
| --- | --- | --- | --- |
| 001 | AI is eating its own homework (model collapse) | `src/reels/model-collapse` | Rendered, awaiting voiceover |

## Quick start

```bash
npm install
npm run studio                       # live preview of every reel
npm run new -- attention-bank        # start a new reel from the template
npm run render -- model-collapse     # -> out/model-collapse/{model-collapse.mp4, master.mp4, cover.png}
npm run stills -- ModelCollapse 15 150 330   # check stills -> out/stills/ModelCollapse/
npm run typecheck
```

`out/<slug>/<slug>.mp4` is the upload copy (~16 Mbps cap, fast-start). `master.mp4` is the
CRF 18 master; film grain makes it large, so it is not committed.

## Layout

```
src/
  kit/                    shared house style, used by every reel
    theme.ts              colours, fonts, sizes, Reels safe zone, FPS
    anim.ts               easing, springs, piecewise curves, seeded random
    fonts.ts              local fonts (public/fonts, from @fontsource)
    components/
      Headline.tsx        word-by-word pop headline (*word* = yellow + underline swipe) and Tag
      HUD.tsx             CounterHUD ("GEN 3", "EPOCH 12") with flip + progress pips
      BeatSwitcher.tsx    beat sequencing with the photocopier light-bar wipe
      Degrade.tsx         global decay: blur, desaturation, chromatic offset, jitter
      Grain.tsx           animated film grain + vignette
      LightBar.tsx        the light bar itself
      BellCurve.tsx       normal distribution with "rare" tails
      Backdrop.tsx        near-black dot-grid background
      Icons.tsx           robot, globe, arrows
      Captions.tsx        burned-in captions from JSON + safe-zone dev overlay
      ReelAudio.tsx       voiceover, ducked music bed with silence windows, SFX cues
  reels/
    _template/            copied by `npm run new`
    model-collapse/       reel 001
      timeline.ts         every time in SECONDS + asset flags (retime to your VO here)
      copy.ts             every on-screen string
      Reel.tsx            the composition
      scenes/             one file per beat
  Root.tsx                registers all reels (new-reel.mjs edits it)
public/
  fonts/
  reels/<slug>/           vo.mp3, music.mp3, sfx/, broll/, captions.json
scripts/
  new-reel.mjs            scaffold a reel
  render.mjs              master + upload copy + cover
  stills.mjs              check stills
  sheet.py                contact sheet: python3 scripts/sheet.py out/sheet.png <pngs...>
  make_audio_model_collapse.py   synthesised SFX + music bed for reel 001
docs/
  playbook.md             what makes reels travel + concept bank
  reels/                  one brief per reel (script, sources)
```

## Adding a voiceover to a reel

1. Save it as `public/reels/<slug>/vo.mp3`.
2. In that reel's `timeline.ts`, set `USE_VO = true` (music ducks automatically).
3. Move the beat and cue times to match the recording. Everything reads from `timeline.ts`.
4. `npm run render -- <slug>`.

## B-roll

Generate clips in Kling or Higgsfield (9:16, ~5 s, no text in the prompt), save them in
`public/reels/<slug>/broll/` with the names the reel's `timeline.ts` lists, and flip the
matching `BROLL` flag.

## Rendering notes

- Chrome: `remotion.config.ts` and `scripts/chrome.mjs` use a local headless Chrome if one
  exists; set `REMOTION_CHROME=/path/to/chrome` to override, or let Remotion download its own.
- Fonts load from `public/fonts`, so rendering needs no network.
- Keep all `@remotion/*` packages on the same exact version.
