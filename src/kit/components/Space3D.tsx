import React from "react";
import { COLORS, FONTS } from "../theme";

/**
 * Lightweight 3D scatter rendered as SVG (no WebGL): rotate, perspective-project, depth-sort,
 * fog and glow. Good for embedding spaces, clusters and "meaning space" shots.
 * World units are roughly -2..2 on each axis.
 */

export type P3 = [number, number, number];
export type Point3D = {
  id: string;
  p: P3;
  color: string;
  r?: number;
  label?: string;
  labelColor?: string;
  labelSize?: number;
  opacity?: number;
  glow?: number;
  ring?: number; // 0..1 pulse ring
  bold?: boolean;
};
export type View3D = { yaw: number; pitch: number; dist: number; focal: number; cx: number; cy: number };

export const project = (p: P3, v: View3D) => {
  const [x, y, z] = p;
  const cy = Math.cos(v.yaw);
  const sy = Math.sin(v.yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cp = Math.cos(v.pitch);
  const sp = Math.sin(v.pitch);
  const y2 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;
  const depth = z2 + v.dist;
  const k = v.focal / depth;
  return { x: v.cx + x1 * k, y: v.cy - y2 * k, depth, k };
};

export const Space3D: React.FC<{
  id: string;
  view: View3D;
  points: Point3D[];
  trails?: { pts: P3[]; color: string; width?: number; opacity?: number }[];
  links?: { a: P3; b: P3; color: string; opacity?: number; width?: number; dash?: string }[];
  floor?: { y: number; extent: number; step: number; opacity: number };
  fog?: [number, number];
  opacity?: number;
}> = ({ id, view, points, trails = [], links = [], floor, fog = [3, 7.5], opacity = 1 }) => {
  const fogAt = (d: number) => 1 - 0.75 * Math.min(1, Math.max(0, (d - fog[0]) / (fog[1] - fog[0])));
  const grid: React.ReactNode[] = [];
  if (floor) {
    const { y, extent: e, step } = floor;
    for (let g = -e; g <= e + 1e-6; g += step) {
      const a1 = project([g, y, -e], view);
      const b1 = project([g, y, e], view);
      const a2 = project([-e, y, g], view);
      const b2 = project([e, y, g], view);
      grid.push(<line key={`gx${g}`} x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} />);
      grid.push(<line key={`gz${g}`} x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} />);
    }
  }
  const proj = points.map((pt) => ({ pt, s: project(pt.p, view) })).sort((a, b) => b.s.depth - a.s.depth);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity, overflow: "visible" }}>
      <defs>
        <filter id={`${id}-glow`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <radialGradient id={`${id}-floorfade`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-floormask`}>
          <rect width="1080" height="1920" fill={`url(#${id}-floorfade)`} />
        </mask>
      </defs>
      {floor ? (
        <g stroke={COLORS.grey} strokeWidth={1.4} opacity={floor.opacity} mask={`url(#${id}-floormask)`}>
          {grid}
        </g>
      ) : null}
      {links.map((l, i) => {
        const a = project(l.a, view);
        const b = project(l.b, view);
        return (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={l.color} strokeWidth={l.width ?? 2} opacity={l.opacity ?? 0.5} strokeDasharray={l.dash} strokeLinecap="round" />
        );
      })}
      {trails.map((tr, i) => {
        if (tr.pts.length < 2) return null;
        const pts = tr.pts.map((p) => project(p, view));
        return (
          <g key={i}>
            <polyline points={pts.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ")} fill="none" stroke={tr.color} strokeWidth={(tr.width ?? 6) * 2.4} opacity={(tr.opacity ?? 0.8) * 0.35} filter={`url(#${id}-glow)`} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={pts.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ")} fill="none" stroke={tr.color} strokeWidth={tr.width ?? 6} opacity={tr.opacity ?? 0.8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      {proj.map(({ pt, s }) => {
        const f = fogAt(s.depth);
        const r = (pt.r ?? 0.05) * s.k;
        const o = (pt.opacity ?? 1) * f;
        if (o <= 0.01) return null;
        const ls = (pt.labelSize ?? 0.11) * s.k;
        return (
          <g key={pt.id} opacity={o}>
            {pt.glow ? <circle cx={s.x} cy={s.y} r={r * 2.4} fill={pt.color} opacity={pt.glow * 0.7} filter={`url(#${id}-glow)`} /> : null}
            {pt.ring ? <circle cx={s.x} cy={s.y} r={r * (1.6 + pt.ring * 2.2)} fill="none" stroke={pt.color} strokeWidth={3} opacity={1 - pt.ring} /> : null}
            <circle cx={s.x} cy={s.y} r={r} fill={pt.color} />
            {pt.label ? (
              <text
                x={s.x + r + ls * 0.35}
                y={s.y + ls * 0.36}
                fontFamily={FONTS.mono}
                fontWeight={pt.bold ? 700 : 500}
                fontSize={ls}
                fill={pt.labelColor ?? pt.color}
                style={{ paintOrder: "stroke" }}
                stroke={COLORS.bg}
                strokeWidth={ls * 0.18}
              >
                {pt.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};
