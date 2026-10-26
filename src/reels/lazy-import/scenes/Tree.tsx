import React from "react";
import { COLORS, FONTS, clamp01, rand } from "../../../kit";
import data from "../modules.json";

/**
 * A real import tree (parsed from `python -X importtime`) drawn as a radial dendrogram.
 * Nodes are in breadth-first order, so "grow" reveals the import cascade from the root outwards.
 */
export type TreeKey = "pandas" | "matplotlib.pyplot" | "requests" | "argparse";
type Raw = { name: string[]; parent: number[]; depth: number[]; ms: number };

type Layout = { n: number; x: number[]; y: number[]; parent: number[]; depth: number[]; name: string[]; big: number[]; leaves: number[] };

const layouts = new Map<TreeKey, Layout>();

/** Unit-disc layout: each subtree gets an angular wedge proportional to its leaf count. */
const layout = (key: TreeKey): Layout => {
  const hit = layouts.get(key);
  if (hit) return hit;
  const raw = (data.trees as Record<string, Raw>)[key];
  const n = raw.name.length;
  const kids: number[][] = Array.from({ length: n }, () => []);
  for (let i = 1; i < n; i++) kids[raw.parent[i]].push(i);
  const leaves = new Array(n).fill(0);
  const size = new Array(n).fill(1);
  for (let i = n - 1; i >= 0; i--) {
    if (!kids[i].length) leaves[i] = 1;
    else for (const c of kids[i]) leaves[i] += leaves[c];
    if (i > 0) size[raw.parent[i]] += size[i];
  }
  const a0 = new Array(n).fill(0);
  const a1 = new Array(n).fill(0);
  a0[0] = -Math.PI / 2;
  a1[0] = a0[0] + Math.PI * 2;
  const x = new Array(n).fill(0);
  const y = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    // children share the parent's wedge by (softened) leaf count
    let cur = a0[i];
    const w = kids[i].map((c) => Math.pow(leaves[c], 0.8));
    const tot = w.reduce((s, v) => s + v, 0) || 1;
    kids[i].forEach((c, k) => {
      const span = ((a1[i] - a0[i]) * w[k]) / tot;
      a0[c] = cur;
      a1[c] = cur + span;
      cur += span;
    });
    if (i > 0) {
      const d = raw.depth[i];
      const r = 1 - Math.exp(-d / 5.5);
      const a = (a0[i] + a1[i]) / 2 + (rand(i * 13.7 + n) - 0.5) * Math.min(0.08, (a1[i] - a0[i]) * 0.4);
      x[i] = r * Math.cos(a);
      y[i] = r * Math.sin(a);
    }
  }
  const big = kids[0]
    .slice()
    .sort((p, q) => size[q] - size[p])
    .slice(0, 3);
  const out = { n, x, y, parent: raw.parent, depth: raw.depth, name: raw.name, big, leaves };
  layouts.set(key, out);
  return out;
};

export const treeSize = (key: TreeKey) => layout(key).n;

/** How many nodes are visible at grow progress p (0..1). */
export const grownCount = (key: TreeKey, p: number) => Math.round(clamp01(p) * layout(key).n);

