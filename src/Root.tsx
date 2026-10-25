import React from "react";
// REELS:IMPORTS (scripts/new-reel.mjs adds lines above the END marker)
import { Template } from "./reels/_template";
import { ModelCollapse } from "./reels/model-collapse";
// REELS:IMPORTS:END

export const RemotionRoot: React.FC = () => (
  <>
    {/* REELS:LIST */}
    <Template />
    <ModelCollapse />
    {/* REELS:LIST:END */}
  </>
);
