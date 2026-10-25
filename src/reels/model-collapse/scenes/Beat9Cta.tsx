import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, lerp, prog, springAt } from "../../../kit/anim";
import { LightBar } from "../../../kit/components/LightBar";
import { copy } from "../copy";
import { COLORS, CX, FONTS } from "../../../kit/theme";
import { CUES, DURATION_S } from "../timeline";
import { Beat1Hook } from "./Beat1Hook";

const C = CUES.cta;
const LOOP_END = DURATION_S - 0.25;

const SpikeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={110} height={110} viewBox="0 0 110 110">
    <path d="M 6 96 L 104 96" stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
    <path d="M 8 95 C 40 95, 48 92, 52 50 C 54 14, 56 14, 58 50 C 62 92, 70 95, 102 95" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
  </svg>
);
const BellIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={110} height={110} viewBox="0 0 110 110">
    <path d="M 6 96 L 104 96" stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
    <path d="M 4 94 C 24 92, 34 40, 55 40 C 76 40, 86 92, 106 94" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
  </svg>
);

const Panel: React.FC<{ t: number; start: number; top: number; word: string; color: string; icon: React.ReactNode; dir: 1 | -1; pulse: number }> = ({
  t,
  start,
  top,
  word,
  color,
  icon,
  dir,
  pulse,
}) => {
  const s = springAt(t, start, { damping: 15, stiffness: 160 });
  return (
    <div
      style={{
        position: "absolute",
        left: CX - 430,
        width: 860,
        top,
        height: 330,
        borderRadius: 34,
        border: `4px solid ${color}`,
        background: `${color}14`,
        boxShadow: `0 0 ${40 + pulse * 70}px ${color}${pulse > 0.5 ? "55" : "33"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 34,
        opacity: Math.min(1, s * 1.4),
        transform: `translateX(${(1 - s) * 700 * dir}px) scale(${1 + pulse * 0.05})`,
      }}
    >
      {icon}
      <div style={{ fontFamily: FONTS.head, fontWeight: 700, fontSize: 124, letterSpacing: "-0.035em", color }}>{word}</div>
    </div>
  );
};

export const Beat9Cta: React.FC<{ t: number }> = ({ t }) => {
  const phase = Math.max(0, t - (C.split + 0.6));
  const pulseA = Math.max(0, Math.sin(phase * Math.PI * 1.6));
  const pulseB = Math.max(0, Math.sin(phase * Math.PI * 1.6 + Math.PI));
  const or = springAt(t, C.split + 0.45);
  const comment = springAt(t, C.comment);
  const bounce = Math.abs(Math.sin((t - C.comment) * Math.PI * 1.8)) * 12;
  const wipe = prog(t, C.loopWipe, LOOP_END, ease.inOut);
  const barY = lerp(-150, 2070, wipe);

  return (
    <AbsoluteFill>
      <Panel t={t} start={C.split} top={340} word={copy.cta.collapse} color={COLORS.red} icon={<SpikeIcon color={COLORS.red} />} dir={-1} pulse={pulseA} />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1000,
          top: 690,
          textAlign: "center",
          fontFamily: FONTS.mono,
          fontWeight: 500,
          fontSize: 52,
          color: COLORS.grey,
          opacity: or,
          transform: `scale(${or})`,
        }}
      >
        {copy.cta.or}
      </div>
      <Panel t={t} start={C.split + 0.2} top={790} word={copy.cta.thrive} color={COLORS.yellow} icon={<BellIcon color={COLORS.yellow} />} dir={1} pulse={pulseB} />

      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1000,
          top: 1166,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          fontFamily: FONTS.head,
          fontWeight: 700,
          fontSize: 54,
          color: COLORS.text,
          opacity: comment,
          transform: `translateY(${(1 - comment) * 30}px)`,
        }}
      >
        {copy.cta.comment}
        <svg width={44} height={56} viewBox="0 0 44 56" style={{ transform: `translateY(${bounce}px)` }}>
          <path d="M 22 4 L 22 48 M 6 32 L 22 50 L 38 32" fill="none" stroke={COLORS.yellow} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1000,
          top: 1262,
          textAlign: "center",
          fontFamily: FONTS.mono,
          fontWeight: 500,
          fontSize: 28,
          color: COLORS.grey,
          opacity: prog(t, C.meta, C.meta + 0.4),
        }}
      >
        {copy.cta.meta}
      </div>

      {/* loop: the copier light bar wipes back to the exact opening frame */}
      {t >= C.loopWipe ? (
        <>
          <AbsoluteFill style={{ clipPath: `inset(0 0 ${((1 - wipe) * 100).toFixed(2)}% 0)`, background: COLORS.bg }}>
            <Beat1Hook t={0} frozen />
          </AbsoluteFill>
          {wipe < 1 ? <LightBar y={barY} /> : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
