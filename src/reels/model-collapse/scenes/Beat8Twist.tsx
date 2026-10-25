import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { ease, lerp, prog } from "../../../kit/anim";
import { CURVE } from "../../../kit/components/BellCurve";
import { CurveStage } from "../CurveStage";
import { Headline, Tag } from "../../../kit/components/Headline";
import { LightBar } from "../../../kit/components/LightBar";
import { copy } from "../copy";
import { COLORS, SAFE } from "../../../kit/theme";
import { ASSETS, BROLL, CUES } from "../timeline";

const C = CUES.twist;

// wobbly hand-drawn stroke under the curve
const handPath = (() => {
  const pts: string[] = [];
  for (let x = SAFE.left + 10; x <= SAFE.right - 10; x += 10) {
    const y = CURVE.base + 22 + 6 * Math.sin(x * 0.017 + 0.4) + 3 * Math.sin(x * 0.043 + 1.3);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M ${pts.join(" L ")}`;
})();

// loose signature-like scribble behind the final card
const scribble = (() => {
  const pts: string[] = [];
  const n = 420;
  for (let i = 0; i <= n; i++) {
    const p = i / n;
    const x = 110 + p * 800 + 70 * Math.sin(p * Math.PI * 9);
    const y = 860 + 150 * Math.sin(p * Math.PI * 4.5 + 0.6) * Math.cos(p * Math.PI * 1.3) + 60 * Math.cos(p * Math.PI * 9);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${pts.join(" L ")}`;
})();

export const Beat8Twist: React.FC<{ t: number }> = ({ t }) => {
  const restore = prog(t, C.springBack + 0.1, C.springBack + 0.9);
  const strokeP = prog(t, C.stroke, C.stroke + 0.85, ease.inOut);
  const cardWipe = prog(t, C.card - 0.1, C.card + 0.12, ease.inOut);
  const inCard = t >= C.card - 0.1;
  const scribP = prog(t, C.card + 0.1, C.card + 3.0, ease.inOut);

  const curveLayer = (
    <AbsoluteFill>
      <CurveStage t={t} draw={1} fill={restore} labels={restore} axis={prog(t, C.stroke, C.stroke + 0.5)} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="handGlow" x="-10%" y="-200%" width="120%" height="500%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <path d={handPath} fill="none" stroke={COLORS.yellow} strokeWidth={22} strokeLinecap="round" opacity={0.45} filter="url(#handGlow)" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strokeP} />
        <path d={handPath} fill="none" stroke={COLORS.yellow} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strokeP} />
      </svg>
      <Headline t={t} start={C.twistWord} lines={[[copy.twist.twistWord]]} top={330} size={112} color={COLORS.yellow} exit={C.card - 0.35} />
      <Headline t={t} start={C.headline} lines={copy.twist.headline} top={462} size={98} stagger={0.16} exit={C.card - 0.35} />
      <Tag t={t} start={C.tag} top={1258} align="center" size={26} exit={C.card - 0.35}>
        {copy.twist.tag}
      </Tag>
    </AbsoluteFill>
  );

  const cardLayer = (
    <AbsoluteFill>
      {BROLL.humanHand ? (
        <AbsoluteFill style={{ opacity: 0.4 }}>
          <OffthreadVideo src={staticFile(`${ASSETS}/broll/human-hand.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(11,11,15,0.5), rgba(11,11,15,0.85))" }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 46% 42%, rgba(255,214,10,0.14), rgba(255,214,10,0) 70%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={scribble} fill="none" stroke={COLORS.yellow} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={0.3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - scribP} />
      </svg>
      <Headline t={t} start={C.card + 0.12} lines={copy.twist.card} top={590} size={108} align="center" stagger={0.15} />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill>
      {!inCard || cardWipe < 1 ? curveLayer : null}
      {inCard ? (
        <>
          <AbsoluteFill style={{ clipPath: `inset(0 0 ${((1 - cardWipe) * 100).toFixed(2)}% 0)`, background: COLORS.bg }}>{cardLayer}</AbsoluteFill>
          {cardWipe > 0 && cardWipe < 1 ? <LightBar y={lerp(-150, 2070, cardWipe)} /> : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
