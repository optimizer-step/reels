import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Backdrop, COLORS, Flash, Glitch, Grain, Headline, ReelAudio, SHOW_SAFE_ZONE, SafeZoneOverlay, Vignette, WhipPan, ensureFonts, prog, shake } from "../../kit";
import { copy } from "./copy";
import { Cta } from "./scenes/Cta";
import { HistoryHeadline, HookHeadline, PayoffHeadlines, WorkbenchHeadlines } from "./scenes/Headlines";
import { History } from "./scenes/History";
import { Hook } from "./scenes/Hook";
import { Payoff } from "./scenes/Payoff";
import { ModuleTree } from "./scenes/Tree";
import { Workbench } from "./scenes/Workbench";
import { ASSETS, BEATS, CUES, DURATION_S, FPS, IMPACTS, MUSIC_SILENCES, MUSIC_VOLUME, SFX_CUES, USE_MIX, USE_MUSIC, USE_SFX, USE_VO } from "./timeline";

ensureFonts();

const B = BEATS;
const C = CUES;

const HookScene: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Backdrop t={t} glow="rgba(255,59,48,0.05)" />
    <Hook t={t} />
    <HookHeadline t={t} />
  </AbsoluteFill>
);

const WorkbenchScene: React.FC<{ t: number }> = ({ t }) => {
  // a slow push-in during each beat keeps the frame alive
  const beats = [B.why, B.cascade, B.total, B.hack, B.lazy, B.token];
  const cur = beats.find((b) => t >= b.start && t < b.end) ?? B.why;
  const push = 1 + 0.025 * prog(t, cur.start, cur.end, (x) => x);
  return (
    <AbsoluteFill>
      <Backdrop t={t} glow="rgba(77,163,255,0.06)" />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "500px 860px" }}>
        <Workbench t={t} />
      </AbsoluteFill>
      <WorkbenchHeadlines t={t} />
    </AbsoluteFill>
  );
};

const HistoryScene: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Backdrop t={t} glow="rgba(48,209,88,0.05)" />
    <History t={t} />
    <HistoryHeadline t={t} />
  </AbsoluteFill>
);

const PayoffScene: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Backdrop t={t} />
    <Payoff t={t} />
    <PayoffHeadlines t={t} />
    <Cta t={t} />
  </AbsoluteFill>
);

export const LazyImportReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sh = shake(t, IMPACTS, 4);

  let scene: React.ReactNode;
  if (t < B.why.start + 0.5) scene = <WhipPan id="w1" t={t} t0={B.why.start - 0.08} dur={0.42} dir={1} from={<HookScene t={t} />} to={<WorkbenchScene t={t} />} />;
  else if (t < B.history.start + 0.5) scene = <WhipPan id="w2" t={t} t0={B.history.start - 0.05} dur={0.42} axis="x" from={<WorkbenchScene t={t} />} to={<HistoryScene t={t} />} />;
  else if (t < B.payoff.start + 0.5) scene = <WhipPan id="w3" t={t} t0={B.payoff.start - 0.05} dur={0.42} dir={1} from={<HistoryScene t={t} />} to={<PayoffScene t={t} />} />;
  // loop: whip back to the cold open exactly as it looks on frame 0
  else scene = <WhipPan id="w4" t={t} t0={C.cta.whip} dur={0.42} dir={-1} from={<PayoffScene t={t} />} to={<HookScene t={0} />} />;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg)` }}>
        <Glitch t={t} t0={C.total.stamp - 0.03} dur={0.26} strength={1} seed={4}>
          <Glitch t={t} t0={C.history.reject - 0.03} dur={0.24} strength={0.8} seed={9}>
            {scene}
          </Glitch>
        </Glitch>
      </AbsoluteFill>
      <Flash t={t} at={C.lazy.stamp} max={0.22} color={COLORS.yellow} />
      <Flash t={t} at={C.total.stamp} max={0.25} color={COLORS.red} />
      <Flash t={t} at={C.payoff.fail} max={0.18} color={COLORS.red} />
      <Grain frame={frame} light={0.05} dark={0.08} />
      <Vignette strength={0.45} />
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

/** Cover: the real pandas import tree in full bloom under the claim. */
export const LazyImportCover: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <Backdrop t={2} glow="rgba(77,163,255,0.08)" />
    <ModuleTree id="cover-tree" tree="pandas" cx={540} cy={1180} r={430} grow={1} color={COLORS.blue} labels={0} rotate={0.4} t={1.2} />
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(11,11,15,0.92) 0%, rgba(11,11,15,0.55) 30%, rgba(11,11,15,0) 50%)" }} />
    <Headline t={10} start={0} static lines={copy.cover} top={280} size={124} lineHeight={0.95} />
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 1180,
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
        padding: "8px 26px",
        borderRadius: 40,
        background: "rgba(11,11,15,0.9)",
        border: `3px solid ${COLORS.yellow}`,
        boxShadow: `0 0 40px ${COLORS.yellow}66`,
        fontFamily: "JetBrains Mono",
        fontWeight: 800,
        fontSize: 52,
        color: COLORS.yellow,
      }}
    >
      lazy <span style={{ color: COLORS.violet }}>import</span> <span style={{ color: COLORS.text }}>pandas</span>
    </div>
    <Grain frame={3} light={0.06} dark={0.09} id="covergrain" />
    <Vignette strength={0.45} />
  </AbsoluteFill>
);
