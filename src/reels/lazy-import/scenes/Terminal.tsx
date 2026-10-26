import React from "react";
import { COLORS, FONTS, clamp01, ease, prog, springAt } from "../../../kit";
import data from "../modules.json";

const ORDER = data.order as string[];

/** A terminal window running `python report.py --help`, with a load bar and live module names. */
export const Terminal: React.FC<{
  t: number;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  accent: string;
  command: string;
  /** typing of the command (0..1) */
  typed: number;
  /** load progress 0..1 (modules loaded / total) */
  load: number;
  total: number;
  ms: number;
  mb: number;
  done: number;
  appear?: number;
  badge?: string;
}> = ({ t, x, y, w, h, title, accent, command, typed, load, total, ms, mb, done, appear = 1, badge }) => {
  const n = Math.round(clamp01(load) * total);
  const shownMs = Math.round(clamp01(load) * ms);
  // live module name: walk the real import order at the same pace
  const name = n > 0 ? ORDER[Math.min(ORDER.length - 1, Math.floor((n / total) * (ORDER.length - 1)))] : "";
  const cmdChars = Math.floor(command.length * clamp01(typed));
  const cursorOn = Math.floor(t * 2.5) % 2 === 0;
  const doneS = done > 0 ? springAt(t, done, { damping: 12, stiffness: 220 }) : 0;
  const mono: React.CSSProperties = { fontFamily: FONTS.mono, fontWeight: 600 };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 26,
        background: "linear-gradient(180deg, rgba(26,26,34,0.96), rgba(16,16,22,0.96))",
        border: `2px solid ${doneS > 0 ? accent : "rgba(255,255,255,0.10)"}`,
        boxShadow: `0 30px 70px rgba(0,0,0,0.55), 0 0 ${40 * doneS}px ${accent}55`,
        overflow: "hidden",
        opacity: appear,
        transform: `translateY(${(1 - appear) * 40}px)`,
      }}
    >
      {/* title bar */}
      <div style={{ height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.8 }} />
        ))}
        <span style={{ ...mono, fontSize: 24, color: accent, marginLeft: 14, letterSpacing: "0.04em" }}>{title}</span>
        {badge ? <span style={{ ...mono, fontSize: 22, color: COLORS.grey, marginLeft: "auto" }}>{badge}</span> : null}
      </div>
      <div style={{ padding: "22px 30px", ...mono, fontSize: 30, color: COLORS.text }}>
        <div style={{ whiteSpace: "nowrap" }}>
          <span style={{ color: COLORS.green }}>$ </span>
          {command.slice(0, cmdChars)}
          {typed < 1 && cursorOn ? <span style={{ display: "inline-block", width: 16, height: 32, background: COLORS.text, verticalAlign: "-5px", marginLeft: 2 }} /> : null}
        </div>
        {/* load bar */}
        <div style={{ marginTop: 26, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ width: `${clamp01(load) * 100}%`, height: "100%", borderRadius: 7, background: accent, boxShadow: `0 0 18px ${accent}` }} />
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: 26, color: COLORS.grey }}>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: w - 330 }}>{load > 0 && load < 1 ? `import ${name}` : load >= 1 ? "ready" : ""}</span>
          <span style={{ color: COLORS.text }}>{n} modules</span>
        </div>
        {/* result */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", gap: 18, opacity: Math.min(1, 0.25 + 0.75 * clamp01(load * 3)) }}>
          <span style={{ fontFamily: FONTS.head, fontWeight: 700, fontSize: 92, letterSpacing: "-0.03em", color: done > 0 && t >= done ? accent : COLORS.text, transform: `scale(${1 + 0.08 * Math.sin(Math.PI * clamp01(doneS))})`, transformOrigin: "left center", display: "inline-block" }}>
            {shownMs} ms
          </span>
          <span style={{ fontSize: 26, color: COLORS.grey }}>{Math.round(clamp01(load) * mb)} MB</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 24, color: COLORS.grey, opacity: prog(t, done, done + 0.25, ease.out) * (done > 0 ? 1 : 0), whiteSpace: "nowrap" }}>
          usage: report [-h] [--out OUT] url
        </div>
      </div>
    </div>
  );
};
