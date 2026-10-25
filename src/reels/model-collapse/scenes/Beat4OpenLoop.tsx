import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, lerp, prog, rand, springAt } from "../../../kit/anim";
import { Page, PAGE_W } from "../Page";
import { copy } from "../copy";
import { COLORS, CX, FONTS } from "../../../kit/theme";
import { BEATS, CUES } from "../timeline";

const C = CUES.openLoop;
export const STORY_PAGE_TOP = 344;

/** Gen shown on the page while the counter races (0 before the race). */
export const raceGen = (t: number) => {
  if (t < C.raceStart) return 0;
  return Math.min(9, 4 + Math.floor((t - C.raceStart) / C.raceStep));
};

/** The big "GEN 9: ?" card shown during the silence beat. */
export const QuestionCard: React.FC<{ t: number; out?: number }> = ({ t, out = 0 }) => {
  const s = springAt(t, C.freeze + 0.04);
  const pulse = t >= C.pulse ? 1 + 0.28 * Math.sin(prog(t, C.pulse, C.pulse + 0.45) * Math.PI) : 1;
  if (s <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1000,
        top: 690,
        textAlign: "center",
        fontFamily: FONTS.head,
        fontWeight: 700,
        fontSize: 168,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        color: COLORS.text,
        opacity: Math.min(s, 1 - out),
        transform: `scale(${(0.7 + 0.3 * s) * (1 + out * 0.4)})`,
        textShadow: "0 10px 60px rgba(0,0,0,0.8)",
        whiteSpace: "nowrap",
      }}
    >
      {copy.openLoop.question}{" "}
      <span style={{ display: "inline-block", color: COLORS.yellow, transform: `scale(${pulse})`, textShadow: `0 0 50px ${COLORS.yellow}77` }}>
        {copy.openLoop.mark}
      </span>
    </div>
  );
};

export const Beat4OpenLoop: React.FC<{ t: number }> = ({ t }) => {
  const enter = springAt(t, BEATS.openLoop.start, { damping: 16, stiffness: 120 });
  const gen = raceGen(t);
  const tickT = gen > 0 ? C.raceStart + (gen - 4) * C.raceStep : -10;
  const kick = gen > 0 ? 1 - prog(t, tickT, tickT + 0.14, ease.out) : 0;
  const jx = kick * (rand(gen * 3.1) - 0.5) * 30;
  const jy = kick * (rand(gen * 5.7) - 0.5) * 22;
  const jr = kick * (rand(gen * 1.9) - 0.5) * 3;
  const level = gen > 0 ? lerp(0.05, 0.4, (gen - 3) / 6) : 0;
  const freeze = prog(t, C.freeze, C.freeze + 0.35, ease.out);
  const drift = 1 + 0.025 * prog(t, BEATS.openLoop.start, C.freeze, (x) => x);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: CX - PAGE_W / 2,
          top: STORY_PAGE_TOP,
          transform: `translate(${jx}px, ${(1 - enter) * 900 + jy}px) rotate(${jr + (1 - enter) * 6}deg) scale(${drift * lerp(1, 0.88, freeze)})`,
          transformOrigin: "50% 50%",
          filter: freeze > 0 ? `blur(${(freeze * 14).toFixed(1)}px)` : undefined,
          opacity: lerp(1, 0.32, freeze),
        }}
      >
        <Page id="storypage" level={level} stamp={`${copy.openLoop.genPrefix}${gen}`} stampPunch={kick} seed={50 + gen} mode="original" />
      </div>
      <QuestionCard t={t} />
    </AbsoluteFill>
  );
};
