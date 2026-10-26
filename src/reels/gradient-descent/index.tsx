import React from "react";
import { Composition, Folder, Still } from "remotion";
import { HEIGHT, WIDTH } from "../../kit";
import { GradientDescentCover, GradientDescentReel } from "./Reel";
import { DURATION_FRAMES, FPS } from "./timeline";
export const GradientDescent: React.FC = () => (
  <Folder name="gradient-descent">
    <Composition id="GradientDescent" component={GradientDescentReel} durationInFrames={DURATION_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="GradientDescent-Cover" component={GradientDescentCover} width={WIDTH} height={HEIGHT} />
  </Folder>
);
