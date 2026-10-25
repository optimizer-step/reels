import React from "react";
import { Composition, Folder, Still } from "remotion";
import { HEIGHT, WIDTH } from "../../kit/theme";
import { AttentionBankCover } from "./Cover";
import { AttentionBankReel } from "./Reel";
import { DURATION_FRAMES, FPS } from "./timeline";

/** Reel 002 — "SBI or river bank? How AI decides" (attention). */
export const AttentionBank: React.FC = () => (
  <Folder name="attention-bank">
    <Composition id="AttentionBank" component={AttentionBankReel} durationInFrames={DURATION_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="AttentionBank-Cover" component={AttentionBankCover} width={WIDTH} height={HEIGHT} />
  </Folder>
);
