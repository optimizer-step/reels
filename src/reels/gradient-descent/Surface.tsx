import React from "react";
import { COLORS, FONTS, clamp01, ease, lerp, prog } from "../../kit";
import { loss, OPTIMUM, OVERSIZED, STEADY, STEPS, RATES, type Point } from "./math";
import { FIRST_STEP_AT, SECONDS_PER_STEP } from "./timeline";

// A raised quadratic bowl, projected to a tilted 2.5D plane. Every vertex height
// is the real loss at that parameter pair, including the animated training points.
export const project = (w: number, b: number) => {
  const x = w - OPTIMUM.w;
  const z = b - OPTIMUM.b;
  const y = loss(w, b);
  return { x: 500 + x * 72 - z * 55, y: 995 + x * 15 + z * 48 - y * 8.5 };
};
const pathFor = (ps: { x: number; y: number }[]) =>
  ps.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(2) + " " + p.y.toFixed(2)).join(" ");

const surfaceLines = () => {
  const lines: string[] = [];
  // The mesh is generated from the SAME loss function as the two trajectories.
  const minX = -3.6, maxX = 3.6, minZ = -2.5, maxZ = 2.5;
  for (let i = 0; i <= 18; i++) {
    const dx = minX + (maxX - minX) * i / 18;
    lines.push(pathFor(Array.from({ length: 41 }, (_, j) =>
      project(OPTIMUM.w + dx, OPTIMUM.b + minZ + (maxZ - minZ) * j / 40))));
  }
  for (let i = 0; i <= 14; i++) {
    const dz = minZ + (maxZ - minZ) * i / 14;
    lines.push(pathFor(Array.from({ length: 41 }, (_, j) =>
      project(OPTIMUM.w + minX + (maxX - minX) * j / 40, OPTIMUM.b + dz))));
  }
  return lines;
};
const GRID = surfaceLines();
const CONTOURS = [0.8, 1.5, 2.25, 3.05].map((radius) => ({
  radius,
  // Quadratic isocontours: every point has the same true loss, radius².
  path: pathFor(Array.from({ length: 129 }, (_, i) => {
    const a = i / 128 * 2 * Math.PI;
    return project(OPTIMUM.w + radius * Math.cos(a), OPTIMUM.b + radius * Math.sin(a));
  })),
}));


const progressAt = (t: number) =>
  clamp01((t - FIRST_STEP_AT) / (SECONDS_PER_STEP * STEPS)) * STEPS;

const sampled = (points: Point[], elapsedSteps: number) => {
  const n = Math.min(STEPS - 1, Math.floor(elapsedSteps));
  const p = ease.inOut(clamp01(elapsedSteps - n));
  const a = points[n], b = points[n + 1];
  return { w: lerp(a.w, b.w, p), b: lerp(a.b, b.b, p) };
};
const Trace: React.FC<{ t: number; points: Point[]; color: string; id: string }> =
  ({ t, points, color, id }) => {
    const steps = progressAt(t);
    const count = Math.min(STEPS, Math.floor(steps));
    const current = sampled(points, steps);
    const history = [...points.slice(0, count + 1), current].map((p) => project(p.w, p.b));
    const at = project(current.w, current.b);
    const opacity = prog(t, 8.8, 9.7);
    return (
      <g opacity={opacity}>
        <path d={pathFor(history)} fill="none" stroke={color} strokeWidth={18} opacity={0.22} filter="url(#gd-blur)" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathFor(history)} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        {points.slice(0, count + 1).map((p, i) => {
          const xy = project(p.w, p.b);
          return <circle key={id + i} cx={xy.x} cy={xy.y} r={4.2} fill={color} opacity={0.45 + i / (STEPS * 2)} />;
        })}
        <circle cx={at.x} cy={at.y} r={24} stroke={color} strokeWidth={2.6} fill="none" opacity={0.45 + 0.25 * Math.sin(t * 4)} />
        <circle cx={at.x} cy={at.y} r={18} fill={color} opacity={0.23} filter="url(#gd-blur)" />
        <circle cx={at.x} cy={at.y} r={9} fill={color} stroke={COLORS.bg} strokeWidth={3} />
      </g>
    );
  };

