import React from "react";
import { ease, lerp, prog, rand } from "../anim";
import { COLORS, FONTS, FPS } from "../theme";

/** CSS filter for a two-stage bloom glow. */
export const glow = (color: string, px = 18) => `drop-shadow(0 0 ${px}px ${color}) drop-shadow(0 0 ${px * 2.6}px ${color}66)`;

const GLYPHS = "01ABCDEF#$%&*+=<>?/\\|abcdef0123456789";

/** Text that "decodes": each character cycles through glyphs before settling. */
export const DecodeText: React.FC<{
  text: string;
  t: number;
  start: number;
  dur?: number;
  seed?: number;
  color?: string;
  scrambleColor?: string;
  style?: React.CSSProperties;
}> = ({ text, t, start, dur = 0.8, seed = 1, color, scrambleColor = COLORS.yellow, style }) => {
  if (t < start) return null;
  const tick = Math.floor(t * FPS * 0.5);
  return (
    <span style={{ fontFamily: FONTS.mono, whiteSpace: "pre", ...style }}>
      {text.split("").map((ch, i) => {
        if (ch === " ") return <span key={i}> </span>;
        const settle = start + (i / Math.max(1, text.length)) * dur * 0.65 + rand(seed * 31 + i) * dur * 0.35;
        if (t >= settle) return <span key={i} style={{ color }}>{ch}</span>;
        const g = GLYPHS[Math.floor(rand(seed * 7 + i * 13 + tick) * GLYPHS.length)];
        return (
          <span key={i} style={{ color: scrambleColor, opacity: 0.85 }}>
            {g}
          </span>
        );
      })}
    </span>
  );
};

/** Drifting dust / data motes. Put it inside a camera Layer with depth < 1 for parallax. */
export const DustField: React.FC<{
  t: number;
  count: number;
  seed: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  size?: [number, number];
  opacity?: number;
}> = ({ t, count, seed, x, y, w, h, color = COLORS.text, size = [1.5, 4], opacity = 0.5 }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    {Array.from({ length: count }, (_, i) => {
      const px = rand(seed + i * 3.1) * w + Math.sin(t * 0.3 + i) * 14;
      const py = rand(seed + i * 5.7) * h + Math.cos(t * 0.23 + i * 1.7) * 18;
      const r = lerp(size[0], size[1], rand(seed + i * 9.3));
      const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.6 + rand(seed + i) * 1.4) + i));
      return <circle key={i} cx={px} cy={py} r={r} fill={color} opacity={opacity * tw} />;
    })}
  </svg>
);

/** Particle burst from a point, for impacts and reveals. */
export const Burst: React.FC<{
  t: number;
  t0: number;
  x: number;
  y: number;
  count?: number;
  radius?: number;
  color?: string;
  seed?: number;
  dur?: number;
}> = ({ t, t0, x, y, count = 28, radius = 260, color = COLORS.yellow, seed = 3, dur = 0.8 }) => {
  if (t < t0 || t > t0 + dur) return null;
  const p = prog(t, t0, t0 + dur, ease.out);
  return (
    <svg width={2} height={2} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + rand(seed + i) * 0.4;
        const d = radius * (0.5 + 0.5 * rand(seed * 2 + i)) * p;
        const r = (2 + rand(seed * 3 + i) * 5) * (1 - p * 0.6);
        return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={r} fill={color} opacity={1 - p} />;
      })}
      <circle cx={0} cy={0} r={radius * 0.5 * p} fill="none" stroke={color} strokeWidth={4 * (1 - p)} opacity={1 - p} />
    </svg>
  );
};

/**
 * Digital glitch: for `dur` seconds from t0 the children are sliced into bands that jump sideways,
 * with red/cyan ghost copies. Outside that window the children render normally.
 */
export const Glitch: React.FC<{ t: number; t0: number; dur?: number; strength?: number; seed?: number; children: React.ReactNode }> = ({
  t,
  t0,
  dur = 0.3,
  strength = 1,
  seed = 1,
  children,
}) => {
  if (t < t0 || t > t0 + dur) return <>{children}</>;
  const p = (t - t0) / dur;
  const k = Math.sin(Math.PI * p) * strength;
  const f = Math.floor(t * FPS);
  const bands = 7;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${-14 * k}px)`, opacity: 0.55, mixBlendMode: "screen", filter: "sepia(1) saturate(6) hue-rotate(-50deg)" }}>
        {children}
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${14 * k}px)`, opacity: 0.55, mixBlendMode: "screen", filter: "sepia(1) saturate(6) hue-rotate(140deg)" }}>
        {children}
      </div>
      {Array.from({ length: bands }, (_, i) => {
        const top = (i / bands) * 100;
        const bottom = 100 - ((i + 1) / bands) * 100;
        const off = (rand(seed * 17 + i * 3 + f) - 0.5) * 90 * k * (rand(seed + i + f * 0.7) > 0.45 ? 1 : 0.15);
        return (
          <div key={i} style={{ position: "absolute", inset: 0, clipPath: `inset(${top}% 0 ${bottom}% 0)`, transform: `translateX(${off}px)` }}>
            {children}
          </div>
        );
      })}
    </>
  );
};
