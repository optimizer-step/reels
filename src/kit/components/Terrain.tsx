import React from "react";

/**
 * Shaded 3D surface (e.g. a loss landscape) rendered as SVG with a painter's algorithm:
 * lit quads coloured by height, a fine wireframe and contour lines, all depth-correct.
 * World axes: x right, y up, z depth. `fn(x, z)` returns the surface height y.
 */

export type V3 = [number, number, number];
export type OrbitCam = {
  target: V3;
  yaw: number; // radians, orbit around the target
  pitch: number; // radians above the horizon
  dist: number;
  focal: number;
  cx: number; // screen point the target projects to
  cy: number;
};
export type Projected = { x: number; y: number; depth: number; k: number };

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export const makeProjector = (cam: OrbitCam) => {
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const C: V3 = [cam.target[0] + cam.dist * cp * Math.sin(cam.yaw), cam.target[1] + cam.dist * sp, cam.target[2] - cam.dist * cp * Math.cos(cam.yaw)];
  const f = norm(sub(cam.target, C));
  const r = norm([f[2], 0, -f[0]]);
  const u = cross(f, r);
  const project = (p: V3): Projected => {
    const v = sub(p, C);
    const zc = Math.max(0.05, dot(v, f));
    const k = cam.focal / zc;
    return { x: cam.cx + dot(v, r) * k, y: cam.cy - dot(v, u) * k, depth: zc, k };
  };
  return { project, eye: C, forward: f };
};

/** Blend between a list of [stop, [r,g,b]] colour stops. */
export const ramp = (stops: [number, number[]][], v: number) => {
  if (v <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const [a, ca] = stops[i - 1];
      const [b, cb] = stops[i];
      const p = (v - a) / (b - a);
      return ca.map((c, k) => c + (cb[k] - c) * p);
    }
  }
  return stops[stops.length - 1][1];
};

export type TerrainProps = {
  fn: (x: number, z: number) => number;
  xRange: [number, number];
  zRange: [number, number];
  nx: number;
  nz: number;
  cam: OrbitCam;
  /** height that maps to the top of the colour ramp */
  hMax: number;
  colors: [number, number[]][];
  light?: V3;
  ambient?: number;
  /** draw every n-th grid line as wireframe */
  wireEvery?: number;
  wireOpacity?: number;
  contours?: { level: number; color: string; width?: number; opacity?: number }[];
  /** 0..1 reveal: rows appear from far to near */
  reveal?: number;
  opacity?: number;
  /** atmospheric fog: colour mixes toward fogColor between these camera depths */
  fog?: [number, number];
  fogColor?: number[];
  /** specular highlight strength (0 = matte) */
  specular?: number;
};

type Seg = [number, number, number, number]; // x1,z1,x2,z2

/** Marching squares for one cell at a given level; corners in order (0,0),(1,0),(1,1),(0,1). */
const cellContour = (xs: number[], zs: number[], hs: number[], level: number): Seg[] => {
  const idx = (hs[0] > level ? 1 : 0) | (hs[1] > level ? 2 : 0) | (hs[2] > level ? 4 : 0) | (hs[3] > level ? 8 : 0);
  if (idx === 0 || idx === 15) return [];
  const edge = (a: number, b: number): [number, number] => {
    const p = (level - hs[a]) / (hs[b] - hs[a] || 1e-9);
    return [xs[a] + (xs[b] - xs[a]) * p, zs[a] + (zs[b] - zs[a]) * p];
  };
  // edges: e0 = 0-1, e1 = 1-2, e2 = 2-3, e3 = 3-0
  const E = [() => edge(0, 1), () => edge(1, 2), () => edge(2, 3), () => edge(3, 0)];
  const table: Record<number, [number, number][]> = {
    1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 0], [1, 2]], 6: [[0, 2]], 7: [[3, 2]],
    8: [[2, 3]], 9: [[2, 0]], 10: [[0, 1], [2, 3]], 11: [[2, 1]], 12: [[1, 3]], 13: [[1, 0]], 14: [[0, 3]],
  };
  return (table[idx] ?? []).map(([a, b]) => {
    const p = E[a]();
    const q = E[b]();
    return [p[0], p[1], q[0], q[1]] as Seg;
  });
};