const Info: React.FC<{ t: number; label: string; color: string; rate: number; points: Point[]; x: number }> =
  ({ t, label, color, rate, points, x }) => {
    const completed = Math.min(STEPS, Math.floor(progressAt(t)));
    const value = points[completed].loss.toFixed(3);
    const o = prog(t, 8.7, 9.6);
    return (
      <g opacity={o}>
        <rect x={x} y={1170} width={420} height={144} rx={22} fill="#15151E" stroke={color} strokeWidth={2} strokeOpacity={0.65} />
        <rect x={x + 20} y={1189} width={11} height={11} rx={5.5} fill={color} />
        <text x={x + 42} y={1201} fill={color} fontSize={27} fontFamily={FONTS.mono} fontWeight={700}>{label}</text>
        <text x={x + 20} y={1247} fill={COLORS.text} fontSize={38} fontFamily={FONTS.head} fontWeight={700}>{"LR = " + rate.toFixed(2)}</text>
        <text x={x + 20} y={1289} fill={COLORS.grey} fontFamily={FONTS.mono} fontSize={23}>{"STEP " + completed + "  LOSS " + value}</text>
      </g>
    );
  };

export const Surface: React.FC<{ t: number }> = ({ t }) => {
  const enter = prog(t, 3.1, 4.4);
  const fade = 1 - prog(t, 30.8, 32.1);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity: enter * fade }}>
      <defs>
        <filter id="gd-blur" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <radialGradient id="gd-pool">
          <stop offset="0%" stopColor={COLORS.yellow} stopOpacity="0.13" />
          <stop offset="100%" stopColor={COLORS.yellow} stopOpacity="0" />
        </radialGradient>
        <clipPath id="gd-view"><rect x={48} y={525} width={900} height={590} /></clipPath>
      </defs>
      <ellipse cx={500} cy={925} rx={390} ry={280} fill="url(#gd-pool)" opacity={0.85} />
      <g clipPath="url(#gd-view)">

        {GRID.map((d, i) => (
          <path key={i} d={d} stroke={i % 3 === 0 ? "#68606A" : "#363640"}
            strokeWidth={i % 3 === 0 ? 2.1 : 1.2}
            opacity={0.64 * prog(t, 3.35 + i * 0.017, 5.0 + i * 0.017)}
            fill="none" />
        ))}
        {CONTOURS.map(({ radius, path }, i) => (
          <g key={radius} opacity={prog(t, 4.4 + i * 0.19, 5.8 + i * 0.19)}>
            <path d={path} stroke={i % 2 ? COLORS.blue : COLORS.yellow} strokeWidth={12}
              opacity={0.11} filter="url(#gd-blur)" fill="none" />
            <path d={path} stroke={i % 2 ? COLORS.blue : COLORS.yellow}
              strokeWidth={2.5} strokeDasharray={i % 2 ? "4 11" : undefined} opacity={0.35 - i * 0.035}
              fill="none" />
          </g>
        ))}

        <Trace t={t} id="steady" points={STEADY} color={COLORS.blue} />
        <Trace t={t} id="large" points={OVERSIZED} color={COLORS.red} />
        <circle cx={500} cy={995} r={10} fill={COLORS.yellow} />
        <circle cx={500} cy={995} r={27} fill="none" stroke={COLORS.yellow} strokeWidth={2} strokeOpacity={0.6} />
      </g>
      <text x={500} y={1100} textAnchor="middle" fill={COLORS.grey} fontFamily={FONTS.mono} fontSize={26} letterSpacing={3}>{"MINIMUM LOSS  •  L = 0"}</text>
      <Info t={t} label="STEADY" color={COLORS.blue} rate={RATES.steady} points={STEADY} x={60} />
      <Info t={t} label="TOO LARGE" color={COLORS.red} rate={RATES.oversized} points={OVERSIZED} x={510} />
    </svg>
  );
};
