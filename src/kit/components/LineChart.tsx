import React from "react";
import { COLORS, FONTS } from "../theme";

export type Series = {
  id: string;
  pts: [number, number][];
  color: string;
  /** how far along x the line is drawn, in x units */
  upto: number;
  width?: number;
  /** let the line escape the plot box (for blow-ups) */
  unclipped?: boolean;
  /** for unclipped lines: screen y where the escaped part is fully gone, and where it is fully drawn */
  fadeTop?: [number, number];
  opacity?: number;
  label?: string;
};

/**
 * Line chart with glowing lines and heads. Lines are drawn up to `upto` (in x units) with
 * linear interpolation, so a series can be "played" over time.
 */
export const LineChart: React.FC<{
  id: string;
  box: { x: number; y: number; w: number; h: number };
  xDomain: [number, number];
  yDomain: [number, number];
  series: Series[];
  xLabel?: React.ReactNode;
  yLabel?: React.ReactNode;
  xTicks?: number[];
  yTicks?: number[];
  axisOpacity?: number;
}> = ({ id, box, xDomain, yDomain, series, xLabel, yLabel, xTicks = [], yTicks = [], axisOpacity = 1 }) => {
  const sx = (v: number) => box.x + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * box.w;
  const sy = (v: number) => box.y + box.h - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * box.h;
  const cut = (s: Series) => {
    const out: [number, number][] = [];
    for (let i = 0; i < s.pts.length; i++) {
      const [x, y] = s.pts[i];
      if (x <= s.upto) out.push([x, y]);
      else {
        if (i > 0) {
          const [x0, y0] = s.pts[i - 1];
          const p = (s.upto - x0) / (x - x0);
          if (p > 0) out.push([s.upto, y0 + (y - y0) * p]);
        }
        break;
      }
    }
    return out;
  };
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} />
        </clipPath>
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <g opacity={axisOpacity}>
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={box.x} x2={box.x + box.w} y1={sy(v)} y2={sy(v)} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
            <text x={box.x - 16} y={sy(v) + 9} textAnchor="end" fontFamily={FONTS.mono} fontSize={26} fill={COLORS.grey}>
              {v}
            </text>
          </g>
        ))}
        {xTicks.map((v) => (
          <text key={`x${v}`} x={sx(v)} y={box.y + box.h + 40} textAnchor="middle" fontFamily={FONTS.mono} fontSize={26} fill={COLORS.grey}>
            {v}
          </text>
        ))}
        <line x1={box.x} x2={box.x + box.w} y1={box.y + box.h} y2={box.y + box.h} stroke={COLORS.grey} strokeWidth={3} />
        <line x1={box.x} x2={box.x} y1={box.y} y2={box.y + box.h} stroke={COLORS.grey} strokeWidth={3} />
      </g>
      {series.map((s) => {
        const pts = cut(s);
        if (pts.length < 2) return null;
        const d = pts.map(([x, y], i) => `${i ? "L" : "M"} ${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(" ");
        const [hx, hy] = pts[pts.length - 1];
        const clip = s.unclipped ? undefined : `url(#${id}-clip)`;
        const fadeId = `${id}-${s.id}-fade`;
        return (
          <g key={s.id} opacity={s.opacity ?? 1} mask={s.fadeTop ? `url(#${fadeId})` : undefined}>
            {s.fadeTop ? (
              <defs>
                <linearGradient id={`${fadeId}-g`} gradientUnits="userSpaceOnUse" x1={0} x2={0} y1={s.fadeTop[0]} y2={s.fadeTop[1]}>
                  <stop offset="0" stopColor="#fff" stopOpacity={0} />
                  <stop offset="1" stopColor="#fff" stopOpacity={1} />
                </linearGradient>
                <mask id={fadeId} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
                  <rect x={0} y={0} width={1080} height={1920} fill={`url(#${fadeId}-g)`} />
                </mask>
              </defs>
            ) : null}
            <g clipPath={clip}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={(s.width ?? 7) * 2.6} opacity={0.35} filter={`url(#${id}-glow)`} strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} fill="none" stroke={s.color} strokeWidth={s.width ?? 7} strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {s.unclipped || (sy(hy) >= box.y && sy(hy) <= box.y + box.h) ? (
              <>
                <circle cx={sx(hx)} cy={sy(hy)} r={16} fill={s.color} opacity={0.5} filter={`url(#${id}-glow)`} />
                <circle cx={sx(hx)} cy={sy(hy)} r={9} fill={s.color} stroke={COLORS.bg} strokeWidth={3} />
              </>
            ) : null}
          </g>
        );
      })}
      {yLabel ? (
        <text x={box.x} y={box.y - 26} fontFamily={FONTS.mono} fontWeight={700} fontSize={28} fill={COLORS.text} opacity={axisOpacity}>
          {yLabel}
        </text>
      ) : null}
      {xLabel ? (
        <text x={box.x + box.w} y={box.y + box.h + 84} textAnchor="end" fontFamily={FONTS.mono} fontWeight={700} fontSize={28} fill={COLORS.text} opacity={axisOpacity}>
          {xLabel}
        </text>
      ) : null}
    </svg>
  );
};
