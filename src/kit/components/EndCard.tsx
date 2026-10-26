import React from "react";
import { Img, staticFile } from "remotion";
import { clamp01, ease, lerp, prog, springAt } from "../anim";
import { CX, COLORS, FONTS } from "../theme";
import { Burst } from "./Effects";

/**
 * Brand end card: the Optimizer Step logo reveals (circular wipe, light sweep round the ring,
 * a spark running down the logo's gradient-descent path, a shine across the wordmark), then a
 * Follow button pops in and gets tapped, turning into "Following".
 *
 * Times are seconds after `t0`. Use END_CARD to cue sounds; total length END_CARD.length.
 */
export const END_CARD = {
  logo: 0,
  button: 0.95,
  press: 1.55,
  following: 1.66,
  length: 2.7,
};

const LOGO_SRC = "brand/optimizer-step-logo.png";
const LOGO_BG = "rgb(1,8,19)"; // the artwork's background colour
const SIZE = 1254; // source pixels
// measured on the source image: the ring, and the balls on the descent path
const RING = { cx: 627, cy: 562, r: 505 };
const PATH = [
  [355, 236],
  [437, 326],
  [512, 426],
  [594, 536],
  [678, 641],
  [766, 764],
];

export const EndCard: React.FC<{
  t: number;
  t0: number;
  /** logo width on screen (px) */
  width?: number;
  top?: number;
  label?: string;
  doneLabel?: string;
}> = ({ t, t0, width = 820, top = 330, label = "Follow", doneLabel = "Following" }) => {
  const lt = t - t0;
  if (lt < -0.05) return null;
  const k = width / SIZE;
  const left = CX - width / 2;
  const P = (x: number, y: number) => [left + x * k, top + y * k];

  // logo reveal
  const rev = prog(lt, 0, 0.6, ease.out);
  const scale = lerp(1.14, 1, prog(lt, 0, 0.9, ease.out));
  const blur = (1 - prog(lt, 0, 0.45, ease.out)) * 14;
  // ring light sweep (once round, fading)
  const sweep = prog(lt, 0.1, 1.0, ease.inOut);
  const sweepO = Math.sin(Math.PI * clamp01(sweep)) * 0.9;
  const [rcx, rcy] = P(RING.cx, RING.cy);
  const rr = RING.r * k;
  const circ = 2 * Math.PI * rr;
  // spark down the descent path
  const spark = prog(lt, 0.35, 1.05, ease.inOut);
  const seg = spark * (PATH.length - 1);
  const i0 = Math.min(PATH.length - 2, Math.floor(seg));
  const f = seg - i0;
  const [sx, sy] = P(lerp(PATH[i0][0], PATH[i0 + 1][0], f), lerp(PATH[i0][1], PATH[i0 + 1][1], f));
  const sparkO = spark > 0 && spark < 1 ? 1 : spark >= 1 ? 1 - prog(lt, 1.05, 1.4) : 0;
  // shine across the wordmark
  const shine = prog(lt, 0.55, 1.15, ease.inOut);

  // follow button
  const bIn = springAt(lt, END_CARD.button, { damping: 12, stiffness: 210 });
  const press = lt >= END_CARD.press ? Math.sin(Math.PI * clamp01((lt - END_CARD.press) / 0.22)) : 0;
  const done = lt >= END_CARD.following;
  const doneS = springAt(lt, END_CARD.following, { damping: 11, stiffness: 260 });
  const btnW = done ? lerp(330, 400, clamp01(doneS)) : 330;
  const btnTop = top + width + 30;
  // tapping finger (a soft white dot) glides in, presses, lifts away
  const fIn = prog(lt, END_CARD.button + 0.2, END_CARD.press, ease.out);
  const fOut = prog(lt, END_CARD.following + 0.04, END_CARD.following + 0.34, ease.in);
  const fx = lerp(CX + 260, CX + 70, fIn) + 120 * fOut;
  const fy = lerp(btnTop + 260, btnTop + 52, fIn) + 160 * fOut;
  const fO = Math.min(fIn * 1.5, 1 - fOut);
  const ripple = lt >= END_CARD.press ? prog(lt, END_CARD.press, END_CARD.press + 0.5, ease.out) : 0;

  const fadeEdge = "linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 6%, #000 94%, transparent 100%)";
  return (
    <>
      {/* the frame takes on the logo's own navy, so the artwork has no visible edge */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 90% 60% at ${(CX / 1080) * 100}% ${((top + width * 0.45) / 1920) * 100}%, ${LOGO_BG} 0%, ${LOGO_BG} 55%, #05070d 100%)`, opacity: prog(lt, -0.05, 0.35) }} />
      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          height: width,
          transform: `scale(${scale})`,
          filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
          clipPath: `circle(${(rev * 75).toFixed(1)}% at 50% 45%)`,
          WebkitMaskImage: fadeEdge,
          WebkitMaskComposite: "source-in",
          maskImage: fadeEdge,
          maskComposite: "intersect",
        }}
      >
        <Img src={staticFile(LOGO_SRC)} style={{ width: "100%", height: "100%" }} />
        {/* shine band across the wordmark */}
        {shine > 0 && shine < 1 ? (
          <div
            style={{
              position: "absolute",
              left: 60 * k,
              top: 935 * k,
              width: (1194 - 60) * k,
              height: (1110 - 935) * k,
              background: `linear-gradient(105deg, rgba(255,255,255,0) ${shine * 140 - 30}%, rgba(255,255,255,0.55) ${shine * 140 - 15}%, rgba(255,255,255,0) ${shine * 140}%)`,
              mixBlendMode: "overlay",
            }}
          />
        ) : null}
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", transform: `scale(${scale})`, transformOrigin: `${CX}px ${top + width / 2}px` }}>
        <defs>
          <filter id="endcard-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <linearGradient id="endcard-ring" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#4DA3FF" />
            <stop offset="1" stopColor="#FFB340" />
          </linearGradient>
        </defs>
        {sweepO > 0.01 ? (
          <g opacity={sweepO} style={{ mixBlendMode: "screen" }}>
            <circle
              cx={rcx}
              cy={rcy}
              r={rr}
              fill="none"
              stroke="url(#endcard-ring)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${circ * 0.16} ${circ}`}
              strokeDashoffset={-circ * (sweep * 1.05 - 0.25)}
              filter="url(#endcard-glow)"
            />
            <circle cx={rcx} cy={rcy} r={rr} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeDasharray={`${circ * 0.08} ${circ}`} strokeDashoffset={-circ * (sweep * 1.05 - 0.21)} />
          </g>
        ) : null}
        {sparkO > 0.01 ? (
          <g opacity={sparkO} style={{ mixBlendMode: "screen" }}>
            <circle cx={sx} cy={sy} r={34} fill="#FFC14D" opacity={0.6} filter="url(#endcard-glow)" />
            <circle cx={sx} cy={sy} r={9} fill="#FFFFFF" />
          </g>
        ) : null}
      </svg>

      {/* Follow button */}
      {bIn > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: CX - btnW / 2,
            top: btnTop,
            width: btnW,
            height: 104,
            borderRadius: 52,
            background: done ? "rgba(20,20,26,0.95)" : COLORS.yellow,
            border: `3px solid ${done ? "rgba(255,255,255,0.28)" : COLORS.yellow}`,
            boxShadow: done ? "none" : `0 0 ${30 + 30 * press}px ${COLORS.yellow}88`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            fontFamily: FONTS.head,
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: "-0.01em",
            color: done ? COLORS.text : COLORS.bg,
            opacity: Math.min(1, bIn * 1.6),
            transform: `translateY(${(1 - bIn) * 50}px) scale(${(0.7 + 0.3 * bIn) * (1 - 0.08 * press)})`,
          }}
        >
          {done ? (
            <svg width={40} height={40} viewBox="0 0 40 40" style={{ transform: `scale(${clamp01(doneS)})` }}>
              <path d="M 8 21 L 17 30 L 33 11" fill="none" stroke={COLORS.yellow} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width={34} height={34} viewBox="0 0 34 34">
              <path d="M 17 5 V 29 M 5 17 H 29" stroke={COLORS.bg} strokeWidth={6} strokeLinecap="round" />
            </svg>
          )}
          {done ? doneLabel : label}
        </div>
      ) : null}
      {ripple > 0 && ripple < 1 ? (
        <div style={{ position: "absolute", left: CX - 165 - 60 * ripple, top: btnTop - 60 * ripple, width: 330 + 120 * ripple, height: 104 + 120 * ripple, borderRadius: 120, border: `3px solid ${COLORS.yellow}`, opacity: 1 - ripple }} />
      ) : null}
      <Burst t={t} t0={t0 + END_CARD.following} x={CX} y={btnTop + 52} color={COLORS.yellow} radius={240} count={22} seed={21} dur={0.7} />
      {fO > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: fx - 34,
            top: fy - 34,
            width: 68,
            height: 68,
            borderRadius: 34,
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 0 10px rgba(255,255,255,0.18)",
            opacity: fO,
            transform: `scale(${1 - 0.25 * press})`,
          }}
        />
      ) : null}
    </>
  );
};
