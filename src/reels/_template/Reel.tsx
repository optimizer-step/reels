import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Backdrop,
  BellCurve,
  COLORS,
  Captions,
  CounterHUD,
  DownArrow,
  FONTS,
  Grain,
  Headline,
  SHOW_SAFE_ZONE,
  SafeZoneOverlay,
  Tag,
  Vignette,
  ReelAudio,
  ensureFonts,
  hudNumber,
  hudTextAt,
  lerp,
  prog,
  springAt,
  useBeatSwitch,
} from "../../kit";
import { copy } from "./copy";
import {
  ASSETS,
  BEATS,
  BEAT_ORDER,
  BeatId,
  CUES,
  DURATION_S,
  FPS,
  HUD_EVENTS,
  HUD_HIDE,
  MUSIC_VOLUME,
  SFX_CUES,
  USE_CAPTIONS,
  USE_MUSIC,
  USE_SFX,
  USE_VO,
  WIPES,
} from "./timeline";

ensureFonts();

const Hook: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Headline t={t} start={CUES.hook.headline} lines={copy.hook.headline} top={640} size={130} />
  </AbsoluteFill>
);

const Body: React.FC<{ t: number }> = ({ t }) => {
  // the curve narrows a little on every tick
  let sigma = 1;
  CUES.body.ticks.forEach((tick) => (sigma = lerp(sigma, sigma * 0.75, springAt(t, tick))));
  return (
    <AbsoluteFill>
      <Headline t={t} start={CUES.body.headline} lines={copy.body.headline} top={340} size={104} />
      <BellCurve
        sigma={sigma}
        draw={prog(t, CUES.body.headline, CUES.body.headline + 1)}
        fill={prog(t, CUES.body.headline + 0.6, CUES.body.headline + 1.2)}
        labels={prog(t, CUES.body.headline + 0.9, CUES.body.headline + 1.3)}
        centreLabel={copy.body.centre}
        tailLabel={copy.body.tails}
      />
      <Tag t={t} start={CUES.body.tag} top={1262} align="center">
        {copy.body.tag}
      </Tag>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ t: number }> = ({ t }) => {
  const c = springAt(t, CUES.cta.comment);
  return (
    <AbsoluteFill>
      <Headline t={t} start={CUES.cta.headline} lines={copy.cta.headline} top={620} size={150} align="center" />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1000,
          top: 900,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          fontFamily: FONTS.head,
          fontWeight: 700,
          fontSize: 54,
          color: COLORS.text,
          opacity: c,
        }}
      >
        {copy.cta.comment}
        <DownArrow bounce={Math.abs(Math.sin((t - CUES.cta.comment) * Math.PI * 1.8)) * 12} />
      </div>
    </AbsoluteFill>
  );
};

export const TemplateReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const render = (id: BeatId) => (id === "hook" ? <Hook t={t} /> : id === "body" ? <Body t={t} /> : <Cta t={t} />);
  const { content, bar } = useBeatSwitch({ t, beats: BEATS, order: BEAT_ORDER, wipes: WIPES, render });
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Backdrop t={t} />
      {content}
      <CounterHUD
        t={t}
        events={HUD_EVENTS}
        hideAt={HUD_HIDE}
        color={COLORS.yellow}
        pips={{ count: HUD_EVENTS.length, value: hudNumber(hudTextAt(HUD_EVENTS, t)), color: COLORS.yellow }}
      />
      <Grain frame={frame} light={0.07} dark={0.1} />
      <Vignette />
      {bar}
      {USE_CAPTIONS ? <Captions t={t} src={`${ASSETS}/captions.json`} /> : null}
      {SHOW_SAFE_ZONE ? <SafeZoneOverlay /> : null}
      <ReelAudio
        dir={ASSETS}
        duration={DURATION_S}
        vo={{ enabled: USE_VO }}
        music={{ enabled: USE_MUSIC, volume: MUSIC_VOLUME }}
        sfx={{ enabled: USE_SFX, cues: SFX_CUES }}
      />
    </AbsoluteFill>
  );
};

export const TemplateCover: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <Backdrop t={0} />
    <Headline t={10} start={0} lines={copy.cover.headline} top={600} size={150} static />
    <Grain frame={7} light={0.1} dark={0.14} id="covergrain" />
    <Vignette />
  </AbsoluteFill>
);
