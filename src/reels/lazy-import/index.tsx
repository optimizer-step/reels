import React from "react";
import { Composition, Folder, Still } from "remotion";
import { HEIGHT, WIDTH } from "../../kit/theme";
import { LazyImportCover, LazyImportReel } from "./Reel";
import { DURATION_FRAMES, FPS } from "./timeline";

export const LazyImport: React.FC = () => (
  <Folder name="lazy-import">
    <Composition id="LazyImport" component={LazyImportReel} durationInFrames={DURATION_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="LazyImport-Cover" component={LazyImportCover} width={WIDTH} height={HEIGHT} />
  </Folder>
);
