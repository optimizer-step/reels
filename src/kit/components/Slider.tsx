import React from "react";
import { clamp01 } from "../anim";
import { COLORS, FONTS, SAFE } from "../theme";

/**
 * On-screen control slider (e.g. LEARNING RATE). The knob, value pill and zone colours are all
 * driven by `value`, so moving the knob is just animating a number.
 */
export const Slider: React.FC<{
  value: number;
  min: number;
  max: number;
  label: string;
  valueText: string;
  top: number;
  color: string;
  zones?: { from: number; to: number; color: string; label?: string }[];
  ticks?: number[];
  appear?: number; // 0..1 slide-in
  pulse?: number; // 0..1 knob glow pulse
  press?: number; // 0..1 knob press (scale down)
}> = ({ value, min, max, label, valueText, top, color, zones = [], ticks = [], appear = 1, pulse = 0, press = 0 }) => {
  if (appear <= 0.001) return null;
  const left = SAFE.left;
  const width = SAFE.right - SAFE.left;
  const trackL = left + 40;
  const trackW = width - 80;
  const x = (v: number) => trackL + trackW * clamp01((v - min) / (max - min));
  const kx = x(value);
  const trackY = top + 112;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translateY(${(1 - appear) * 260}px)`, opacity: Math.min(1, appear * 1.4) }}>
      <div
        style={{
          position: "absolute",
          left,
          width,
          top,
          height: 170,
          borderRadius: 28,
          background: "rgba(16,16,22,0.88)",
          border: "2px solid rgba(255,255,255,0.10)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        }}
      />
      <div style={{ position: "absolute", left: left + 34, top: top + 26, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: COLORS.grey }}>
        {label}
      </div>
      <div style={{ position: "absolute", right: 1080 - SAFE.right + 34, top: top + 14, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 48, color }}>
        {valueText}
      </div>
      {/* base track and filled portion */}
      <div style={{ position: "absolute", left: trackL, width: trackW, top: trackY - 4, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.14)" }} />
      <div style={{ position: "absolute", left: trackL, width: Math.max(0, kx - trackL), top: trackY - 4, height: 8, borderRadius: 4, background: color, boxShadow: `0 0 16px ${color}88` }} />
      {/* zones */}
      {zones.map((z, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              position: "absolute",
              left: x(z.from),
              width: x(z.to) - x(z.from),
              top: trackY - 7,
              height: 14,
              borderRadius: 7,
              background: `repeating-linear-gradient(135deg, ${z.color} 0 8px, ${z.color}55 8px 16px)`,
              opacity: 0.9,
            }}
          />
          {z.label ? (
            <div
              style={{
                position: "absolute",
                left: x(z.from),
                width: x(z.to) - x(z.from),
                top: trackY + 18,
                textAlign: "center",
                fontFamily: FONTS.mono,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "0.06em",
                color: z.color,
              }}
            >
              {z.label}
            </div>
          ) : null}
        </React.Fragment>
      ))}
      {ticks.map((v) => (
        <div key={v} style={{ position: "absolute", left: x(v) - 1, top: trackY - 16, width: 2, height: 32, background: "rgba(255,255,255,0.28)" }} />
      ))}
      {/* knob */}
      <div
        style={{
          position: "absolute",
          left: kx - 22,
          top: trackY - 22,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: color,
          border: `4px solid ${COLORS.bg}`,
          boxShadow: `0 0 ${18 + 30 * pulse}px ${color}, 0 0 ${50 + 50 * pulse}px ${color}88`,
          transform: `scale(${1 - 0.15 * press + 0.12 * pulse})`,
        }}
      />
    </div>
  );
};
