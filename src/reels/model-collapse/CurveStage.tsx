import React from "react";
import { lerp, prog, springAt } from "../../kit/anim";
import { BellCurve } from "../../kit/components/BellCurve";
import { COLORS } from "../../kit/theme";
import { copy } from "./copy";
import { BEATS, CUES, CURVE_SIGMAS, CURVE_TICKS } from "./timeline";

/** The curve's sigma at time t: steps down on each tick, springs back at the twist. */
export const sigmaAt = (t: number) => {
  let s = CURVE_SIGMAS[0];
  CURVE_TICKS.forEach((tick, i) => {
    const p = springAt(t, tick, { damping: 16, stiffness: 140 });
    s = lerp(s, CURVE_SIGMAS[i + 1], Math.min(1, p));
  });
  const back = springAt(t, CUES.twist.springBack, { damping: 13, stiffness: 70, mass: 1.1 });
  if (t >= CUES.twist.springBack) s = lerp(s, 1, back);
  if (t >= BEATS.cta.start) s = 1;
  return s;
};

/**
 * The bell curve shared by beats 6, 7 and 8. It is a pure function of global time,
 * so cutting between those beats is seamless.
 */
export const CurveStage: React.FC<{
  t: number;
  draw: number;
  fill: number;
  labels: number;
  axis?: number;
  stroke?: string;
  glowBoost?: number;
}> = ({ t, draw, fill, labels, axis = 1, stroke, glowBoost = 0 }) => {
  const sigma = sigmaAt(t);
  let ghost: { s: number; a: number } | null = null;
  CURVE_TICKS.forEach((tick, i) => {
    const dt = t - tick;
    if (dt >= 0 && dt < 0.9) ghost = { s: CURVE_SIGMAS[i], a: 1 - prog(t, tick, tick + 0.9) };
  });
  const tickFlash = CURVE_TICKS.reduce((m, tick) => Math.max(m, 1 - prog(t, tick, tick + 0.35)), 0) * (t >= CURVE_TICKS[0] ? 1 : 0);
  const g = ghost as { s: number; a: number } | null;
  return (
    <>
      {g ? (
        <div style={{ position: "absolute", inset: 0, opacity: g.a * 0.55 }}>
          <BellCurve sigma={g.s} draw={1} fill={0} labels={0} outlineOnly stroke={COLORS.grey} />
        </div>
      ) : null}
      <BellCurve
        sigma={sigma}
        draw={draw}
        fill={fill}
        labels={labels}
        axis={axis}
        stroke={stroke}
        glow={0.5 + tickFlash * 0.8 + glowBoost}
        centreLabel={copy.rehook.common}
        tailLabel={copy.rehook.rare}
      />
    </>
  );
};
