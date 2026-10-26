import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { Backdrop, COLORS, Flash, Glitch, Grain, Headline, ReelAudio, RewindFX, SHOW_SAFE_ZONE, SafeZoneOverlay, Vignette, WhipPan, ensureFonts, shake } from "../../kit";
import { copy } from "./copy";
import { sliderValue } from "./control";
import { Board } from "./scenes/Board";
import { Overlays } from "./scenes/Overlays";
import { Valley } from "./scenes/Valley";
import {
  ASSETS,
  BEATS,
  BROLL,
  CUES,
  DURATION_S,
  FPS,
  IMPACTS,
  MUSIC_SILENCES,
  MUSIC_VOLUME,
  SFX_CUES,
  USE_MUSIC,
  USE_MIX,
  USE_SFX,
  USE_VO,
} from "./timeline";

ensureFonts();

const REWINDS: [number, number][] = [
  [BEATS.rewind1.start, BEATS.rewind1.end],
  [BEATS.rewind2.start, BEATS.rewind2.end],
  [BEATS.rewind3.start, BEATS.rewind3.end],
];

export const GradientDescentReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sh = shake(t, IMPACTS, 3);

  const valley = (
    <AbsoluteFill>
      <Backdrop t={t} glow="rgba(77,163,255,0.07)" />
      <Valley t={t} frame={frame} sliderValue={sliderValue(t)} />
    </AbsoluteFill>
  );
  const board = (
    <AbsoluteFill>
      <Backdrop t={t} />
      <Board t={t} />
    </AbsoluteFill>
  );

  // one continuous world: valley -> whip up -> board (chart, twist, CTA) -> whip down -> valley (loop)
  let scene: React.ReactNode;
  if (t < CUES.chart.whip + 0.5) scene = <WhipPan id="up" t={t} t0={CUES.chart.whip} dir={1} from={valley} to={board} />;
  else scene = <WhipPan id="down" t={t} t0={CUES.cta.whip} dir={-1} from={board} to={valley} />;

  const rw = REWINDS.find(([a, b]) => t >= a && t <= b);
  if (rw) scene = <RewindFX t={t} t0={rw[0]} t1={rw[1]} label={copy.rewind}>{scene}</RewindFX>;

  const alarmCut = BROLL.alarm && t >= CUES.big.explode + 0.04 && t < CUES.big.explode + 0.5;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1 + Math.min(0.04, Math.abs(sh.x) * 0.001)})` }}>
        <Glitch t={t} t0={CUES.hook.escape - 0.02} dur={0.28} strength={1.1} seed={2}>
          {scene}
        </Glitch>
      </AbsoluteFill>
      {alarmCut ? (
        <AbsoluteFill>
          <OffthreadVideo src={staticFile(`${ASSETS}/broll/alarm.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ transform: `translate(${sh.x * 0.3}px, ${sh.y * 0.3}px)` }}>
        <Overlays t={t} />
      </AbsoluteFill>
      <Flash t={t} at={CUES.hook.escape} max={0.35} />
      <Flash t={t} at={CUES.big.explode} max={0.35} color={COLORS.red} />
      <Flash t={t} at={CUES.chart.breakout} max={0.4} color={COLORS.red} />
      <Grain frame={frame} light={0.06} dark={0.09} />
      <Vignette strength={0.5} />
      {SHOW_SAFE_ZONE ? <SafeZoneOverlay /> : null}
      {USE_MIX ? (
        <Audio src={staticFile(`${ASSETS}/mix.mp3`)} />
      ) : (
        <ReelAudio
          dir={ASSETS}
          duration={DURATION_S}
          vo={{ enabled: USE_VO }}
          music={{ enabled: USE_MUSIC, volume: MUSIC_VOLUME, silences: MUSIC_SILENCES }}
          sfx={{ enabled: USE_SFX, cues: SFX_CUES }}
        />
      )}
    </AbsoluteFill>
  );
};

/** Cover: the ball smashing into a wall mid-bounce, trail behind it, headline locked on. The valley
 * is lowered so the ball sits clear of the headline. */
export const GradientDescentCover: React.FC = () => {
  const t = CUES.hook.lines[1] - 0.03;
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Backdrop t={t} glow="rgba(77,163,255,0.07)" />
      <AbsoluteFill style={{ transform: "translateY(190px) scale(1.06)" }}>
        <Valley t={t} frame={3} sliderValue={0.22} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(11,11,15,0.85) 0%, rgba(11,11,15,0.2) 34%, rgba(11,11,15,0) 50%)" }} />
      <Headline t={10} start={0} static lines={copy.cover} top={300} size={120} lineHeight={0.96} />
      <Grain frame={4} light={0.07} dark={0.1} id="covergrain" />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

