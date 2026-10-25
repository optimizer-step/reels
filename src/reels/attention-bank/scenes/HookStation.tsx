import React from "react";
import { COLORS, FONTS, Glitch, ease, glow, lerp, prog, springAt } from "../../../kit";
import { copy } from "../copy";
import { CUES } from "../timeline";

const C = CUES.hook;
const WORD_Y = 800; // world y of the BANK word centre
const CARD_Y = 1118;

const Coins: React.FC<{ size?: number }> = ({ size = 92 }) => (
  <svg width={size} height={size} viewBox="0 0 92 92">
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(0 ${-i * 13})`}>
        <ellipse cx="46" cy="70" rx="32" ry="11" fill="#1f1b08" stroke={COLORS.yellow} strokeWidth={4} />
        <path d="M 14 70 L 14 78 A 32 11 0 0 0 78 78 L 78 70" fill="#1f1b08" stroke={COLORS.yellow} strokeWidth={4} />
      </g>
    ))}
  </svg>
);

const Waves: React.FC<{ size?: number }> = ({ size = 92 }) => (
  <svg width={size} height={size} viewBox="0 0 92 92">
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M 6 ${30 + i * 20} Q 17 ${20 + i * 20} 28 ${30 + i * 20} T 50 ${30 + i * 20} T 72 ${30 + i * 20} T 94 ${30 + i * 20}`}
        fill="none"
        stroke={COLORS.blue}
        strokeWidth={6}
        strokeLinecap="round"
      />
    ))}
  </svg>
);

const Card: React.FC<{ t: number; side: -1 | 1 }> = ({ t, side }) => {
  const s = springAt(t, C.cards + (side > 0 ? 0.12 : 0), { damping: 12, stiffness: 150 });
  if (s <= 0.001) return null;
  const tx = lerp(500, 500 + side * 215, s);
  const ty = lerp(WORD_Y + 40, CARD_Y, s);
  const color = side < 0 ? COLORS.yellow : COLORS.blue;
  return (
    <div
      style={{
        position: "absolute",
        left: tx - 185,
        top: ty - 105,
        width: 370,
        height: 210,
        borderRadius: 30,
        border: `4px solid ${color}`,
        background: side < 0 ? "rgba(255,214,10,0.10)" : "rgba(77,163,255,0.10)",
        boxShadow: `0 0 50px ${color}33, 0 30px 60px rgba(0,0,0,0.5)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        transform: `scale(${0.4 + 0.6 * s}) rotate(${(1 - s) * side * 12}deg)`,
        opacity: Math.min(1, s * 1.5),
        fontFamily: FONTS.head,
        fontWeight: 700,
        fontSize: 58,
        color,
      }}
    >
      {side < 0 ? <Coins /> : <Waves />}
      {side < 0 ? copy.hook.money : copy.hook.river}
    </div>
  );
};

/** World station at the top of the canvas: the giant BANK word and its two meanings. */
export const HookStation: React.FC<{ t: number }> = ({ t }) => {
  const breathe = 1 + 0.012 * Math.sin(t * 2.2);
  const showCards = t < 4.8;
  const lines = prog(t, C.cards + 0.25, C.cards + 0.6, ease.out);
  return (
    <>
      {showCards && lines > 0 ? (
        <svg width={1000} height={1400} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {[-1, 1].map((side) => (
            <path
              key={side}
              d={`M 500 ${WORD_Y + 120} Q ${500 + side * 60} ${CARD_Y - 120} ${500 + side * 215} ${CARD_Y - 110}`}
              fill="none"
              stroke={side < 0 ? COLORS.yellow : COLORS.blue}
              strokeWidth={4}
              strokeDasharray="4 12"
              strokeLinecap="round"
              opacity={0.7 * lines}
            />
          ))}
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: 50, top: WORD_Y - 150, width: 900, height: 300 }}>
        <Glitch t={t} t0={C.glitch} dur={0.32} strength={1.2} seed={4}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONTS.head,
              fontWeight: 700,
              fontSize: 260,
              letterSpacing: "-0.05em",
              color: COLORS.text,
              transform: `scale(${breathe})`,
              filter: glow("rgba(255,255,255,0.25)", 22),
            }}
          >
            {copy.hook.word}
          </div>
        </Glitch>
      </div>
      {showCards ? (
        <>
          <Card t={t} side={-1} />
          <Card t={t} side={1} />
        </>
      ) : null}
    </>
  );
};
