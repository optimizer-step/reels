import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Backdrop,
  COLORS,
  Camera,
  Captions,
  DustField,
  Glitch,
  Grain,
  Layer,
  ReelAudio,
  SHOW_SAFE_ZONE,
  SafeZoneOverlay,
  Vignette,
  ensureFonts,
  prog,
} from "../../kit";
import { SENT_A, SENT_B, W_A, W_B } from "./data";
import { HeatStation } from "./scenes/HeatStation";
import { HookStation } from "./scenes/HookStation";
import { MeaningSpace } from "./scenes/MeaningSpace";
import { Meter } from "./scenes/Meter";
import { Overlays } from "./scenes/Overlays";
import { PromptStation } from "./scenes/PromptStation";
import { SentenceStation } from "./scenes/SentenceStation";
import {
  ASSETS,
  BEATS,
  CAMERA,
  CUES,
  DURATION_S,
  FPS,
  MUSIC_SILENCES,
  MUSIC_VOLUME,
  SFX_CUES,
  STATIONS,
  STATION_FADES,
  USE_CAPTIONS,
  USE_MUSIC,
  USE_SFX,
  USE_VO,
} from "./timeline";

ensureFonts();

const ROW_A = STATIONS.sentA.y + 150;
const ROW_B = STATIONS.sentB.y + 150;
const between = (t: number, a: number, b: number) => t >= a && t <= b;
/** Opacity of a station that fades out as the camera leaves and back in at `back`. */
const stationFade = (t: number, f: readonly [number, number, number]) =>
  t >= f[2] ? prog(t, f[2], f[2] + 0.5) : 1 - prog(t, f[0], f[1]);

/** Faint dotted rails linking the stations, so camera flights travel along a visible path. */
const Rails: React.FC = () => {
  const s = STATIONS;
  const pts = [
    [s.hook.x, s.hook.y + 380],
    [s.sentA.x, ROW_A - 420],
    [s.sentA.x, ROW_A + 330],
    [s.sentB.x, ROW_B - 400],
    [s.sentB.x, ROW_B + 300],
    [1100, ROW_B + 380],
    [1480, s.prompts.y + 200],
    [1480, s.heat.y - 300],
  ];
  return (
    <svg width={4000} height={4000} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" />
    </svg>
  );
};

export const AttentionBankReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // the world dims while the 3D meaning space is on screen
  const worldDim = between(t, CUES.space.pullback, CUES.heatmap.cut) ? 1 - 0.86 * prog(t, CUES.space.pullback + 0.2, CUES.space.pullback + 1.3) : 1;

  const scene = (
    <AbsoluteFill>
      <Backdrop t={t} />
      <Camera t={t} keys={CAMERA}>
        <Layer depth={0.35}>
          <DustField t={t} count={70} seed={3} x={-900} y={-200} w={3200} h={2600} opacity={0.35} size={[1.5, 3.5]} />
        </Layer>
        <Layer depth={0.7}>
          <DustField t={t} count={40} seed={8} x={-600} y={0} w={3000} h={3600} opacity={0.25} size={[2, 5]} color={COLORS.yellow} />
        </Layer>
        <Layer opacity={worldDim}>
          <Rails />
          {t < 6 || t > CUES.cta.flight[0] ? <HookStation t={t} /> : null}
          {between(t, BEATS.numbers.start, CUES.heatmap.cut + 0.1) || between(t, CUES.cta.flight[0], DURATION_S) ? (
            <div style={{ position: "absolute", left: 0, top: 0, opacity: stationFade(t, STATION_FADES.sentA) }}>
            <SentenceStation
              id="sa"
              t={t}
              tokens={SENT_A}
              rowY={ROW_A}
              weights={W_A}
              color={COLORS.yellow}
              tokensAt={CUES.numbers.tokens}
              focusAt={CUES.numbers.focus}
              beamsAt={CUES.attention.beams}
              vectors={{ at: CUES.numbers.vectors, bankAt: CUES.numbers.focus + 0.15, hideAt: BEATS.attention.start + 0.1 }}
              note={{ at: CUES.attention.note, target: "cash" }}
            />
            </div>
          ) : null}
          {between(t, BEATS.change.start - 0.5, CUES.heatmap.cut + 0.1) || between(t, CUES.cta.flight[0], DURATION_S) ? (
            <SentenceStation
              id="sb"
              t={t}
              tokens={SENT_B}
              rowY={ROW_B}
              weights={W_B}
              color={COLORS.blue}
              tokensAt={CUES.change.tokens}
              focusAt={CUES.change.tokens + 0.35}
              beamsAt={CUES.change.beams}
              marked={{ i: 4, at: CUES.change.river, color: COLORS.blue }}
            />
          ) : null}
          {between(t, CUES.heatmap.cut - 0.1, DURATION_S) ? (
            <div style={{ position: "absolute", left: 0, top: 0, opacity: stationFade(t, STATION_FADES.heat) }}>
              <HeatStation t={t} />
            </div>
          ) : null}
          {between(t, BEATS.takeaway.start - 0.3, DURATION_S) ? <PromptStation t={t} /> : null}
        </Layer>
      </Camera>
      <MeaningSpace t={t} />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Glitch t={t} t0={CUES.heatmap.cut - 0.12} dur={0.3} strength={1.1} seed={7}>
        {scene}
      </Glitch>
      <Overlays t={t} />
      <Meter t={t} />
      <Grain frame={frame} light={0.07} dark={0.1} />
      <Vignette strength={0.55} />
      {USE_CAPTIONS ? <Captions t={t} src={`${ASSETS}/captions.json`} /> : null}
      {SHOW_SAFE_ZONE ? <SafeZoneOverlay /> : null}
      <ReelAudio
        dir={ASSETS}
        duration={DURATION_S}
        vo={{ enabled: USE_VO }}
        music={{ enabled: USE_MUSIC, volume: MUSIC_VOLUME, silences: MUSIC_SILENCES }}
        sfx={{ enabled: USE_SFX, cues: SFX_CUES }}
      />
    </AbsoluteFill>
  );
};
