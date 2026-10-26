import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop, COLORS, FONTS, Grain, Headline, Vignette, ensureFonts, prog } from "../../kit";
import { COPY } from "./copy";
import { Surface } from "./Surface";
import { DURATION_S, FPS } from "./timeline";
ensureFonts();

const Capsule: React.FC<{ t: number }> = ({ t }) => (
  <div style={{
    position: "absolute", left: 60, top: 215, width: 880, height: 48,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    fontFamily: FONTS.mono, fontSize: 23, fontWeight: 700,
    color: COLORS.grey, letterSpacing: 2, opacity: 1 - prog(t, 33.7, 35.3),
  }}>
    <span>OPTIMIZER STEP  /  ML IN MOTION</span>
    <span style={{ color: COLORS.yellow }}>03 / LEARNING RATE</span>
  </div>
);
const Formula: React.FC<{ t: number }> = ({ t }) => (
  <div style={{
    position: "absolute", left: 84, top: 1120, width: 832,
    borderTop: "1px solid " + COLORS.line, paddingTop: 17,
    textAlign: "center", fontFamily: FONTS.mono, fontSize: 21,
    color: COLORS.grey, opacity: prog(t, 4.5, 5.2) * (1 - prog(t, 30.5, 31.5)),
  }}>
    L(w,b) = (w - 2)^2 + (b - 1)^2
  </div>
);
export const GradientDescentReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Backdrop t={t} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, background: "radial-gradient(ellipse at 50% 54%, rgba(255,214,10,0.035), transparent 58%)" }} />
      <Capsule t={t} />
      <Headline t={t} start={0.15} exit={3.85} lines={COPY.hook} top={310} size={91} stagger={0.12} />
      <Headline t={t} start={4.2} exit={8.8} lines={COPY.direction} top={312} size={84} stagger={0.1} />
      <Headline t={t} start={9.1} exit={21.5} lines={COPY.race} top={310} size={100} stagger={0.14} />
      <Headline t={t} start={21.9} exit={27.9} lines={COPY.lesson} top={310} size={85} stagger={0.14} />
      <Headline t={t} start={28.4} exit={31.3} lines={COPY.takeaway} top={310} size={79} stagger={0.1} />
      <Surface t={t} />
      <Formula t={t} />
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, 31.8, 32.4) * (1 - prog(t, 34.8, DURATION_S)) }}>
        <Headline t={t} start={32.1} lines={[["COMMENT"], ["*GRADIENT*"]]} top={705} size={120} stagger={0.16} />
      </div>
      <Grain frame={frame} light={0.045} dark={0.065} />
      <Vignette strength={0.4} />
      <div style={{ position: "absolute", inset: 0, background: COLORS.bg, opacity: prog(t, 35.3, DURATION_S) }} />
    </AbsoluteFill>
  );
};
export const GradientDescentCover: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <Backdrop t={0} />
    <Capsule t={0} />
    <Headline t={10} start={0} static lines={COPY.cover} top={338} size={128} />
    <Surface t={21.1} />
    <Grain frame={3} light={0.05} dark={0.08} />
    <Vignette strength={0.4} />
  </AbsoluteFill>
);
