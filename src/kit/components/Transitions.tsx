import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, ease, prog, rand, window01 } from "../anim";
import { COLORS, FONTS, FPS, SAFE } from "../theme";

/**
 * VHS rewind treatment for a window [t0, t1]: chroma split, scanlines, a rolling tracking band,
 * jitter and a ◀◀ badge. Pair it with a time remap that runs scene time backwards.
 */
export const RewindFX: React.FC<{ t: number; t0: number; t1: number; label?: string; children: React.ReactNode; strength?: number }> = ({
  t,
  t0,
  t1,
  label = "REWIND",
  children,
  strength = 1,
}) => {
  const a = t < t0 || t > t1 ? 0 : window01(t, t0, t1, 0.1, 0.14) * strength;
  if (a <= 0.001) return <>{children}</>;
  const f = Math.floor(t * FPS);
  const off = 7 * a;
  const jy = (rand(f * 1.7) - 0.5) * 8 * a;
  const bandY = ((t - t0) * 2600) % 2300 - 200;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${off * 0.4}px, ${jy}px)`, filter: `saturate(${1 - 0.45 * a}) contrast(${1 + 0.18 * a}) brightness(${1 + 0.08 * a})` }}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${-off}px, ${jy}px)`, opacity: 0.32 * a, mixBlendMode: "screen", filter: "sepia(1) saturate(6) hue-rotate(-50deg)" }}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${off}px, ${jy}px)`, opacity: 0.32 * a, mixBlendMode: "screen", filter: "sepia(1) saturate(6) hue-rotate(150deg)" }}>
        {children}
      </AbsoluteFill>
      {/* scanlines */}
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.38) 0 2px, rgba(0,0,0,0) 2px 5px)", opacity: a }} />
      {/* tracking band */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: bandY,
          height: 90,
          background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.22), rgba(255,255,255,0))",
          transform: `translateX(${(rand(f) - 0.5) * 60}px)`,
          opacity: a,
          mixBlendMode: "screen",
        }}
      />
      {/* badge */}
      <div
        style={{
          position: "absolute",
          right: 1080 - SAFE.right,
          top: SAFE.top + 8,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: a * (Math.floor(t * 4) % 2 === 0 ? 1 : 0.55),
          fontFamily: FONTS.mono,
          fontWeight: 700,
          fontSize: 40,
          color: COLORS.text,
          textShadow: "0 0 12px rgba(255,255,255,0.6)",
        }}
      >
        <svg width={64} height={40} viewBox="0 0 64 40">
          <path d="M 30 4 L 4 20 L 30 36 Z M 60 4 L 34 20 L 60 36 Z" fill={COLORS.text} />
        </svg>
        {label}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Whip pan between two full-frame scenes. dir 1 = camera pans up (old scene slides down, new
 * scene comes from the top); -1 = the reverse. Blur follows the pan speed.
 */
export const WhipPan: React.FC<{
  t: number;
  t0: number;
  dur?: number;
  dir?: 1 | -1;
  from: React.ReactNode;
  to: React.ReactNode;
  id: string;
}> = ({ t, t0, dur = 0.42, dir = 1, from, to, id }) => {
  if (t < t0) return <>{from}</>;
  if (t > t0 + dur) return <>{to}</>;
  const pos = (x: number) => ease.inOut(clamp01((x - t0) / dur));
  const p = pos(t);
  const v = Math.abs(pos(t + 0.5 / FPS) - pos(t - 0.5 / FPS)) * 1920;
  const blur = Math.min(60, v * 0.45);
  const H = 1920 + 120;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={`${id}-wb`} x="-5%" y="-30%" width="110%" height="160%">
          <feGaussianBlur stdDeviation={`0 ${blur.toFixed(1)}`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: blur > 0.5 ? `url(#${id}-wb)` : undefined }}>
        <AbsoluteFill style={{ transform: `translateY(${dir * p * H}px)` }}>{from}</AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateY(${dir * (p - 1) * H}px)` }}>{to}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A white flash frame for impacts (decays quickly). */
export const Flash: React.FC<{ t: number; at: number; dur?: number; color?: string; max?: number }> = ({ t, at, dur = 0.25, color = "#fff", max = 0.5 }) => {
  if (t < at || t > at + dur) return null;
  return <AbsoluteFill style={{ background: color, opacity: max * (1 - prog(t, at, at + dur, ease.out)) }} />;
};