export const ModuleTree: React.FC<{
  id: string;
  tree: TreeKey;
  cx: number;
  cy: number;
  r: number;
  /** 0..1 share of nodes revealed (breadth-first) */
  grow: number;
  color: string;
  opacity?: number;
  /** 0..1: drain colour to grey (unused code) */
  grey?: number;
  /** 0..1: every node slides into the root and fades (the import becomes a token) */
  collapse?: number;
  rotate?: number;
  labels?: number;
  t: number;
}> = ({ id, tree, cx, cy, r, grow, color, opacity = 1, grey = 0, collapse = 0, rotate = 0, labels = 0, t }) => {
  if (opacity <= 0.001 || grow <= 0) return null;
  const L = layout(tree);
  const shown = grow * L.n;
  const window = Math.max(6, L.n * 0.06);
  const ca = Math.cos(rotate);
  const sa = Math.sin(rotate);
  const k = 1 - collapse;
  const U = (ux0: number, uy0: number) => {
    const ux = ux0 * ca - uy0 * sa;
    const uy = ux0 * sa + uy0 * ca;
    return [cx + ux * r * k, cy + uy * r * k];
  };
  const P = (i: number) => U(L.x[i], L.y[i]);
  const col = grey > 0 ? mixHex(color, COLORS.grey, grey) : color;
  const edges: string[] = [];
  const dots: React.ReactNode[] = [];
  for (let i = 1; i < L.n; i++) {
    const q = clamp01((shown - i) / window);
    if (q <= 0) break;
    const [x, y] = P(i);
    const pi = L.parent[i];
    const [px, py] = P(pi);
    // radial dendrogram edge: swing round at the parent's radius, then out to the child
    const rp = Math.hypot(L.x[pi], L.y[pi]);
    const ac = Math.atan2(L.y[i], L.x[i]);
    const [bx, by] = U(rp * Math.cos(ac), rp * Math.sin(ac));
    // grow along the curve: sample the quadratic at q
    const qx = (1 - q) * (1 - q) * px + 2 * (1 - q) * q * bx + q * q * x;
    const qy = (1 - q) * (1 - q) * py + 2 * (1 - q) * q * by + q * q * y;
    const cqx = (1 - q) * px + q * bx;
    const cqy = (1 - q) * py + q * by;
    const mx = qx;
    const my = qy;
    edges.push(`M${px.toFixed(1)} ${py.toFixed(1)}Q${cqx.toFixed(1)} ${cqy.toFixed(1)} ${qx.toFixed(1)} ${qy.toFixed(1)}`);
    if (q > 0.6) {
      const leaf = L.leaves[i] === 1;
      const tw = 0.75 + 0.25 * Math.sin(t * 3 + i);
      dots.push(<circle key={i} cx={mx} cy={my} r={(leaf ? 2.6 : 3.6) * (0.6 + 0.4 * q) * (r / 300 + 0.4)} fill={col} opacity={((q - 0.6) / 0.4) * tw} />);
    }
  }
  const rootR = Math.max(7, r * 0.045);
  const fadeAll = opacity * (1 - Math.max(0, collapse - 0.6) / 0.4);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: fadeAll }}>
      <defs>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>
      <g filter={`url(#${id}-glow)`} opacity={0.55}>
        <path d={edges.join("")} fill="none" stroke={col} strokeWidth={2.4} />
      </g>
      <path d={edges.join("")} fill="none" stroke={col} strokeWidth={1.3} opacity={0.55} />
      {dots}
      <circle cx={cx} cy={cy} r={rootR * 2.6} fill={col} opacity={0.25} filter={`url(#${id}-glow)`} />
      <circle cx={cx} cy={cy} r={rootR} fill={col} />
      {labels > 0.01
        ? L.big.map((b) => {
            const q = clamp01((shown - b) / window);
            if (q < 0.8) return null;
            const [x, y] = P(b);
            const right = x >= cx;
            return (
              <text
                key={b}
                x={x + (right ? 14 : -14)}
                y={y + 7}
                textAnchor={right ? "start" : "end"}
                fontFamily={FONTS.mono}
                fontWeight={700}
                fontSize={22}
                fill={COLORS.text}
                opacity={labels * (q - 0.8) * 5 * (1 - collapse)}
                style={{ paintOrder: "stroke" }}
                stroke={COLORS.bg}
                strokeWidth={5}
              >
                {L.name[b]}
              </text>
            );
          })
        : null}
    </svg>
  );
};

/** Linear mix of two #rrggbb colours. */
export const mixHex = (a: string, b: string, p: number) => {
  const h = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(h(a, i) + (h(b, i) - h(a, i)) * p));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
