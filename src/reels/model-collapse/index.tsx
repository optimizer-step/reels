import React from "react";
import { Composition, Folder, Still } from "remotion";
import { HEIGHT, WIDTH } from "../../kit/theme";
import { ModelCollapseCover } from "./Cover";
import { ModelCollapseReel } from "./Reel";
import { DURATION_FRAMES, FPS } from "./timeline";

/** Reel 001 — "AI is eating its own homework" (model collapse, Shumailov et al., Nature 2024). */
export const ModelCollapse: React.FC = () => (
  <Folder name="model-collapse">
    <Composition id="ModelCollapse" component={ModelCollapseReel} durationInFrames={DURATION_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="ModelCollapse-Cover" component={ModelCollapseCover} width={WIDTH} height={HEIGHT} />
  </Folder>
);
