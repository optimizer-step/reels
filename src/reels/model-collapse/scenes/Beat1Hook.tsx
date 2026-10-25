import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { ease, lerp, prog, rand, springAt } from "../../../kit/anim";
import { LightBar } from "../../../kit/components/LightBar";
import { Headline } from "../../../kit/components/Headline";
import { Page, PAGE_H, PAGE_W } from "../Page";
import { copy } from "../copy";
import { COLORS, CX } from "../../../kit/theme";
import { ASSETS, BROLL, CUES } from "../timeline";

const C = CUES.hook;
export const HOOK_PAGE_TOP = 560;
const SLOT_Y = 1446;

/** Copier body with the glowing slot the page comes out of. */
const Copier: React.FC<{ t: number }> = ({ t }) => {
  const glow = 0.65 + 0.35 * Math.sin(t * 9);
  return (
    <>
      {/* light spill from the slot onto the page */}
      <div
        style={{
          position: "absolute",
          left: CX - 420,
          width: 840,
          top: SLOT_Y - 160,
          height: 200,
          background: "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(255,226,140,0.35), rgba(255,214,10,0) 70%)",
          opacity: glow,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CX - 410,
          width: 820,
          top: SLOT_Y - 6,
          height: 260,
          borderRadius: "26px 26px 0 0",
          background: "linear-gradient(to bottom, #24242c 0%, #17171d 18%, #101015 100%)",
          boxShadow: "0 -2px 0 rgba(255,255,255,0.12) inset, 0 -30px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* slot */}
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: 12,
            height: 22,
            borderRadius: 11,
            background: "#050507",
            boxShadow: "inset 0 4px 10px rgba(0,0,0,0.9)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              top: 9,
              height: 4,
              borderRadius: 2,
              background: "#fff6d6",
              boxShadow: `0 0 18px 6px rgba(255,214,10,${0.55 * glow})`,
            }}
          />
        </div>
        {/* panel details */}
        <div style={{ position: "absolute", left: 60, top: 70, width: 140, height: 10, borderRadius: 5, background: "#2b2b34" }} />
        <div style={{ position: "absolute", left: 60, top: 92, width: 90, height: 10, borderRadius: 5, background: "#2b2b34" }} />
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 66,
            width: 22,
            height: 22,
            borderRadius: 11,
            background: COLORS.yellow,
            boxShadow: `0 0 16px ${COLORS.yellow}`,
            opacity: 0.5 + 0.5 * glow,
          }}
        />
      </div>
    </>
  );
};

/** Where the hook page is at time t (shared with the loop ending so the last frame matches the first). */
export const hookPageState = (t: number) => {
  let cur = C.copyFlips[0];
  for (const f of C.copyFlips) if (t >= f.t) cur = f;
  const prevIdx = Math.max(0, C.copyFlips.indexOf(cur) - 1);
  const prevLevel = C.copyFlips[prevIdx].level;
  const lv = lerp(prevLevel, cur.level, prog(t, cur.t, cur.t + 0.14, ease.out));
  const emerge = prog(t, -0.6, 0.75, ease.out);
  const kick = cur.t > 0 ? 1 - springAt(t, cur.t, { damping: 12, stiffness: 240 }) : 0;
  return { cur, level: lv, emerge, kick };
};

export const Beat1Hook: React.FC<{ t: number; frozen?: boolean }> = ({ t: tIn, frozen = false }) => {
  const t = frozen ? 0 : tIn;
  const { cur, level, emerge, kick } = hookPageState(t);
  const top = lerp(1280, HOOK_PAGE_TOP, emerge) + kick * 46;
  const rot = (rand(cur.n * 3.7) - 0.5) * 3 - kick * 1.2;
  const flipsSoFar = C.copyFlips.filter((f) => t >= f.t && f.t > 0).length;
  // quick scan bar across the page on every new copy
  const scanP = cur.t > 0 ? prog(t, cur.t, cur.t + 0.26, ease.inOut) : 1;

  return (
    <AbsoluteFill>
      {/* earlier copies piling up behind */}
      {Array.from({ length: flipsSoFar }, (_, k) => {
        const age = flipsSoFar - k;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: CX - PAGE_W / 2 - age * 16,
              top: HOOK_PAGE_TOP - age * 12,
              width: PAGE_W,
              height: SLOT_Y - HOOK_PAGE_TOP + age * 12,
              background: `rgb(${200 - age * 22},${196 - age * 22},${188 - age * 22})`,
              transform: `rotate(${(rand(k * 5.1) - 0.5) * 6 - age}deg)`,
              transformOrigin: "50% 100%",
              borderRadius: 4,
              opacity: Math.max(0, 0.75 - age * 0.12),
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          />
        );
      })}

      {/* the page, clipped by the copier slot */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: SLOT_Y + 6, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: CX - PAGE_W / 2,
            top,
            transform: `rotate(${rot}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          <Page
            id="hookpage"
            level={level}
            stamp={`${copy.hook.stampPrefix}${cur.n}`}
            stampPunch={kick}
            seed={cur.n * 13}
            mode="original"
          />
          {scanP < 1 ? (
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <LightBar y={lerp(-60, PAGE_H + 60, scanP)} width={PAGE_W} height={160} intensity={0.85} />
            </div>
          ) : null}
        </div>
      </div>

      <Copier t={t} />

      <Headline t={t} start={C.headline} stagger={C.wordStagger} lines={copy.hook.headline} top={250} size={104} />

      {BROLL.copier && !frozen && t < C.brollCopierEnd ? (
        <AbsoluteFill>
          <OffthreadVideo src={staticFile(`${ASSETS}/broll/copier.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
