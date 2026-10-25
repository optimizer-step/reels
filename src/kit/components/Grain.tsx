import React from "react";
import { HEIGHT, WIDTH } from "../theme";

/** Animated film grain from SVG feTurbulence; a new seed every frame. */
export const Grain: React.FC<{ frame: number; light: number; dark: number; id?: string }> = ({
  frame,
  light,
  dark,
  id = "grain",
}) => {
  const seed = (frame * 7919) % 1000;
  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox="0 0 720 1280"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter id={`${id}-f`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={seed} result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.6 0 0 0 -1.15"
            result="w"
          />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 2.6 0 0 -1.2"
            result="b"
          />
          <feComponentTransfer in="w" result="w2">
            <feFuncA type="linear" slope={light} />
          </feComponentTransfer>
          <feComponentTransfer in="b" result="b2">
            <feFuncA type="linear" slope={dark} />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="w2" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="720" height="1280" filter={`url(#${id}-f)`} />
    </svg>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background: `radial-gradient(ellipse 75% 60% at 46% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);
