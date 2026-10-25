// TEMPLATE REEL — copied by `npm run new -- <slug>`. Every time here is in SECONDS.
import { FPS } from "../../kit/theme";
import type { HudEvent } from "../../kit/components/HUD";
import type { SfxCue } from "../../kit/components/ReelAudio";
import { makeCue, type Word } from "../../kit/sync";
import words from "./words.json";

export { FPS };
// cue("word", nth, fallback): start time of the nth spoken "word" once words.json holds the
// voiceover's word timings; until then, the fallback.
const cue = makeCue(words as Word[]);
export const SLUG = "_template";
export const ASSETS = `reels/${SLUG}`; // files live in public/reels/<slug>/
export const DURATION_S = 12;
export const DURATION_FRAMES = Math.round(DURATION_S * FPS);

// ---------- Asset flags (files inside public/reels/<slug>/) ----------
export const USE_VO = false; // vo.mp3
export const USE_MUSIC = false; // music.mp3
export const USE_SFX = false; // sfx/<name>.mp3
export const USE_CAPTIONS = false; // captions.json

// ---------- Beats ----------
export const BEATS = {
  hook: { start: 0, end: 3 },
  body: { start: 3, end: 9 },
  cta: { start: 9, end: DURATION_S },
} as const;
export type BeatId = keyof typeof BEATS;
export const BEAT_ORDER: BeatId[] = ["hook", "body", "cta"];
// Boundaries that get the photocopier light-bar wipe (others are hard cuts).
export const WIPES = [BEATS.body.start, BEATS.cta.start];

// ---------- Cues ----------
export const CUES = {
  hook: { headline: cue("hook", 1, 0.2) },
  body: { headline: 3.25, tag: 4.2, ticks: [5.0, 6.2, 7.4] },
  cta: { headline: 9.25, comment: 10.2 },
};

// ---------- Counter HUD ----------
export const HUD_EVENTS: HudEvent[] = [
  { t: CUES.body.headline, text: "STEP 1" },
  ...CUES.body.ticks.map((t, i) => ({ t, text: `STEP ${i + 2}` })),
];
export const HUD_HIDE = BEATS.cta.start;

// ---------- Audio ----------
export const MUSIC_VOLUME = USE_VO ? 0.07 : 0.18;
export const SFX_CUES: SfxCue[] = [];
