import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { piecewise } from "../../kit/anim";
import { Backdrop } from "../../kit/components/Backdrop";
import { useBeatSwitch } from "../../kit/components/BeatSwitcher";
import { Captions, SafeZoneOverlay } from "../../kit/components/Captions";
import { Degrade } from "../../kit/components/Degrade";
import { Grain, Vignette } from "../../kit/components/Grain";
import { CounterHUD, hudNumber, hudTextAt } from "../../kit/components/HUD";
import { ReelAudio } from "../../kit/components/ReelAudio";
import { ensureFonts } from "../../kit/fonts";
import { COLORS, SHOW_SAFE_ZONE } from "../../kit/theme";
import { Beat1Hook } from "./scenes/Beat1Hook";
import { Beat2Stakes } from "./scenes/Beat2Stakes";
import { Beat3Proof } from "./scenes/Beat3Proof";
import { Beat4OpenLoop } from "./scenes/Beat4OpenLoop";
import { Beat5Reveal } from "./scenes/Beat5Reveal";
import { Beat6Rehook } from "./scenes/Beat6Rehook";
import { Beat7WhyCare } from "./scenes/Beat7WhyCare";
import { Beat8Twist } from "./scenes/Beat8Twist";
import { Beat9Cta } from "./scenes/Beat9Cta";
import {
  ASSETS,
  BEATS,
  BEAT_ORDER,
  BeatId,
  DEGRADATION,
  DURATION_S,
  FPS,
  HUD_EVENTS,
  HUD_HIDE,
  MUSIC_SILENCE,
  MUSIC_VOLUME,
  SFX_CUES,
  USE_CAPTIONS,
  USE_MUSIC,
  USE_SFX,
  USE_VO,
  VO_VOLUME,
  WIPES,
  WIPE_FRAMES,
} from "./timeline";

ensureFonts();

export const ModelCollapseReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const d = piecewise(DEGRADATION, t);

  const render = (id: BeatId) => {
    switch (id) {
      case "hook":
        return <Beat1Hook t={t} />;
      case "stakes":
        return <Beat2Stakes t={t} />;
      case "proof":
        return <Beat3Proof t={t} />;
      case "openLoop":
        return <Beat4OpenLoop t={t} />;
      case "reveal":
        return <Beat5Reveal t={t} />;
      case "rehook":
        return <Beat6Rehook t={t} />;
      case "whyCare":
        return <Beat7WhyCare t={t} frame={frame} />;
      case "twist":
        return <Beat8Twist t={t} />;
      case "cta":
        return <Beat9Cta t={t} />;
    }
  };
  const { content, bar } = useBeatSwitch({ t, beats: BEATS, order: BEAT_ORDER, wipes: WIPES, wipeFrames: WIPE_FRAMES, render });

  // GEN counter: white before the proof, red while collapsing, yellow once real data returns
  const healed = t >= BEATS.twist.start + 0.55;
  const hudColor = t < BEATS.proof.start ? COLORS.text : healed ? COLORS.yellow : COLORS.red;
  const gen = hudNumber(hudTextAt(HUD_EVENTS, t));

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Degrade d={d} frame={frame}>
        <Backdrop t={t} />
        {content}
      </Degrade>
      <CounterHUD
        t={t}
        events={HUD_EVENTS}
        hideAt={HUD_HIDE}
        color={hudColor}
        pips={{ count: 15, value: gen, color: healed ? COLORS.yellow : COLORS.red }}
      />
      <Grain frame={frame} light={0.07 + d * 0.32} dark={0.1 + d * 0.35} />
      <Vignette strength={0.5 + d * 0.25} />
      {bar}
      {USE_CAPTIONS ? <Captions t={t} src={`${ASSETS}/captions.json`} /> : null}
      {SHOW_SAFE_ZONE ? <SafeZoneOverlay /> : null}
      <ReelAudio
        dir={ASSETS}
        duration={DURATION_S}
        vo={{ enabled: USE_VO, volume: VO_VOLUME }}
        music={{ enabled: USE_MUSIC, volume: MUSIC_VOLUME, silences: [MUSIC_SILENCE] }}
        sfx={{ enabled: USE_SFX, cues: SFX_CUES }}
      />
    </AbsoluteFill>
  );
};
