import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, prog } from "../../../kit/anim";
import { CurveStage } from "../CurveStage";
import { Headline } from "../../../kit/components/Headline";
import { copy } from "../copy";
import { BEATS, CUES } from "../timeline";

const C = CUES.rehook;

export const curveIntro = (t: number) => ({
  draw: prog(t, C.draw, C.draw + 1.1, ease.inOut),
  fill: prog(t, C.draw + 0.7, C.draw + 1.3),
  labels: prog(t, C.draw + 1.0, C.draw + 1.4),
});

export const Beat6Rehook: React.FC<{ t: number }> = ({ t }) => {
  const { draw, fill, labels } = curveIntro(t);
  return (
    <AbsoluteFill>
      <CurveStage t={t} draw={draw} fill={fill} labels={labels} />
      <Headline t={t} start={C.headline} lines={copy.rehook.headline} top={330} size={98} stagger={0.14} exit={BEATS.whyCare.start - 0.3} />
    </AbsoluteFill>
  );
};
