import React from "react";
import { COLORS, FONTS, Headline, SAFE, ease, prog, springAt } from "../../../kit";
import { copy } from "../copy";
import { BEATS, CUES } from "../timeline";

/** Comment CTA: a comment box types the keyword (no fake comments from other people). */
export const Cta: React.FC<{ t: number }> = ({ t }) => {
  if (t < BEATS.cta.start - 0.1 || t > BEATS.end.start + 0.1) return null;
  // everything clears (rise + fade) as the brand end card comes in
  const out = prog(t, BEATS.end.start - 0.3, BEATS.end.start + 0.05, ease.in);
  const at = CUES.cta.sub + 0.25;
  const s = springAt(t, at);
  const typed = copy.cta.typed;
  const n = Math.floor((typed.length + 0.999) * prog(t, at + 0.35, at + 0.95, (x) => x));
  const sent = springAt(t, at + 1.15, { damping: 10, stiffness: 300 });
  const cursor = Math.floor(t * 3) % 2 === 0;
  return (
    <>
      <Headline t={t} start={CUES.cta.headline} lines={copy.cta.headline} top={430} size={150} align="center" variant="slam" lineStarts={[CUES.cta.headline, CUES.cta.headline + 0.28]} lineHeight={0.95} exit={BEATS.end.start - 0.3} />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1000,
          top: 760,
          textAlign: "center",
          fontFamily: FONTS.head,
          fontWeight: 500,
          fontSize: 48,
          color: COLORS.text,
          opacity: prog(t, CUES.cta.sub, CUES.cta.sub + 0.35) * (1 - out),
          transform: `translateY(${(1 - prog(t, CUES.cta.sub, CUES.cta.sub + 0.4, ease.out)) * 24 - 40 * out}px)`,
        }}
      >
        {copy.cta.sub}
      </div>
      {s > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: SAFE.left + 20,
            width: SAFE.right - SAFE.left - 40,
            top: 880,
            height: 112,
            borderRadius: 56,
            background: "rgba(255,255,255,0.06)",
            border: `3px solid ${n > 0 ? COLORS.yellow : "rgba(255,255,255,0.18)"}`,
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "0 22px",
            opacity: Math.min(1, s * 1.5) * (1 - out),
            transform: `translateY(${(1 - s) * 60 - 40 * out}px)`,
          }}
        >
          <div style={{ width: 66, height: 66, borderRadius: 33, background: "linear-gradient(135deg, #3a3a46, #22222a)", flexShrink: 0 }} />
          <div style={{ flex: 1, fontFamily: n > 0 ? FONTS.mono : FONTS.head, fontWeight: n > 0 ? 700 : 500, fontSize: n > 0 ? 52 : 40, color: n > 0 ? COLORS.yellow : COLORS.grey }}>
            {n > 0 ? typed.slice(0, n) : copy.cta.placeholder}
            {n > 0 && cursor ? <span style={{ display: "inline-block", width: 14, height: 46, marginLeft: 4, verticalAlign: "-6px", background: COLORS.yellow }} /> : null}
          </div>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: n >= typed.length ? COLORS.yellow : "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${1 + 0.25 * Math.sin(Math.PI * Math.min(1, sent))})`,
              flexShrink: 0,
            }}
          >
            <svg width={34} height={34} viewBox="0 0 34 34">
              <path d="M 4 17 L 30 4 L 22 30 L 17 19 Z" fill={n >= typed.length ? COLORS.bg : COLORS.grey} />
            </svg>
          </div>
        </div>
      ) : null}
    </>
  );
};
