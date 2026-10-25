import React from "react";
import { clamp01, ease, prog } from "../anim";
import { COLORS, FONTS } from "../theme";

/**
 * Attention beams: arcs from one token to the tokens it attends to. Width and glow scale with the
 * weight; particles flow along each arc toward the attending token (information flowing in).
 */

type Pt = { x: number; y: number };
const bez = (a: Pt, c: Pt, b: Pt, s: number): Pt => ({
  x: (1 - s) * (1 - s) * a.x + 2 * (1 - s) * s * c.x + s * s * b.x,
  y: (1 - s) * (1 - s) * a.y + 2 * (1 - s) * s * c.y + s * s * b.y,
});

export const AttentionBeams: React.FC<{
  id: string;
  t: number;
  from: Pt;
  targets: (Pt & { w: number })[];
  /** draw-on window */
  start: number;
  dur?: number;
  color?: string;
  /** show % labels for weights at or above this */
  labelMin?: number;
  particles?: boolean;
  out?: number;
}> = ({ id, t, from, targets, start, dur = 0.9, color = COLORS.yellow, labelMin = 0.2, particles = true, out = 0 }) => {
  if (t < start) return null;
  const order = targets.map((tg, i) => ({ tg, i })).sort((a, b) => Math.abs(a.tg.x - from.x) - Math.abs(b.tg.x - from.x));
  return (
    <svg width={4000} height={4000} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - out }}>
      <defs>
        <filter id={`${id}-g`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      {order.map(({ tg, i }, k) => {
        const d = prog(t, start + k * 0.06, start + k * 0.06 + dur, ease.inOut);
        const a = from;
        const b = tg;
        const span = Math.abs(b.x - a.x);
        const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - (70 + span * 0.42) };
        const path = `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
        const w = clamp01(tg.w);
        const width = 3 + w * 22;
        const op = 0.28 + 0.72 * w;
        // labels sit near the target end of each arc so neighbouring labels never stack
        const apex = bez(a, c, b, 0.8);
        const nP = particles ? Math.round(2 + w * 9) : 0;
        const lab = w >= labelMin ? prog(t, start + dur * 0.8 + k * 0.06, start + dur + 0.25 + k * 0.06, ease.out) : 0;
        return (
          <g key={i}>
            {w > 0.15 ? (
              <path d={path} fill="none" stroke={color} strokeWidth={width * 2.2} opacity={op * 0.45} filter={`url(#${id}-g)`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} strokeLinecap="round" />
            ) : null}
            <path d={path} fill="none" stroke={color} strokeWidth={width} opacity={op} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} strokeLinecap="round" />
            {d >= 1
              ? Array.from({ length: nP }, (_, j) => {
                  const s = 1 - ((((t - start) * (0.55 + w * 0.6) + j / nP) % 1) + 1) % 1;
                  const p = bez(a, c, b, s);
                  return <circle key={j} cx={p.x} cy={p.y} r={2.5 + w * 6} fill="#fff" opacity={0.85 * Math.sin(Math.PI * s)} />;
                })
              : null}
            <circle cx={b.x} cy={b.y} r={5 + w * 8} fill={color} opacity={op * d} />
            {lab > 0 ? (
              <g opacity={lab} transform={`translate(${apex.x}, ${apex.y - 30 - (1 - lab) * 12})`}>
                <rect x={-58} y={-34} width={116} height={50} rx={12} fill={COLORS.bg} stroke={color} strokeWidth={3} />
                <text x={0} y={2} textAnchor="middle" fontFamily={FONTS.mono} fontWeight={700} fontSize={32} fill={color}>
                  {Math.round(w * 100)}%
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};
