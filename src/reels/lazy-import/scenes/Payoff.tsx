import React from "react";
import { COLORS, FONTS, Tag, ease, prog, springAt } from "../../../kit";
import { copy } from "../copy";
import { BEATS, CUES } from "../timeline";

const C = CUES.payoff;
const CARD_COLORS = [COLORS.green, COLORS.blue, COLORS.yellow];

/** Benefits (three cards), then the catch (a real traceback from Python 3.15.1). */
export const Payoff: React.FC<{ t: number }> = ({ t }) => {
  const toCatch = prog(t, C.catch - 0.15, C.catch + 0.35, ease.inOut);
  const err = springAt(t, C.fail, { damping: 10, stiffness: 260 });
  const shake = t > C.fail && t < C.fail + 0.4 ? Math.sin((t - C.fail) * 90) * 10 * (1 - (t - C.fail) / 0.4) : 0;
  return (
    <>
      {copy.payoff.cards.map((c, k) => {
        const s = springAt(t, C.cards[k], { damping: 14, stiffness: 190 });
        if (s <= 0.001) return null;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 60,
              width: 880,
              top: 480 + k * 190,
              height: 168,
              borderRadius: 26,
              background: "linear-gradient(90deg, rgba(26,26,34,0.95), rgba(16,16,22,0.9))",
              border: `2px solid ${CARD_COLORS[k]}44`,
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: "0 36px",
              opacity: Math.min(1, s * 1.5) * (1 - toCatch),
              transform: `translateX(${(1 - s) * 120}px) translateY(${-toCatch * 80}px) scale(${1 - 0.06 * toCatch})`,
            }}
          >
            {k < 2 ? (
              <span style={{ fontFamily: FONTS.head, fontWeight: 700, fontSize: 92, letterSpacing: "-0.03em", color: CARD_COLORS[k], minWidth: 330 }}>{c.big}</span>
            ) : (
              <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 40, color: COLORS.text, minWidth: 330, whiteSpace: "nowrap" }}>
                <span style={{ color: COLORS.yellow }}>lazy</span> <span style={{ color: COLORS.violet }}>import</span> x
              </span>
            )}
            <span style={{ fontFamily: FONTS.head, fontWeight: 700, fontSize: 44, letterSpacing: "-0.01em", color: COLORS.text, lineHeight: 1.05 }}>{c.label}</span>
          </div>
        );
      })}
      <Tag t={t} start={C.cards[0] + 0.4} top={1062} size={24} align="center" exit={C.catch - 0.2}>
        {copy.payoff.tag}
      </Tag>
      {/* the catch: the real traceback */}
      {toCatch > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: 60,
            width: 880,
            top: 520,
            borderRadius: 26,
            background: "linear-gradient(180deg, rgba(30,16,18,0.96), rgba(16,12,14,0.96))",
            border: `2px solid ${err > 0 ? COLORS.red : "rgba(255,255,255,0.1)"}`,
            boxShadow: `0 0 ${50 * err}px ${COLORS.red}44`,
            padding: "26px 30px",
            fontFamily: FONTS.mono,
            fontWeight: 600,
            fontSize: 28,
            lineHeight: 1.5,
            color: COLORS.text,
            opacity: toCatch * (1 - prog(t, BEATS.payoff.end - 0.25, BEATS.payoff.end + 0.05)),
            transform: `translateY(${(1 - toCatch) * 80 + 0}px) translateX(${shake}px)`,
            whiteSpace: "pre",
          }}
        >
          <div style={{ color: COLORS.grey }}>
            <span style={{ color: COLORS.yellow }}>lazy</span> <span style={{ color: COLORS.violet }}>from</span> json <span style={{ color: COLORS.violet }}>import</span> dumsp <span style={{ color: COLORS.grey }}># typo</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <span style={{ color: COLORS.green }}>$ </span>python app.py
          </div>
          <div style={{ opacity: prog(t, C.catch + 0.4, C.catch + 0.6) }}>
            App started <span style={{ color: COLORS.green }}>← start-up is fine</span>
          </div>
          <div style={{ opacity: err > 0 ? 1 : 0, color: COLORS.grey, marginTop: 6 }}>{`  File "app.py", line 3\n    result = dumsp({"key": "value"})`}</div>
          <div style={{ opacity: err > 0 ? 1 : 0, color: COLORS.red, fontWeight: 700, transform: `scale(${1 + 0.06 * Math.sin(Math.PI * Math.min(1, err))})`, transformOrigin: "left center" }}>
            {"ImportError: cannot import name\n  'dumsp' from 'json'"}
          </div>
        </div>
      ) : null}
      {toCatch > 0.001 ? (
        <div style={{ position: "absolute", left: 60, width: 880, top: 1090, textAlign: "center", fontFamily: FONTS.head, fontWeight: 700, fontSize: 42, lineHeight: 1.15, color: COLORS.text, opacity: prog(t, C.fail, C.fail + 0.35) * (1 - prog(t, BEATS.payoff.end - 0.25, BEATS.payoff.end + 0.05)) }}>
          {copy.payoff.catchSub}
        </div>
      ) : null}
    </>
  );
};
