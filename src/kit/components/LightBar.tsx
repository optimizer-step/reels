import React from "react";
import { WIDTH } from "../theme";

/** The photocopier light bar: a bright horizontal band with a warm glow. y is the band centre. */
export const LightBar: React.FC<{ y: number; intensity?: number; height?: number; width?: number; left?: number }> = ({
  y,
  intensity = 1,
  height = 300,
  width = WIDTH,
  left = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left,
      width,
      top: y - height / 2,
      height,
      pointerEvents: "none",
      mixBlendMode: "screen",
      opacity: intensity,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(to bottom, rgba(255,214,10,0) 0%, rgba(255,214,10,0.10) 30%, rgba(255,236,170,0.55) 47%, rgba(255,255,255,1) 50%, rgba(255,236,170,0.55) 53%, rgba(255,214,10,0.10) 70%, rgba(255,214,10,0) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: height / 2 - 3,
        height: 6,
        background: "#fff",
        boxShadow: "0 0 30px 12px rgba(255,236,170,0.9), 0 0 120px 40px rgba(255,214,10,0.35)",
      }}
    />
  </div>
);
