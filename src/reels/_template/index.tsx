import React from "react";
import { Composition, Folder, Still } from "remotion";
import { HEIGHT, WIDTH } from "../../kit/theme";
import { TemplateCover, TemplateReel } from "./Reel";
import { DURATION_FRAMES, FPS } from "./timeline";

export const Template: React.FC = () => (
  <Folder name="template">
    <Composition id="Template" component={TemplateReel} durationInFrames={DURATION_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="Template-Cover" component={TemplateCover} width={WIDTH} height={HEIGHT} />
  </Folder>
);
