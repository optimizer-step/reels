import React from "react";
import { COLORS } from "../theme";

/** Simple robot face icon. */
export const RobotIcon: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = COLORS.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <path d="M 28 4 L 28 12" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
    <circle cx="28" cy="4" r="3.5" fill={color} />
    <rect x="8" y="13" width="40" height="32" rx="9" fill="none" stroke={color} strokeWidth={3.5} />
    <circle cx="20" cy="28" r="4.5" fill={color} />
    <circle cx="36" cy="28" r="4.5" fill={color} />
    <path d="M 20 38 L 36 38" stroke={color} strokeWidth={3} strokeLinecap="round" />
    <path d="M 4 25 L 4 33 M 52 25 L 52 33" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
  </svg>
);

/** Globe icon. */
export const GlobeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = COLORS.text }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth={3.2} />
    <ellipse cx="28" cy="28" rx="10" ry="22" fill="none" stroke={color} strokeWidth={2.6} />
    <path d="M 6 28 L 50 28 M 10 17 L 46 17 M 10 39 L 46 39" stroke={color} strokeWidth={2.4} />
  </svg>
);

/** Right-pointing arrow for inline step labels (font subsets lack the → glyph). */
export const Arrow: React.FC<{ width?: number; color?: string; strokeWidth?: number }> = ({
  width = 54,
  color = COLORS.grey,
  strokeWidth = 4,
}) => (
  <svg width={width} height={24} viewBox={`0 0 ${width} 24`} style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path
      d={`M 2 12 L ${width - 6} 12 M ${width - 16} 3 L ${width - 4} 12 L ${width - 16} 21`}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Downward arrow (e.g. "Comment below"). */
export const DownArrow: React.FC<{ color?: string; bounce?: number }> = ({ color = COLORS.yellow, bounce = 0 }) => (
  <svg width={44} height={56} viewBox="0 0 44 56" style={{ transform: `translateY(${bounce}px)` }}>
    <path d="M 22 4 L 22 48 M 6 32 L 22 50 L 38 32" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
