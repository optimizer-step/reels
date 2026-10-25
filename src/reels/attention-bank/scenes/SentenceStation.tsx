import React from "react";
import { Arrow, AttentionBeams, COLORS, DecodeText, FONTS, TokenRow, clamp01, ease, prog, tokenLayout } from "../../../kit";
import { copy } from "../copy";

export const ROW_SIZE = 40;

/**
 * One sentence on the world canvas: token chips, optional vectors under each token,
 * attention beams from "bank" (the last token) to every earlier word, and an optional note.
 */
export const SentenceStation: React.FC<{
  id: string;
  t: number;
  tokens: string[];
  rowY: number;
  weights: number[];
  color: string;
  tokensAt: number;
  focusAt: number;
  beamsAt: number;
  /** index of a token to outline (the word that changed) */
  marked?: { i: number; at: number; color: string };
  vectors?: { at: number; bankAt: number; hideAt: number };
  note?: { at: number; target: string };
}> = ({ id, t, tokens, rowY, weights, color, tokensAt, focusAt, beamsAt, marked, vectors, note }) => {
  const boxes = tokenLayout(tokens, { cx: 500, y: rowY, size: ROW_SIZE });
  const bank = boxes[boxes.length - 1];
  const top = (b: { x: number; y: number; h: number }) => ({ x: b.x, y: b.y - b.h / 2 - 4 });
  const beamOn = prog(t, beamsAt, beamsAt + 0.8);
  const state = (i: number) => {
    if (i === boxes.length - 1) return { focus: prog(t, focusAt, focusAt + 0.25, ease.out) };
    const w = weights[i] ?? 0;
    const st: { highlight?: number; highlightColor?: string; dim?: number } = {
      highlight: clamp01(w * 2.2) * beamOn,
      highlightColor: color,
      dim: beamOn * (w < 0.1 ? 0.45 : 0),
    };
    if (marked && i === marked.i && t >= marked.at) {
      st.highlight = Math.max(st.highlight ?? 0, prog(t, marked.at, marked.at + 0.25));
      st.highlightColor = marked.color;
      st.dim = 0;
    }
    return st;
  };
  const vecOut = vectors ? prog(t, vectors.hideAt, vectors.hideAt + 0.35) : 1;
  return (
    <>
      <AttentionBeams
        id={`${id}-beams`}
        t={t}
        from={top(bank)}
        targets={boxes.slice(0, -1).map((b, i) => ({ ...top(b), w: weights[i] }))}
        start={beamsAt}
        dur={1.0}
        color={color}
        labelMin={0.2}
      />
      <TokenRow t={t} boxes={boxes} start={tokensAt} stagger={0.07} size={ROW_SIZE} state={state} />

      {vectors && vecOut < 1 ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: 1 - vecOut }}>
          {/* faint vectors under every other word */}
          {boxes.slice(0, -1).map((b, i) => (
            <div
              key={i}
              style={{ position: "absolute", left: b.x - 60, width: 120, top: rowY + 54, textAlign: "center", fontSize: 24, lineHeight: 1.4, color: COLORS.grey }}
            >
              {[0, 1, 2].map((k) => (
                <div key={k}>
                  <DecodeText text={["0.18", "0.62", "0.07", "0.44", "0.91"][(i + k) % 5]} t={t} start={vectors.at + i * 0.05 + k * 0.04} dur={0.6} seed={i * 9 + k} color={COLORS.grey} scrambleColor="#55555f" />
                </div>
              ))}
            </div>
          ))}
          {/* the bank vector, bracketed */}
          {t >= vectors.bankAt ? (
            <div
              style={{
                position: "absolute",
                left: bank.x - 82,
                width: 164,
                top: rowY + 54,
                padding: "10px 0",
                borderLeft: `4px solid ${COLORS.yellow}`,
                borderRight: `4px solid ${COLORS.yellow}`,
                borderRadius: 10,
                textAlign: "center",
                fontSize: 34,
                lineHeight: 1.3,
                fontWeight: 700,
                color: COLORS.yellow,
                background: "rgba(255,214,10,0.06)",
                boxShadow: "0 0 40px rgba(255,214,10,0.18)",
              }}
            >
              {copy.numbers.vector.map((v, k) => (
                <div key={k}>
                  <DecodeText text={v} t={t} start={vectors.bankAt + k * 0.09} dur={0.7} seed={40 + k} color={COLORS.yellow} scrambleColor={COLORS.text} />
                </div>
              ))}
              <div style={{ color: COLORS.grey }}>…</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {note && t >= note.at ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1000,
            top: rowY + 76,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            fontFamily: FONTS.head,
            fontWeight: 700,
            fontSize: 50,
            color: COLORS.text,
            opacity: prog(t, note.at, note.at + 0.3),
            transform: `translateY(${(1 - prog(t, note.at, note.at + 0.35, ease.out)) * 24}px)`,
          }}
        >
          {copy.attention.note[0]}
          <Arrow width={70} color={color} strokeWidth={6} />
          <span style={{ color }}>{note.target}</span>
        </div>
      ) : null}
    </>
  );
};
