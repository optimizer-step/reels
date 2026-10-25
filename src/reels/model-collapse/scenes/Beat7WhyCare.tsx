import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, prog, rand, springAt } from "../../../kit/anim";
import { CURVE, heightAt, px } from "../../../kit/components/BellCurve";
import { sigmaAt } from "../CurveStage";
import { CurveStage } from "../CurveStage";
import { copy } from "../copy";
import { COLORS, FONTS } from "../../../kit/theme";
import { BEATS, CUES } from "../timeline";

const C = CUES.whyCare;
const BASS = 36.5;

// label box position (left or right aligned) and the point on the curve it points at (u, in original sigmas)
const LABELS = [
  { x: 60, y: 420, align: "left" as const, u: -2.05, dissolveAt: 37.6 },
  { x: 940, y: 566, align: "right" as const, u: 1.9, dissolveAt: 37.1 },
  { x: 940, y: 712, align: "right" as const, u: 2.85, dissolveAt: 36.6 },
];

export const Beat7WhyCare: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const sigma = sigmaAt(t);
  const black = prog(t, C.blackout, BEATS.whyCare.end, ease.inOut);
  const shake = 1 - prog(t, BASS, BASS + 0.45, ease.out);
  const sx = t >= BASS ? (rand(frame * 3.3) - 0.5) * 26 * shake : 0;
  const sy = t >= BASS ? (rand(frame * 7.1) - 0.5) * 20 * shake : 0;
  const flash = t >= BASS ? (1 - prog(t, BASS, BASS + 0.25)) * 0.18 : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
      <CurveStage t={t} draw={1} fill={1 - black} labels={1 - black} axis={1 - black * 0.9} glowBoost={black * 0.6} />

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {LABELS.map((L, i) => {
          const st = C.labels[i];
          const lineP = prog(t, st, st + 0.35, ease.out);
          const dis = prog(t, L.dissolveAt, L.dissolveAt + 0.6, ease.in);
          const flick = dis > 0 && dis < 1 ? (rand(frame * 1.7 + i * 13) > 0.45 ? 1 : 0.15) : 1;
          const a = (t >= st ? 1 : 0) * (1 - dis) * flick * (1 - black);
          const ax = px(L.u);
          const ay = CURVE.base - heightAt(L.u, sigma) - 4;
          const sx0 = L.align === "left" ? L.x + 40 : L.x - 40;
          const sy0 = L.y + 64;
          const ex = sx0 + (ax - sx0) * lineP;
          const ey = sy0 + (ay - sy0) * lineP;
          return (
            <g key={i} opacity={a}>
              <line x1={sx0} y1={sy0} x2={ex} y2={ey} stroke={COLORS.yellow} strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round" />
              {lineP > 0.95 ? <circle cx={ax} cy={ay} r={9} fill={COLORS.yellow} /> : null}
              {lineP > 0.95 ? <circle cx={ax} cy={ay} r={18} fill="none" stroke={COLORS.yellow} strokeWidth={2} opacity={0.6} /> : null}
            </g>
          );
        })}
      </svg>

      {LABELS.map((L, i) => {
        const st = C.labels[i];
        const s = springAt(t, st);
        const dis = prog(t, L.dissolveAt, L.dissolveAt + 0.6, ease.in);
        const flick = dis > 0 && dis < 1 ? (rand(frame * 1.7 + i * 13) > 0.45 ? 1 : 0.15) : 1;
        const a = Math.min(1, s * 1.5) * (1 - dis) * flick * (1 - black);
        if (a <= 0.001) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: L.y,
              ...(L.align === "left" ? { left: L.x } : { right: 1080 - L.x }),
              opacity: a,
              transform: `translateY(${(1 - s) * 30 - dis * 40}px) scale(${0.85 + 0.15 * s})`,
              transformOrigin: L.align === "left" ? "left center" : "right center",
              filter: dis > 0 ? `blur(${(dis * 8).toFixed(1)}px)` : undefined,
              padding: "10px 22px",
              borderRadius: 14,
              border: `3px solid ${COLORS.yellow}`,
              background: "rgba(255,214,10,0.10)",
              fontFamily: FONTS.head,
              fontWeight: 700,
              fontSize: 44,
              letterSpacing: `${(-0.01 + dis * 0.2).toFixed(3)}em`,
              color: COLORS.yellow,
              whiteSpace: "nowrap",
            }}
          >
            {copy.whyCare.labels[i]}
          </div>
        );
      })}

      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};
