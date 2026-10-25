import React from "react";
import { CX, COLORS, FONTS } from "../theme";

/** Geometry of the bell curve on the 1080x1920 canvas. */
export const CURVE = {
  cx: CX,
  base: 1140,
  unit: 107.5, // px per standard deviation of the ORIGINAL distribution
  halfU: 4,
  peak0: 300,
  maxH: 590,
  tail: 1.5, // |x| beyond this (in original sigmas) counts as "rare"
};

const pdf = (u: number, s: number) => Math.exp(-0.5 * (u / s) * (u / s)) / s;
export const heightAt = (u: number, s: number) => {
  const raw = CURVE.peak0 * pdf(u, s);
  return CURVE.maxH * Math.tanh(raw / CURVE.maxH);
};
export const px = (u: number) => CURVE.cx + u * CURVE.unit;

const erfc = (x: number) => {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
};
/** Share of the rare tails still present, relative to the original (1 = all, 0 = gone). */
export const tailRatio = (s: number) => erfc(CURVE.tail / s / Math.SQRT2) / erfc(CURVE.tail / Math.SQRT2);

const pathFor = (s: number, from: number, to: number, n = 140) => {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = from + ((to - from) * i) / n;
    pts.push(`${px(u).toFixed(1)},${(CURVE.base - heightAt(u, s)).toFixed(1)}`);
  }
  return pts;
};

/** A normal distribution with shaded "rare" tails. sigma < 1 narrows it (tails shrink first). */
export const BellCurve: React.FC<{
  sigma: number;
  draw: number;
  fill: number;
  labels: number;
  stroke?: string;
  glow?: number;
  outlineOnly?: boolean;
  axis?: number;
  centreLabel?: string;
  tailLabel?: string;
  tailColor?: string;
}> = ({
  sigma,
  draw,
  fill,
  labels,
  stroke = COLORS.text,
  glow = 0.5,
  outlineOnly = false,
  axis = 1,
  centreLabel = "COMMON",
  tailLabel = "RARE",
  tailColor = COLORS.yellow,
}) => {
  const H = CURVE.halfU;
  const outline = `M ${pathFor(sigma, -H, H, 220).join(" L ")}`;
  const area = (a: number, b: number) => `M ${px(a)},${CURVE.base} L ${pathFor(sigma, a, b, 80).join(" L ")} L ${px(b)},${CURVE.base} Z`;
  const tr = tailRatio(sigma);
  const tailOpacity = fill * (0.25 + 0.75 * Math.pow(tr, 0.35));
  const len = 2600;
  if (outlineOnly) {
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={outline} fill="none" stroke={stroke} strokeWidth={4} strokeDasharray="14 12" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="centreFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.22} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.08} />
        </linearGradient>
        <filter id="curveGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <line x1={px(-H) - 10} y1={CURVE.base} x2={px(H) + 10} y2={CURVE.base} stroke={COLORS.grey} strokeWidth={3} opacity={0.7 * draw * axis} />
      {[-3, -2, -1, 0, 1, 2, 3].map((u) => (
        <line key={u} x1={px(u)} x2={px(u)} y1={CURVE.base} y2={CURVE.base + 12} stroke={COLORS.grey} strokeWidth={2} opacity={0.6 * draw * axis} />
      ))}
      <path d={area(-CURVE.tail, CURVE.tail)} fill="url(#centreFill)" opacity={fill} />
      <path d={area(-H, -CURVE.tail)} fill={tailColor} opacity={tailOpacity * 0.85} />
      <path d={area(CURVE.tail, H)} fill={tailColor} opacity={tailOpacity * 0.85} />
      <path d={outline} fill="none" stroke={stroke} strokeWidth={14} opacity={glow * 0.35} filter="url(#curveGlow)" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      <path d={outline} fill="none" stroke={stroke} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      <g fontFamily={FONTS.mono} fontWeight={700} fontSize={30} textAnchor="middle" opacity={labels}>
        <text x={CURVE.cx} y={CURVE.base + 74} fill={COLORS.text} letterSpacing="2">
          {centreLabel}
        </text>
        <text x={px(-2.75)} y={CURVE.base + 74} fill={tailColor} letterSpacing="2" opacity={0.3 + 0.7 * Math.pow(tr, 0.4)}>
          {tailLabel}
        </text>
        <text x={px(2.75)} y={CURVE.base + 74} fill={tailColor} letterSpacing="2" opacity={0.3 + 0.7 * Math.pow(tr, 0.4)}>
          {tailLabel}
        </text>
      </g>
    </svg>
  );
};
