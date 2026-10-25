import React from "react";
import { AbsoluteFill } from "remotion";
import { AttentionBeams, Backdrop, COLORS, FONTS, Grain, Headline, TokenRow, Vignette, ensureFonts, tokenLayout } from "../../kit";
import { copy } from "./copy";
import { SENT_A, SENT_B, W_A, W_B } from "./data";

ensureFonts();

const Row: React.FC<{ id: string; tokens: string[]; weights: number[]; y: number; color: string }> = ({ id, tokens, weights, y, color }) => {
  const boxes = tokenLayout(tokens, { cx: 500, y, size: 40 });
  const top = (b: { x: number; y: number; h: number }) => ({ x: b.x, y: b.y - b.h / 2 - 4 });
  return (
    <>
      <AttentionBeams id={id} t={20} from={top(boxes[5])} targets={boxes.slice(0, 5).map((b, i) => ({ ...top(b), w: weights[i] }))} start={0} color={color} labelMin={0.4} particles={false} />
      <TokenRow
        t={20}
        boxes={boxes}
        start={0}
        size={40}
        state={(i) => (i === 5 ? { focus: 1 } : { highlight: Math.min(1, weights[i] * 2.2), highlightColor: color, dim: weights[i] < 0.1 ? 0.45 : 0 })}
      />
    </>
  );
};

export const AttentionBankCover: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <Backdrop t={0} />
    <Headline t={10} start={0} lines={copy.cover.headline} top={300} size={150} lineHeight={0.96} static />
    <div style={{ position: "absolute", left: 60, top: 630, fontFamily: FONTS.head, fontWeight: 500, fontSize: 44, color: COLORS.grey }}>{copy.cover.sub}</div>
    <Row id="ca" tokens={SENT_A} weights={W_A} y={1010} color={COLORS.yellow} />
    <Row id="cb" tokens={SENT_B} weights={W_B} y={1380} color={COLORS.blue} />
    <Grain frame={5} light={0.1} dark={0.14} id="covergrain" />
    <Vignette />
  </AbsoluteFill>
);
