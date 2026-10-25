import React from "react";
import { clamp01, ease, prog } from "../anim";
import { COLORS, FONTS } from "../theme";

const mix = (a: number[], b: number[], p: number) => a.map((v, i) => Math.round(v + (b[i] - v) * p));

/**
 * Attention matrix: rows attend to columns. Cells sweep in diagonally; with `causal`, cells
 * above the diagonal are masked (GPT-style: each word only looks back).
 */
export const Heatmap: React.FC<{
  t: number;
  labels: string[];
  weights: number[][];
  x: number; // left of the grid (cells start here)
  y: number; // top of the grid
  cell: number;
  start: number;
  dur?: number;
  causal?: boolean;
  highlightRow?: number;
  highlight?: number;
  color?: number[];
}> = ({ t, labels, weights, x, y, cell, start, dur = 1.4, causal = true, highlightRow, highlight = 0, color = [255, 214, 10] }) => {
  const n = labels.length;
  const base = [23, 23, 29];
  const gap = 6;
  return (
    <div style={{ position: "absolute", left: 0, top: 0 }}>
      {/* column labels */}
      {labels.map((l, j) => (
        <div
          key={`c${j}`}
          style={{
            position: "absolute",
            left: x + j * cell + cell / 2,
            top: y - 16,
            transform: "rotate(-48deg)",
            transformOrigin: "0 100%",
            fontFamily: FONTS.mono,
            fontWeight: 500,
            fontSize: 28,
            color: COLORS.grey,
            whiteSpace: "nowrap",
            opacity: prog(t, start - 0.3, start),
            marginTop: -34,
          }}
        >
          {l}
        </div>
      ))}
      {/* row labels */}
      {labels.map((l, i) => (
        <div
          key={`r${i}`}
          style={{
            position: "absolute",
            left: x - 20 - 300,
            width: 300,
            top: y + i * cell,
            height: cell - gap,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            fontFamily: FONTS.mono,
            fontWeight: highlightRow === i ? 700 : 500,
            fontSize: 30,
            color: highlightRow === i && highlight > 0.5 ? COLORS.yellow : COLORS.text,
            opacity: prog(t, start - 0.3, start),
          }}
        >
          {l}
        </div>
      ))}
      {weights.map((row, i) =>
        row.map((w, j) => {
          const masked = causal && j > i;
          const tc = start + ((i + j) / (2 * (n - 1))) * dur;
          const p = prog(t, tc, tc + 0.3, ease.outBack);
          if (p <= 0) return null;
          const v = clamp01(w);
          const rgb = mix(base, color, Math.pow(v, 0.65));
          const rowHl = highlightRow === i ? highlight : 0;
          return (
            <div
              key={`${i}-${j}`}
              style={{
                position: "absolute",
                left: x + j * cell,
                top: y + i * cell,
                width: cell - gap,
                height: cell - gap,
                borderRadius: 10,
                background: masked
                  ? "repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 6px, rgba(0,0,0,0) 6px 14px)"
                  : `rgb(${rgb.join(",")})`,
                border: masked ? "2px solid rgba(255,255,255,0.06)" : rowHl > 0 ? `3px solid rgba(255,255,255,${0.9 * rowHl})` : "2px solid rgba(255,255,255,0.06)",
                transform: `scale(${p})`,
                boxShadow: !masked && v > 0.35 ? `0 0 ${18 * v}px rgba(${color.join(",")},0.5)` : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONTS.mono,
                fontWeight: 700,
                fontSize: 22,
                color: v > 0.45 ? COLORS.bg : "rgba(245,245,240,0.75)",
              }}
            >
              {!masked && v >= 0.15 ? v.toFixed(2).replace(/^0/, "") : ""}
            </div>
          );
        }),
      )}
    </div>
  );
};
