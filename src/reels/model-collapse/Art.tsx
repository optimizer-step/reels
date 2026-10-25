import React from "react";
import { COLORS } from "../../kit/theme";

/** Line drawing of a Gothic parish church tower. */
export const Tower: React.FC<{ width?: number; stroke?: string; draw?: number }> = ({
  width = 230,
  stroke = "#222",
  draw = 1,
}) => {
  const h = (width / 220) * 330;
  const dash = 1400;
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeDasharray: dash,
    strokeDashoffset: dash * (1 - draw),
  };
  const lancet = (x: number, y: number, w: number, hh: number) =>
    `M ${x} ${y + hh} L ${x} ${y + w * 0.6} Q ${x} ${y} ${x + w / 2} ${y - w * 0.15} Q ${x + w} ${y} ${x + w} ${y + w * 0.6} L ${x + w} ${y + hh} Z`;
  return (
    <svg width={width} height={h} viewBox="0 0 220 330">
      {/* nave roofs either side */}
      <path d="M 2 326 L 2 262 L 62 228" {...common} />
      <path d="M 218 326 L 218 262 L 158 228" {...common} />
      <path d="M 14 326 L 14 268" {...common} strokeWidth={1.4} />
      <path d="M 206 326 L 206 268" {...common} strokeWidth={1.4} />
      {/* tower body */}
      <path d="M 62 326 L 62 122 L 158 122 L 158 326" {...common} />
      {/* buttress lines */}
      <path d="M 70 326 L 70 132 M 150 326 L 150 132" {...common} strokeWidth={1.3} />
      {/* parapet battlements */}
      <path d="M 58 122 L 58 108 L 68 108 L 68 116 L 78 116 L 78 108 L 90 108 L 90 116 L 100 116 L 100 108 L 120 108 L 120 116 L 130 116 L 130 108 L 142 108 L 142 116 L 152 116 L 152 108 L 162 108 L 162 122" {...common} />
      {/* corner pinnacles */}
      <path d="M 56 108 L 61 76 L 66 108 M 154 108 L 159 76 L 164 108" {...common} />
      {/* spire */}
      <path d="M 74 108 L 110 6 L 146 108" {...common} />
      <path d="M 110 6 L 110 -4" {...common} />
      {/* spire hatching */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M ${116 + i * 4} ${30 + i * 11} L ${120 + i * 4} ${48 + i * 11}`} {...common} strokeWidth={1.1} />
      ))}
      {/* spire lucarne */}
      <path d={lancet(102, 62, 16, 22)} {...common} strokeWidth={1.6} />
      {/* belfry lancets */}
      <path d={lancet(80, 140, 22, 52)} {...common} fill="#2a2a2a" />
      <path d={lancet(118, 140, 22, 52)} {...common} fill="#2a2a2a" />
      {/* string courses */}
      <path d="M 62 204 L 158 204 M 62 270 L 158 270" {...common} strokeWidth={1.6} />
      {/* clock */}
      <circle cx="110" cy="237" r="17" {...common} />
      <path d="M 110 237 L 110 225 M 110 237 L 118 241" {...common} strokeWidth={1.8} />
      {/* door */}
      <path d={lancet(94, 286, 32, 40)} {...common} fill="#3a3a3a" />
      {/* ground */}
      <path d="M -6 327 L 226 327" {...common} strokeWidth={1.8} />
    </svg>
  );
};

/** Stylised jackrabbit silhouette facing right. */
export const Rabbit: React.FC<{ size?: number; color?: string; eye?: string }> = ({
  size = 110,
  color = COLORS.text,
  eye = COLORS.bg,
}) => (
  <svg width={size} height={(size / 120) * 104} viewBox="0 0 120 104" style={{ overflow: "visible" }}>
    <g fill={color}>
      <ellipse cx="84" cy="22" rx="6" ry="24" transform="rotate(-14 84 22)" />
      <ellipse cx="94" cy="21" rx="5.5" ry="23" transform="rotate(9 94 21)" />
      <ellipse cx="57" cy="66" rx="34" ry="23" />
      <ellipse cx="40" cy="71" rx="24" ry="23" />
      <ellipse cx="88" cy="48" rx="18" ry="14.5" transform="rotate(14 88 48)" />
      <circle cx="16" cy="58" r="8.5" />
      <ellipse cx="79" cy="88" rx="5.5" ry="11" />
      <ellipse cx="44" cy="94" rx="22" ry="5.5" />
    </g>
    <circle cx="95" cy="44" r="2.6" fill={eye} />
    <ellipse cx="84" cy="22" rx="2" ry="15" transform="rotate(-14 84 22)" fill={eye} opacity={0.25} />
  </svg>
);
