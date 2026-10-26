import React from "react";
import { ease, prog, springAt } from "../anim";
import { COLORS, FONTS, SAFE, SIZES } from "../theme";

export type HeadlineProps = {
  t: number;
  start: number;
  lines: string[][];
  top: number;
  size?: number;
  stagger?: number;
  align?: "left" | "center";
  color?: string;
  exit?: number;
  lineHeight?: number;
  /** Words already on screen (no entrance animation). */
  static?: boolean;
  /** "pop" (default): words rise in. "slam": each line hits from large with blur, for impacts. */
  variant?: "pop" | "slam";
  /** Optional start time per line (overrides start + stagger), e.g. to land lines on beats. */
  lineStarts?: number[];
  /** Colour for *highlighted* words and their underline (default house yellow). */
  highlightColor?: string;
};

// "*WORD*" highlights WORD; trailing punctuation after the closing star ("*B*?") stays un-highlighted.
const parse = (w: string) => {
  const m = w.match(/^\*(.+?)\*([^*]*)$/);
  return m ? { text: m[1], hl: true, suffix: m[2] } : { text: w, hl: false, suffix: "" };
};

/** Word-by-word pop headline. Words wrapped in *stars* get yellow + an underline swipe. */
export const Headline: React.FC<HeadlineProps> = ({
  t,
  start,
  lines,
  top,
  size = SIZES.headline,
  stagger = 0.13,
  align = "left",
  color = COLORS.text,
  exit,
  lineHeight = 1.02,
  static: isStatic = false,
  variant = "pop",
  lineStarts,
  highlightColor = COLORS.yellow,
}) => {
  let idx = 0;
  const exitP = exit !== undefined ? prog(t, exit, exit + 0.28, ease.in) : 0;
  if (exitP >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top,
        textAlign: align,
        fontFamily: FONTS.head,
        fontWeight: 700,
        fontSize: size,
        lineHeight,
        letterSpacing: "-0.03em",
        color,
        // a soft dark halo keeps words legible when a glow or a ball passes behind them
        textShadow: "0 4px 28px rgba(11,11,15,0.6)",
        opacity: 1 - exitP,
        transform: `translateY(${-40 * exitP}px)`,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{ whiteSpace: "nowrap" }}>
          {line.map((raw, wi) => {
            const { text, hl, suffix } = parse(raw);
            const ws = lineStarts ? lineStarts[li] + wi * 0.04 : start + idx * stagger;
            idx++;
            if (variant === "slam" && !isStatic) {
              const k = springAt(t, ws, { damping: 18, stiffness: 420, mass: 0.7 });
              const o = prog(t, ws, ws + 0.05);
              const u = prog(t, ws + 0.1, ws + 0.35, ease.out);
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    position: "relative",
                    marginRight: wi < line.length - 1 ? size * 0.24 : 0,
                    opacity: o,
                    transform: `scale(${1.9 - 0.9 * k})`,
                    transformOrigin: "50% 60%",
                    filter: k < 0.97 ? `blur(${((1 - k) * 14).toFixed(1)}px)` : undefined,
                  }}
                >
                  <span style={{ position: "relative", display: "inline-block", color: hl ? highlightColor : undefined }}>
                    {text}
                    {hl ? (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: -size * 0.06,
                          height: Math.max(8, size * 0.085),
                          background: highlightColor,
                          borderRadius: 4,
                          transform: `scaleX(${u})`,
                          transformOrigin: "left center",
                        }}
                      />
                    ) : null}
                  </span>
                  {suffix}
                </span>
              );
            }
            const s = isStatic ? 1 : springAt(t, ws);
            const o = isStatic ? 1 : prog(t, ws, ws + 0.12, ease.out);
            const u = isStatic ? 1 : prog(t, ws + 0.12, ws + 0.42, ease.out);
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  position: "relative",
                  marginRight: wi < line.length - 1 ? size * 0.24 : 0,
                  opacity: o,
                  transform: `translateY(${(1 - s) * size * 0.45}px) scale(${0.82 + 0.18 * s})`,
                  transformOrigin: "50% 80%",
                }}
              >
                <span style={{ position: "relative", display: "inline-block", color: hl ? highlightColor : undefined }}>
                  {text}
                  {hl ? (
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: -size * 0.06,
                        height: Math.max(8, size * 0.085),
                        background: highlightColor,
                        borderRadius: 4,
                        transform: `scaleX(${u})`,
                        transformOrigin: "left center",
                      }}
                    />
                  ) : null}
                </span>
                {suffix}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Small source / context tag. */
export const Tag: React.FC<{
  t: number;
  start: number;
  top: number;
  children: React.ReactNode;
  align?: "left" | "center";
  exit?: number;
  size?: number;
  color?: string;
}> = ({ t, start, top, children, align = "left", exit, size = 28, color = COLORS.grey }) => {
  const o = Math.min(prog(t, start, start + 0.35, ease.out), exit !== undefined ? 1 - prog(t, exit, exit + 0.25) : 1);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top,
        textAlign: align,
        fontFamily: FONTS.mono,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.35,
        color,
        opacity: o,
        transform: `translateY(${(1 - o) * 14}px)`,
      }}
    >
      {children}
    </div>
  );
};
