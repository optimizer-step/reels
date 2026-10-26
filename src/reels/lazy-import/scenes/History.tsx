import React from "react";
import { COLORS, FONTS, ease, prog, springAt } from "../../../kit";
import { copy } from "../copy";
import { CUES } from "../timeline";

const C = CUES.history;
const LINE_X = 150;
const NODES = [
  { y: 560, at: C.a, color: COLORS.red, data: copy.history.a, stampAt: C.reject, reasonAt: C.risky },
  { y: 905, at: C.b, color: COLORS.green, data: copy.history.b, stampAt: C.accept, reasonAt: C.accept + 0.3 },
  { y: 1210, at: C.c, color: COLORS.yellow, data: copy.history.c, stampAt: Infinity, reasonAt: Infinity },
];

const Stamp: React.FC<{ t: number; at: number; text: string; color: string; x: number; y: number }> = ({ t, at, text, color, x, y }) => {
  const s = springAt(t, at, { damping: 11, stiffness: 320 });
  if (s <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(-8deg) scale(${2.1 - 1.1 * s})`,
        padding: "6px 22px",
        border: `6px solid ${color}`,
        borderRadius: 12,
        fontFamily: FONTS.head,
        fontWeight: 700,
        fontSize: 58,
        letterSpacing: "0.02em",
        color,
        background: "rgba(11,11,15,0.7)",
        opacity: Math.min(1, s * 2),
        boxShadow: `0 0 36px ${color}55`,
      }}
    >
      {text}
    </div>
  );
};

/** Why it took until 2026: a vertical timeline, 2022 rejected, 2025 accepted, 2026 shipped. */
export const History: React.FC<{ t: number }> = ({ t }) => {
  const lineP = prog(t, C.a - 0.3, C.c + 0.3, (x) => x);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={LINE_X} x2={LINE_X} y1={480} y2={480 + (1290 - 480) * lineP} stroke="rgba(255,255,255,0.22)" strokeWidth={4} strokeLinecap="round" />
      </svg>
      {NODES.map((n, k) => {
        const s = springAt(t, n.at, { damping: 14, stiffness: 180 });
        if (s <= 0.001) return null;
        const reason = prog(t, n.reasonAt, n.reasonAt + 0.35, ease.out);
        const dim = k === 0 ? 0.35 * prog(t, C.b, C.b + 0.4) : 0;
        return (
          <React.Fragment key={k}>
            <div style={{ position: "absolute", left: LINE_X - 17, top: n.y - 17, width: 34, height: 34, borderRadius: 17, background: n.color, boxShadow: `0 0 26px ${n.color}`, transform: `scale(${s})` }} />
            <div style={{ position: "absolute", left: 205, top: n.y - 70, width: 735, opacity: Math.min(1, s * 1.4) * (1 - dim), transform: `translateX(${(1 - s) * 50}px)` }}>
              <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 28, letterSpacing: "0.06em", color: n.color }}>
                {n.data.year} <span style={{ color: COLORS.grey }}>· {n.data.pep}</span>
              </div>
              <div style={{ fontFamily: FONTS.head, fontWeight: 700, fontSize: 54, letterSpacing: "-0.02em", color: COLORS.text, marginTop: 6, lineHeight: 1.05 }}>{n.data.what}</div>
              {n.data.why ? (
                <div style={{ fontFamily: FONTS.mono, fontWeight: 500, fontSize: 25, lineHeight: 1.35, color: COLORS.grey, marginTop: 12, opacity: reason, transform: `translateY(${(1 - reason) * 10}px)`, maxWidth: 700 }}>
                  {n.data.why}
                </div>
              ) : null}
              {k === 1 ? (
                <div style={{ marginTop: 14, display: "inline-block", padding: "6px 16px", borderRadius: 10, background: "rgba(255,214,10,0.08)", border: `2px solid ${COLORS.yellow}55`, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 28, color: COLORS.text, opacity: reason }}>
                  <span style={{ color: COLORS.yellow }}>lazy</span> <span style={{ color: COLORS.violet }}>import</span> pandas
                </div>
              ) : null}
            </div>
            {n.data.stamp ? <Stamp t={t} at={n.stampAt} text={n.data.stamp} color={n.color} x={735} y={n.y - 92} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};
