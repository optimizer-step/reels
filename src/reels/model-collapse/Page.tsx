import React from "react";
import { lerp, rand } from "../../kit/anim";
import { copy } from "./copy";
import { COLORS, FONTS } from "../../kit/theme";
import { Tower } from "./Art";

export const PAGE_W = 640;
export const PAGE_H = Math.round(PAGE_W * 1.414);

const mix = (a: string, b: string, p: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], p))).join(",")})`;
};

export type PageProps = {
  /** page-level photocopy degradation, 0..1 */
  level: number;
  stamp: string;
  stampPunch?: number;
  seed: number;
  mode: "original" | "jackrabbit";
  typed?: number;
  scroll?: number;
  cursorOn?: boolean;
  id: string;
};

/** Splits text into normal / keyword segments so the keyword can get a highlighter mark. */
const segments = (text: string, keyword: string) => {
  const out: { s: string; hl: boolean }[] = [];
  let rest = text;
  while (rest.length) {
    const i = rest.indexOf(keyword);
    if (i < 0) {
      out.push({ s: rest, hl: false });
      break;
    }
    if (i > 0) out.push({ s: rest.slice(0, i), hl: false });
    out.push({ s: keyword, hl: true });
    rest = rest.slice(i + keyword.length);
  }
  return out;
};

const Typed: React.FC<{ text: string; n: number; cursorOn: boolean; showCursor: boolean }> = ({
  text,
  n,
  cursorOn,
  showCursor,
}) => {
  const segs = segments(text, copy.reveal.keyword);
  let left = n;
  return (
    <>
      {segs.map((sg, i) => {
        if (left <= 0) return null;
        const take = sg.s.slice(0, left);
        left -= sg.s.length;
        return sg.hl ? (
          <span
            key={i}
            style={{
              background: `linear-gradient(transparent 12%, ${COLORS.yellow} 12%, ${COLORS.yellow} 92%, transparent 92%)`,
              padding: "0 3px",
              margin: "0 -3px",
              borderRadius: 3,
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
              fontWeight: 600,
            }}
          >
            {take}
          </span>
        ) : (
          <span key={i}>{take}</span>
        );
      })}
      {showCursor ? (
        <span
          style={{
            display: "inline-block",
            width: 16,
            height: 46,
            marginLeft: 4,
            verticalAlign: "-6px",
            background: COLORS.ink,
            opacity: cursorOn ? 1 : 0,
          }}
        />
      ) : null}
    </>
  );
};

export const Page: React.FC<PageProps> = ({
  level,
  stamp,
  stampPunch = 0,
  seed,
  mode,
  typed = 0,
  scroll = 0,
  cursorOn = true,
  id,
}) => {
  const L = Math.max(0, Math.min(1, level));
  const paper = mix(COLORS.paper, COLORS.paperDirty, L);
  const contentFilter = `blur(${(L * 1.7).toFixed(2)}px) contrast(${(1 + L * 1.15).toFixed(2)}) grayscale(${L.toFixed(2)}) brightness(${(1 - L * 0.14).toFixed(2)})`;
  const thr = 0.27 + L * 0.13;
  const fake = [0.98, 0.93, 1, 0.88, 0.96, 0.62];
  const full = copy.reveal.jackrabbits;

  return (
    <div
      style={{
        width: PAGE_W,
        height: PAGE_H,
        position: "relative",
        background: paper,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 40px 90px rgba(0,0,0,0.65), 0 8px 20px rgba(0,0,0,0.4)",
      }}
    >
      {/* subtle paper tone gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, rgba(255,255,255,0.35), rgba(0,0,0,0.04) 60%, rgba(0,0,0,0.08))",
        }}
      />
      <div style={{ position: "absolute", inset: 0, filter: contentFilter }}>
        {/* header */}
        <div
          style={{
            position: "absolute",
            left: 52,
            top: 46,
            fontFamily: FONTS.serif,
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: "0.22em",
            color: "#5d5b56",
          }}
        >
          {copy.page.header}
        </div>
        <div style={{ position: "absolute", left: 52, right: 52, top: 80, height: 2, background: "#3a3936", opacity: 0.55 }} />

        {mode === "original" ? (
          <>
            <div style={{ position: "absolute", left: 0, right: 0, top: 112, display: "flex", justifyContent: "center" }}>
              <Tower width={236} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 52,
                right: 52,
                top: 486,
                fontFamily: FONTS.serif,
                fontSize: 29,
                lineHeight: 1.42,
                color: COLORS.ink,
              }}
            >
              {copy.page.pageText}
            </div>
            {fake.map((w, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 52,
                  top: 690 + i * 27,
                  width: (PAGE_W - 104) * w,
                  height: 11,
                  borderRadius: 5,
                  background: "#2b2a28",
                  opacity: 0.2,
                }}
              />
            ))}
          </>
        ) : (
          <div style={{ position: "absolute", left: 52, right: 52, top: 112, bottom: 70, overflow: "hidden" }}>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: 44,
                lineHeight: 1.42,
                color: COLORS.ink,
                transform: `translateY(${-scroll * 1250}px)`,
              }}
            >
              {scroll > 0 ? (
                [0, 1, 2, 3].map((k) => (
                  <div key={k} style={{ marginBottom: 22 }}>
                    <Typed text={full} n={full.length} cursorOn={false} showCursor={false} />
                  </div>
                ))
              ) : (
                <Typed text={full} n={typed} cursorOn={cursorOn} showCursor />
              )}
            </div>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 30,
            textAlign: "center",
            fontFamily: FONTS.serif,
            fontStyle: "italic",
            fontSize: 18,
            color: "#6a6862",
          }}
        >
          {copy.page.pageNo}
        </div>
      </div>

      {/* toner speckle + smudges */}
      <svg width={PAGE_W} height={PAGE_H} style={{ position: "absolute", inset: 0, opacity: Math.min(1, L * 1.25) }}>
        <defs>
          <filter id={`${id}-sp`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={seed} result="n" />
            <feColorMatrix
              in="n"
              type="matrix"
              values={`0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.08  -14 0 0 0 ${(14 * thr).toFixed(3)}`}
            />
          </filter>
          <filter id={`${id}-sm`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={3} seed={seed + 40} result="n" />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  -3.2 0 0 0 1.45"
            />
          </filter>
        </defs>
        <rect width={PAGE_W} height={PAGE_H} filter={`url(#${id}-sm)`} opacity={0.5} />
        <rect width={PAGE_W} height={PAGE_H} filter={`url(#${id}-sp)`} />
      </svg>

      {/* copier streaks */}
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 40 + rand(seed * 3 + k) * (PAGE_W - 80),
            width: 2 + rand(seed + k * 9) * 3,
            background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.6), rgba(0,0,0,0.15), rgba(0,0,0,0.55))",
            opacity: L * 0.5,
          }}
        />
      ))}

      {/* darker edges (copier lid shadow) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 ${30 + L * 90}px ${L * 30}px rgba(0,0,0,${(L * 0.6).toFixed(3)})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: 70,
          background: "linear-gradient(to left, rgba(0,0,0,0.75), rgba(0,0,0,0))",
          opacity: L * 0.8,
        }}
      />

      {/* rubber stamp */}
      <div
        style={{
          position: "absolute",
          right: 34,
          top: 24,
          transform: `rotate(-7deg) scale(${1 + stampPunch * 0.35})`,
          transformOrigin: "center",
          border: `4px solid ${COLORS.stamp}`,
          borderRadius: 6,
          padding: "4px 14px",
          fontFamily: FONTS.mono,
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: "0.04em",
          color: COLORS.stamp,
          opacity: 0.9,
          mixBlendMode: "multiply",
          background: "rgba(255,255,255,0.15)",
        }}
      >
        {stamp}
      </div>
    </div>
  );
};