export const Terrain: React.FC<TerrainProps> = ({
  fn,
  xRange,
  zRange,
  nx,
  nz,
  cam,
  hMax,
  colors,
  light = [-0.45, 1, -0.35],
  ambient = 0.34,
  wireEvery = 2,
  wireOpacity = 0.07,
  contours = [],
  reveal = 1,
  opacity = 1,
  fog,
  fogColor = [11, 11, 15],
  specular = 0.35,
}) => {
  const { project, forward } = makeProjector(cam);
  const L = norm(light);
  const xs = Array.from({ length: nx + 1 }, (_, i) => xRange[0] + ((xRange[1] - xRange[0]) * i) / nx);
  const zs = Array.from({ length: nz + 1 }, (_, j) => zRange[0] + ((zRange[1] - zRange[0]) * j) / nz);
  const H = xs.map((x) => zs.map((z) => fn(x, z)));
  const P = xs.map((x, i) => zs.map((z, j) => project([x, H[i][j], z])));

  type Quad = { i: number; j: number; depth: number };
  const quads: Quad[] = [];
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      // reveal sweeps from far rows (high z) to near rows
      if (reveal < 1 && j / nz < 1 - reveal) continue;
      const depth = (P[i][j].depth + P[i + 1][j].depth + P[i + 1][j + 1].depth + P[i][j + 1].depth) / 4;
      quads.push({ i, j, depth });
    }
  }
  quads.sort((a, b) => b.depth - a.depth);

  const pt = (p: Projected) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;

  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}>
      {quads.map(({ i, j }) => {
        const p00 = P[i][j];
        const p10 = P[i + 1][j];
        const p11 = P[i + 1][j + 1];
        const p01 = P[i][j + 1];
        const a: V3 = [xs[i + 1] - xs[i], H[i + 1][j] - H[i][j], 0];
        const b: V3 = [0, H[i][j + 1] - H[i][j], zs[j + 1] - zs[j]];
        let n = norm(cross(b, a));
        if (n[1] < 0) n = [-n[0], -n[1], -n[2]];
        const diff = Math.max(0, dot(n, L));
        const facing = Math.max(0, -dot(n, forward));
        const hAvg = (H[i][j] + H[i + 1][j] + H[i + 1][j + 1] + H[i][j + 1]) / 4;
        const base = ramp(colors, Math.min(1, Math.max(0, hAvg / hMax)));
        const shade = ambient + 0.78 * diff + 0.12 * facing;
        // Blinn-style highlight toward the camera
        const hv = norm([L[0] - forward[0], L[1] - forward[1], L[2] - forward[2]]);
        const spec = specular * Math.pow(Math.max(0, dot(n, hv)), 24);
        let rgb = base.map((c) => Math.min(255, c * shade + 255 * spec));
        if (fog) {
          const d = (P[i][j].depth + P[i + 1][j + 1].depth) / 2;
          const fp = Math.min(1, Math.max(0, (d - fog[0]) / (fog[1] - fog[0])));
          rgb = rgb.map((c, k) => c + (fogColor[k] - c) * fp * fp);
        }
        rgb = rgb.map((c) => Math.round(c));
        const fill = `rgb(${rgb.join(",")})`;
        const wire: string[] = [];
        if (i % wireEvery === 0) wire.push(`M ${pt(p00)} L ${pt(p01)}`);
        if (j % wireEvery === 0) wire.push(`M ${pt(p00)} L ${pt(p10)}`);
        const segs: React.ReactNode[] = [];
        contours.forEach((c, ci) => {
          const s = cellContour([xs[i], xs[i + 1], xs[i + 1], xs[i]], [zs[j], zs[j], zs[j + 1], zs[j + 1]], [H[i][j], H[i + 1][j], H[i + 1][j + 1], H[i][j + 1]], c.level);
          s.forEach((sg, k) => {
            const q1 = project([sg[0], c.level + 0.004, sg[1]]);
            const q2 = project([sg[2], c.level + 0.004, sg[3]]);
            segs.push(
              <line key={`${ci}-${k}`} x1={q1.x} y1={q1.y} x2={q2.x} y2={q2.y} stroke={c.color} strokeWidth={c.width ?? 2} opacity={c.opacity ?? 0.8} strokeLinecap="round" />,
            );
          });
        });
        return (
          <g key={`${i}-${j}`}>
            <polygon points={`${pt(p00)} ${pt(p10)} ${pt(p11)} ${pt(p01)}`} fill={fill} stroke={fill} strokeWidth={1.1} strokeLinejoin="round" />
            {wire.length ? <path d={wire.join(" ")} stroke="#fff" strokeWidth={1} opacity={wireOpacity} fill="none" /> : null}
            {segs}
          </g>
        );
      })}
    </svg>
  );
};
