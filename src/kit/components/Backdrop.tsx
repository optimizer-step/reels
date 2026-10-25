import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";

/** House background: near-black, a faint drifting dot grid and a soft warm glow up top. */
export const Backdrop: React.FC<{ t: number; glow?: string }> = ({ t, glow = "rgba(255,214,10,0.06)" }) => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.075) 1.6px, rgba(0,0,0,0) 1.8px)",
        backgroundSize: "44px 44px",
        backgroundPosition: `${(t * 6) % 44}px ${(t * 3) % 44}px`,
        opacity: 0.9,
      }}
    />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 45% at 46% 18%, ${glow}, rgba(0,0,0,0) 70%)` }} />
  </AbsoluteFill>
);
