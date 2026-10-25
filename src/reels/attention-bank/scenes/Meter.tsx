import React from "react";
import { COLORS, FONTS, SAFE, piecewise, prog, springAt } from "../../../kit";
import { copy } from "../copy";
import { METER, METER_SHOW } from "../timeline";

/** Screen-space "sense meter" across the top: MONEY <-> RIVER, with a glowing needle. */
export const Meter: React.FC<{ t: number }> = ({ t }) => {
  const appear = springAt(t, METER_SHOW[0]);
  const hide = prog(t, METER_SHOW[1] - 0.05, METER_SHOW[1] + 0.1);
  const o = Math.min(appear, 1 - hide);
  if (o <= 0.001) return null;
  const v = piecewise(METER, t);
  const left = SAFE.left;
  const width = SAFE.right - SAFE.left;
  const trackL = left + 150;
  const trackW = width - 300;
  const nx = trackL + trackW / 2 + (v * trackW) / 2;
  const color = v < -0.3 ? COLORS.yellow : v > 0.3 ? COLORS.blue : COLORS.text;
  const label = v < -0.3 ? copy.meter.isMoney : v > 0.3 ? copy.meter.isRiver : copy.meter.q;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 330, opacity: o, transform: `translateY(${(1 - appear) * -30}px)` }}>
      <div
        style={{
          position: "absolute",
          left,
          width,
          top: SAFE.top + 2,
          height: 92,
          borderRadius: 20,
          background: "rgba(11,11,15,0.78)",
          border: "2px solid rgba(255,255,255,0.10)",
        }}
      />
      <div style={{ position: "absolute", left: left + 22, top: SAFE.top + 30, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 30, color: COLORS.yellow, opacity: v < -0.3 ? 1 : 0.55 }}>
        {copy.meter.money}
      </div>
      <div style={{ position: "absolute", right: 1080 - SAFE.right + 22, top: SAFE.top + 30, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 30, color: COLORS.blue, opacity: v > 0.3 ? 1 : 0.55 }}>
        {copy.meter.river}
      </div>
      {/* track */}
      <div
        style={{
          position: "absolute",
          left: trackL,
          width: trackW,
          top: SAFE.top + 64,
          height: 8,
          borderRadius: 4,
          background: `linear-gradient(to right, ${COLORS.yellow}, rgba(255,255,255,0.15) 50%, ${COLORS.blue})`,
          opacity: 0.8,
        }}
      />
      {[0, 0.25, 0.5, 0.75, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: trackL + trackW * k - 1, top: SAFE.top + 58, width: 2, height: 20, background: "rgba(255,255,255,0.35)" }} />
      ))}
      {/* needle */}
      <div
        style={{
          position: "absolute",
          left: nx - 11,
          top: SAFE.top + 57,
          width: 22,
          height: 22,
          borderRadius: 11,
          background: color,
          boxShadow: `0 0 18px ${color}, 0 0 40px ${color}88`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: trackL,
          width: trackW,
          top: SAFE.top + 14,
          textAlign: "center",
          fontFamily: FONTS.mono,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: "0.04em",
          color,
        }}
      >
        {label}
      </div>
    </div>
  );
};
