import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, lerp, prog, rand, springAt } from "../../../kit/anim";
import { Rabbit } from "../Art";
import { Page, PAGE_H, PAGE_W } from "../Page";
import { copy } from "../copy";
import { COLORS, CX, FONTS } from "../../../kit/theme";
import { CUES } from "../timeline";
import { QuestionCard, STORY_PAGE_TOP } from "./Beat4OpenLoop";

const C = CUES.reveal;

// 16 rabbit spots around the page (x, y = top-left, size, facing left?)
const SPOTS: [number, number, number, boolean][] = [
  [790, 1150, 132, false],
  [40, 1180, 120, false],
  [842, 520, 112, true],
  [34, 700, 110, false],
  [612, 236, 98, true],
  [884, 900, 100, true],
  [30, 1020, 100, false],
  [400, 1352, 112, false],
  [470, 226, 84, false],
  [900, 340, 90, true],
  [20, 440, 90, false],
  [878, 1110, 96, true],
  [190, 1366, 92, false],
  [640, 1372, 100, true],
  [930, 700, 86, true],
  [64, 864, 84, false],
];

const startOf = (i: number) => {
  let prev = 0;
  for (const b of C.rabbits) {
    if (i < b.count) return b.t + (i - prev) * 0.07;
    prev = b.count;
  }
  return 999;
};

export const Beat5Reveal: React.FC<{ t: number }> = ({ t }) => {
  const forward = springAt(t, C.unfreeze, { damping: 15, stiffness: 150 });
  const full = copy.reveal.jackrabbits;
  const typed = Math.floor(full.length * prog(t, C.typeStart, C.typeEnd, (x) => x));
  const typing = t < C.typeEnd;
  const cursorOn = typing || Math.floor(t * 3.2) % 2 === 0;
  const scroll = prog(t, C.overflow, C.overflow + 2.2, ease.in);
  const zoom = 1 + 0.04 * prog(t, C.overflow, C.overflow + 2.0, ease.inOut);
  const qOut = prog(t, C.unfreeze, C.unfreeze + 0.25, ease.in);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: CX - PAGE_W / 2,
          top: STORY_PAGE_TOP,
          transform: `scale(${lerp(0.88, 1, forward) * zoom})`,
          transformOrigin: "50% 50%",
          filter: forward < 0.98 ? `blur(${((1 - forward) * 14).toFixed(1)}px)` : undefined,
          opacity: lerp(0.32, 1, Math.min(1, forward * 1.3)),
        }}
      >
        <Page
          id="revealpage"
          level={0.16}
          stamp={`${copy.openLoop.genPrefix}9`}
          seed={59}
          mode="jackrabbit"
          typed={typed}
          scroll={scroll}
          cursorOn={cursorOn}
        />
      </div>

      {qOut < 1 ? <QuestionCard t={t} out={qOut} /> : null}

      {/* credit under the page */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1000,
          top: STORY_PAGE_TOP + PAGE_H + 14,
          textAlign: "center",
          fontFamily: FONTS.mono,
          fontWeight: 500,
          fontSize: 24,
          lineHeight: 1.35,
          color: COLORS.grey,
          opacity: prog(t, C.typeStart + 0.4, C.typeStart + 0.8),
        }}
      >
        {copy.reveal.credit.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>

      {/* rabbits multiplying */}
      {SPOTS.map(([x, y, size, flip], i) => {
        const st = startOf(i);
        if (t < st) return null;
        const s = springAt(t, st, { damping: 9, stiffness: 220 });
        const ph = rand(i * 4.4) * Math.PI * 2;
        const hop = Math.abs(Math.sin((t - st) * Math.PI * 2.3 + ph));
        const squash = 1 - 0.08 * (1 - hop);
        const color = i % 3 === 0 ? COLORS.yellow : COLORS.text;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y - hop * 30,
              transform: `scale(${s * (flip ? -1 : 1)}, ${s * squash})`,
              transformOrigin: "50% 100%",
              filter: `drop-shadow(0 ${10 + hop * 14}px 12px rgba(0,0,0,0.55))`,
            }}
          >
            <Rabbit size={size} color={color} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
