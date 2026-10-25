import React from "react";
import { AbsoluteFill } from "remotion";
import { Rabbit } from "./Art";
import { Grain, Vignette } from "../../kit/components/Grain";
import { Headline } from "../../kit/components/Headline";
import { Page, PAGE_W } from "./Page";
import { copy } from "./copy";
import { ensureFonts } from "../../kit/fonts";
import { COLORS, CX, FONTS, SAFE } from "../../kit/theme";

ensureFonts();

export const ModelCollapseCover: React.FC = () => {
  const pageTop = 860;
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.075) 1.6px, rgba(0,0,0,0) 1.8px)",
          backgroundSize: "44px 44px",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 40% at 46% 30%, rgba(255,214,10,0.10), rgba(0,0,0,0) 70%)" }} />

      {/* rabbits peeking over the top edge of the page */}
      {[
        { x: CX - 210, size: 210, flip: false, rot: -10, dy: 0 },
        { x: CX + 10, size: 250, flip: true, rot: 2, dy: -24 },
        { x: CX + 215, size: 196, flip: true, rot: 12, dy: 18 },
      ].map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: r.x - r.size / 2,
            top: pageTop - r.size * 0.6 + r.dy,
            transform: `rotate(${r.rot}deg) scaleX(${r.flip ? -1 : 1})`,
            filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.6))",
          }}
        >
          <Rabbit size={r.size} color={i === 1 ? COLORS.yellow : COLORS.text} />
        </div>
      ))}

      <div style={{ position: "absolute", left: CX - PAGE_W / 2, top: pageTop, transform: "rotate(-4deg)", transformOrigin: "50% 0%" }}>
        <Page id="coverpage" level={0.82} stamp="COPY #9" seed={9 * 13} mode="original" />
      </div>

      {/* HUD */}
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.top + 6,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "6px 22px 6px 18px",
          borderRadius: 16,
          background: "rgba(11,11,15,0.72)",
          border: `2px solid ${COLORS.red}55`,
          fontFamily: FONTS.mono,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: "60px",
          color: COLORS.red,
        }}
      >
        <div style={{ width: 16, height: 16, borderRadius: 8, background: COLORS.red, boxShadow: `0 0 14px ${COLORS.red}` }} />
        {copy.cover.hud}
      </div>

      <Headline t={10} start={0} lines={copy.cover.headline} top={330} size={124} lineHeight={0.98} static />

      <Grain frame={7} light={0.12} dark={0.16} id="covergrain" />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
