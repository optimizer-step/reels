import React from "react";
import { Burst, COLORS, Space3D, ease, lerp, project, prog, springAt, type P3, type Point3D, type View3D } from "../../../kit";
import { copy } from "../copy";
import { BANK_A, BANK_B, BANK_START, MONEY_C, MONEY_WORDS, OTHER_WORDS, RIVER_C, RIVER_WORDS } from "../data";
import { CUES } from "../timeline";

const C = CUES.space;
// squeeze the space horizontally so clusters and their labels stay inside the safe zone
const fit = (p: P3): P3 => [p[0] * 0.8, p[1], p[2]];
const B0 = fit(BANK_START);
const BA = fit(BANK_A);
const BB = fit(BANK_B);

const mix3 = (a: P3, b: P3, p: number): P3 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
/** Curved flight between two 3D points (arcs upward). */
const flightPos = (a: P3, b: P3, p: number): P3 => {
  const m = mix3(a, b, p);
  return [m[0], m[1] + Math.sin(Math.PI * p) * 0.45, m[2] + Math.sin(Math.PI * p) * 0.25];
};
const trail = (a: P3, b: P3, p: number): P3[] => Array.from({ length: 24 }, (_, i) => flightPos(a, b, (p * i) / 23));

export const spaceView = (t: number): View3D => {
  const enter = prog(t, C.reveal, C.reveal + 1.6, ease.out);
  return {
    yaw: lerp(-1.05, -0.32, enter) + 0.05 * (t - C.reveal),
    pitch: lerp(0.55, 0.3, enter),
    dist: lerp(8.5, 6.2, enter),
    focal: 1420,
    cx: 500,
    cy: 940,
  };
};

/** Screen-space 3D meaning space: clusters of related words, and "bank" flying to each sense. */
export const MeaningSpace: React.FC<{ t: number }> = ({ t }) => {
  const appear = prog(t, C.reveal, C.reveal + 1.0, ease.out);
  const gone = prog(t, CUES.heatmap.cut, CUES.heatmap.cut + 0.12);
  const opacity = appear * (1 - gone);
  if (opacity <= 0.001) return null;
  const view = spaceView(t);

  const pA = prog(t, C.flyA[0], C.flyA[1], ease.inOut);
  const pB = prog(t, C.flyB[0], C.flyB[1], ease.inOut);
  const posA = t >= C.flyA[0] ? flightPos(B0, BA, pA) : B0;
  const posB = t >= C.flyB[0] ? flightPos(B0, BB, pB) : B0;
  const sA = springAt(t, C.bankA);
  const sB = springAt(t, C.bankB);
  const ringA = t >= C.flyA[1] ? prog(t, C.flyA[1], C.flyA[1] + 0.8) : 0;
  const ringB = t >= C.flyB[1] ? prog(t, C.flyB[1], C.flyB[1] + 0.8) : 0;

  const wordPts = (list: [string, P3][], color: string, k: number): Point3D[] =>
    list.map(([w, p], i) => ({
      id: w,
      p: fit(p),
      color,
      r: 0.055,
      label: w,
      labelPriority: 5 - i * 0.1,
      labelSize: 0.13,
      opacity: prog(t, C.reveal + 0.3 + k * 0.25 + i * 0.05, C.reveal + 0.7 + k * 0.25 + i * 0.05),
      glow: 0.6,
    }));

  const points: Point3D[] = [
    ...wordPts(MONEY_WORDS, COLORS.yellow, 0),
    ...wordPts(RIVER_WORDS, COLORS.blue, 1),
    ...OTHER_WORDS.map(([w, p], i) => ({
      id: w,
      p: fit(p),
      color: COLORS.grey,
      r: 0.04,
      label: w,
      labelPriority: 1,
      labelSize: 0.1,
      opacity: 0.75 * prog(t, C.reveal + 0.8 + i * 0.05, C.reveal + 1.2 + i * 0.05),
    })),
  ];
  if (sA > 0) {
    points.push({
      id: "bankA",
      p: posA,
      color: pA > 0.5 ? COLORS.yellow : COLORS.text,
      r: 0.1 * sA,
      label: "bank",
      labelPriority: 10,
      labelSize: 0.2,
      labelColor: COLORS.text,
      glow: 1,
      ring: ringA > 0 && ringA < 1 ? ringA : undefined,
      bold: true,
    });
  }
  if (sB > 0) {
    points.push({
      id: "bankB",
      p: posB,
      color: pB > 0.5 ? COLORS.blue : COLORS.text,
      r: 0.1 * sB,
      label: "bank",
      labelPriority: 10,
      labelSize: 0.2,
      labelColor: COLORS.text,
      glow: 1,
      ring: ringB > 0 && ringB < 1 ? ringB : undefined,
      bold: true,
    });
  }

  const linkP = prog(t, C.link, C.link + 0.6, ease.inOut);
  const links = linkP > 0 ? [{ a: BA, b: mix3(BA, BB, linkP), color: COLORS.text, opacity: 0.7, width: 3, dash: "10 10" }] : [];

  // cluster halos (screen-space circles around each cluster centre)
  const halo = (c: P3, color: string, label: string, k: number) => {
    const s = project(c, view);
    const r = 0.82 * s.k;
    const o = prog(t, C.reveal + 0.9 + k * 0.25, C.reveal + 1.4 + k * 0.25);
    return (
      <g key={label} opacity={o}>
        <circle cx={s.x} cy={s.y} r={r} fill={color} opacity={0.07} />
        <circle cx={s.x} cy={s.y} r={r} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray="6 10" opacity={0.6} />
        <text x={s.x} y={s.y - r - 16} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={30} fill={color} letterSpacing="2">
          {label}
        </text>
      </g>
    );
  };

  const arriveA = project(BA, view);
  const arriveB = project(BB, view);

  return (
    <div style={{ position: "absolute", inset: 0, opacity, transform: `scale(${0.88 + 0.12 * appear})`, transformOrigin: "500px 940px" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {halo(fit(MONEY_C), COLORS.yellow, copy.space.moneyCluster, 0)}
        {halo(fit(RIVER_C), COLORS.blue, copy.space.riverCluster, 1)}
      </svg>
      <Space3D
        id="meaning"
        view={view}
        points={points}
        declutter={14}
        links={links}
        trails={[
          ...(t >= C.flyA[0] ? [{ pts: trail(B0, BA, pA), color: COLORS.yellow, width: 5, opacity: 0.85 }] : []),
          ...(t >= C.flyB[0] ? [{ pts: trail(B0, BB, pB), color: COLORS.blue, width: 5, opacity: 0.85 }] : []),
        ]}
        floor={{ y: -1.3, extent: 2.6, step: 0.52, opacity: 0.4 }}
        fog={[4.4, 8.4]}
      />
      <Burst t={t} t0={C.flyA[1]} x={arriveA.x} y={arriveA.y} color={COLORS.yellow} radius={170} seed={5} />
      <Burst t={t} t0={C.flyB[1]} x={arriveB.x} y={arriveB.y} color={COLORS.blue} radius={170} seed={9} />
    </div>
  );
};
