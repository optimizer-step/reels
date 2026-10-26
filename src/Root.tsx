import React from "react";
// REELS:IMPORTS (scripts/new-reel.mjs adds lines above the END marker)
import { Template } from "./reels/_template";
import { ModelCollapse } from "./reels/model-collapse";
import { AttentionBank } from "./reels/attention-bank";
import { GradientDescent } from "./reels/gradient-descent";
import { LazyImport } from "./reels/lazy-import";
// REELS:IMPORTS:END

export const RemotionRoot: React.FC = () => (
  <>
    {/* REELS:LIST */}
    <Template />
    <ModelCollapse />
    <AttentionBank />
    <GradientDescent />
    <LazyImport />
    {/* REELS:LIST:END */}
  </>
);
