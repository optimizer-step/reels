import React from "react";
import { rand } from "../anim";

/**
 * Global degradation wrapper. d = 0 (clean) .. 1 (collapsed).
 * Blur, saturation loss, contrast, chromatic offset and frame jitter all scale with d.
 */
export const Degrade: React.FC<{ d: number; frame: number; children: React.ReactNode }> = ({
  d,
  frame,
  children,
}) => {
  const blur = d * 1.2;
  const sat = 1 - d * 0.75;
  const contrast = 1 + d * 0.22;
  const off = d * 3;
  const jx = d > 0.05 ? (rand(frame * 1.31) - 0.5) * 4 * d : 0;
  const jy = d > 0.05 ? (rand(frame * 2.17 + 9) - 0.5) * 4 * d : 0;
  const useChroma = off > 0.15;
  const filter = [
    useChroma ? "url(#chroma)" : "",
    blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "",
    `saturate(${sat.toFixed(3)})`,
    `contrast(${contrast.toFixed(3)})`,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="chroma" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={off} dy={0} result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
          <feOffset in="gb" dx={-off * 0.6} dy={0} result="gb2" />
          <feBlend in="r2" in2="gb2" mode="screen" />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter,
          transform: `translate(${jx.toFixed(2)}px, ${jy.toFixed(2)}px)`,
        }}
      >
        {children}
      </div>
    </>
  );
};
