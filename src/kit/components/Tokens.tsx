import React from "react";
import { clamp01, ease, lerp, prog, springAt } from "../anim";
import { COLORS, FONTS } from "../theme";

/**
 * Token chips in JetBrains Mono. Monospace makes widths exact (0.6em per character),
 * so other components (attention beams, labels) can attach to precise positions.
 */

export type TokenBox = { x: number; y: number; w: number; h: number; text: string };

export const tokenLayout = (
  tokens: string[],
  opts: { cx: number; y: number; size?: number; padX?: number; gap?: number },
): TokenBox[] => {
  const size = opts.size ?? 40;
  const padX = opts.padX ?? size * 0.42;
  const gap = opts.gap ?? size * 0.32;
  const h = size * 1.75;
  const widths = tokens.map((t) => t.length * size * 0.6 + padX * 2);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (tokens.length - 1);
  let x = opts.cx - total / 2;
  return tokens.map((text, i) => {
    const box = { x: x + widths[i] / 2, y: opts.y, w: widths[i], h, text };
    x += widths[i] + gap;
    return box;
  });
};

export type TokenState = {
  /** 0..1 yellow focus (filled) */
  focus?: number;
  /** 0..1 outline highlight in a colour */
  highlight?: number;
  highlightColor?: string;
  /** 0..1 dimming */
  dim?: number;
};

export const TokenRow: React.FC<{
  t: number;
  boxes: TokenBox[];
  start: number;
  stagger?: number;
  size?: number;
  state?: (i: number) => TokenState;
  exit?: number;
}> = ({ t, boxes, start, stagger = 0.08, size = 40, state = (): TokenState => ({}), exit }) => {
  const out = exit !== undefined ? prog(t, exit, exit + 0.3, ease.in) : 0;
  return (
    <>
      {boxes.map((b, i) => {
        const s = springAt(t, start + i * stagger);
        if (s <= 0.001) return null;
        const st = state(i);
        const focus = clamp01(st.focus ?? 0);
        const hl = clamp01(st.highlight ?? 0);
        const hc = st.highlightColor ?? COLORS.yellow;
        const dim = clamp01(st.dim ?? 0);
        const border = focus > 0 ? COLORS.yellow : hl > 0 ? hc : "rgba(245,245,240,0.22)";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x - b.w / 2,
              top: b.y - b.h / 2,
              width: b.w,
              height: b.h,
              borderRadius: size * 0.32,
              border: `3px solid ${border}`,
              background: focus > 0 ? `rgba(255,214,10,${0.12 + 0.88 * focus})` : `rgba(21,21,27,${0.92})`,
              boxShadow: focus > 0 || hl > 0 ? `0 0 ${20 + 40 * Math.max(focus, hl)}px ${focus > 0 ? COLORS.yellow : hc}${focus > 0.5 || hl > 0.5 ? "66" : "33"}` : "0 12px 30px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONTS.mono,
              fontWeight: 700,
              fontSize: size,
              color: focus > 0.5 ? COLORS.bg : COLORS.text,
              opacity: lerp(1, 0.32, dim) * (1 - out),
              transform: `translateY(${(1 - s) * 40 - out * 30}px) scale(${(0.6 + 0.4 * s) * (1 + 0.06 * focus)})`,
              whiteSpace: "pre",
            }}
          >
            {b.text}
          </div>
        );
      })}
    </>
  );
};
