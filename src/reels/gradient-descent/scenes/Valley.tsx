import React from "react";
import { AbsoluteFill } from "remotion";
import { Burst, COLORS, FONTS, FPS, Terrain, ease, lerp, makeProjector, prog, springAt, squashStretch, type V3 } from "../../../kit";
import { copy } from "../copy";
import { RATES, gradient, next, loss } from "../math";
import { BALL_R, HS, ballAt, hopPoint, pointsFor, sinceLanding, surfaceHeight, valleyState, world } from "../state";
import { BEATS, CUES } from "../timeline";

// floor = rich blue, walls fade to slate; the goal itself is lit by a separate yellow glow
const COLORS_RAMP: [number, number[]][] = [
  [0, [46, 104, 178]],
  [0.08, [36, 78, 138]],
  [0.25, [26, 46, 84]],
  [0.6, [30, 36, 54]],
  [1, [40, 44, 60]],
];
const CONTOURS = [0.15, 0.6, 1.4, 2.5, 4, 6, 8.5, 11.5, 15, 19.5, 25, 31, 38].map((L, i) => ({
  level: L * HS,
  color: i < 2 ? COLORS.yellow : "#9CC3F0",
  width: i < 2 ? 3.5 : 2.2,
  opacity: i < 2 ? 0.95 : Math.max(0.2, 0.6 - i * 0.035),
}));

/** Label pinned to a world point (follows the camera). */
const Pin: React.FC<{ p: { x: number; y: number }; text: string; color: string; o: number; dx?: number; dy?: number; size?: number; align?: "left" | "right" | "center" }> = ({
  p,
  text,
  color,
  o,
  dx = 0,
  dy = -60,
  size = 34,
  align = "center",
}) => {
  if (o <= 0.001) return null;
  const tx = align === "center" ? "-50%" : align === "right" ? "-100%" : "0";
  // leader line ends at the label's nearest edge (labels sit above or below their point)
  const y2 = dy < 0 ? p.y + dy + 22 : p.y + dy - size * 0.8;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
        <line x1={p.x} y1={p.y} x2={p.x + dx} y2={y2} stroke={color} strokeWidth={3} strokeDasharray="3 8" strokeLinecap="round" />
        <circle cx={p.x} cy={p.y} r={8} fill={color} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: p.x + dx,
          top: p.y + dy - size * 0.8,
          transform: `translateX(${tx}) translateY(${(1 - o) * 16}px)`,
          opacity: o,
          padding: "8px 18px",
          borderRadius: 14,
          background: "rgba(11,11,15,0.82)",
          border: `3px solid ${color}`,
          fontFamily: FONTS.mono,
          fontWeight: 700,
          fontSize: size,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </>
  );
};

/** A path drawn along the surface between two parameter points, as an arrow. */
const surfaceArrow = (project: (p: V3) => { x: number; y: number }, from: { x: number; y: number }, to: { x: number; y: number }, lift: number) => {
  const pts = Array.from({ length: 24 }, (_, i) => {
    const p = i / 23;
    const x = lerp(from.x, to.x, p);
    const y = lerp(from.y, to.y, p);
    return project(world(x, y, lift + 0.5 * Math.sin(Math.PI * p) * Math.min(1, Math.hypot(to.x - from.x, to.y - from.y) * 0.4)));
  });
  return pts;
};

export const Valley: React.FC<{ t: number; frame: number; sliderValue: number }> = ({ t, frame, sliderValue }) => {
  const st = valleyState(t);
  const { project } = makeProjector(st.cam);
  const reveal = 1;

  // ---- ball (with sub-frame motion blur) ----
  const ballScreen = (tt: number) => {
    const s2 = valleyState(tt);
    if (s2.run !== st.run) return null;
    const b = ballAt(s2.run, s2.s);
    return { b, p: project(b.w) };
  };
  const cur = ballScreen(t)!;
  // 180° shutter, but cap the smear (rewinds move the ball hundreds of px per frame)
  const probe = ballScreen(t - 0.5 / FPS);
  const span = probe ? Math.hypot(cur.p.x - probe.p.x, cur.p.y - probe.p.y) : 0;
  const shutter = (0.5 / FPS) * (span > 140 ? 140 / span : 1);
  const ghosts = Array.from({ length: 7 }, (_, i) => ballScreen(t - shutter * (i / 6))).filter(Boolean) as { b: ReturnType<typeof ballAt>; p: { x: number; y: number; k: number } }[];
  const speed = ghosts.length > 1 ? Math.hypot(ghosts[0].p.x - ghosts[ghosts.length - 1].p.x, ghosts[0].p.y - ghosts[ghosts.length - 1].p.y) : 0;
  const rpx = BALL_R * cur.p.k;
  const sq = squashStretch(sinceLanding(t, st.run, st.s), speed);
  const ground = project(world(cur.b.x, cur.b.y, 0.01));
  const air = cur.b.w[1] - surfaceHeight(cur.b.w[0], cur.b.w[2]) - BALL_R;

  // ---- trail: the actual hop arcs flown so far (stops where the ball leaves the valley) ----
  const pts = pointsFor(st.run);
  const landed = st.run === "idle" ? 0 : Math.min(pts.length - 1, Math.floor(st.s));
  const inside = (p: { y: number }) => Math.abs(p.y) <= 3.05;
  const arcs: { x: number; y: number }[][] = [];
  for (let k = 0; k < Math.min(landed + 1, pts.length - 1); k++) {
    const fEnd = k < landed ? 1 : st.s - landed;
    if (fEnd <= 0 || !inside(pts[k])) continue;
    arcs.push(Array.from({ length: 10 }, (_, i) => project(hopPoint(pts[k], pts[k + 1], (fEnd * i) / 9).w)));
  }
  const trail = pts.slice(0, landed + 1).filter(inside).map((p) => project(world(p.x, p.y, 0.03)));

  // ---- labels (valley beat) ----
  const lab = (at: number, until: number) => Math.min(springAt(t, at), 1 - prog(t, until, until + 0.3));
  const highP = project(world(-1.6, -2.55, 0.05));
  const lowP = project(world(-2.6, 0.0, 0.05));
  const goalP = project(world(0, 0, 0.02));
  const labelOut = CUES.rule.pushIn - 0.1;

  // ---- rule beat: slope arrow and where the next step would land ----
  const ruleOn = t >= CUES.rule.slope && t < BEATS.rule.end + 0.1;
  const start = pts[0];
  const g = gradient(start.x, start.y);
  const gl = Math.hypot(g.dx, g.dy);
  const slopeTo = { x: start.x + (-g.dx / gl) * 0.9, y: start.y + (-g.dy / gl) * 0.9 };
  const slopeArrow = ruleOn ? surfaceArrow(project, start, slopeTo, 0.08) : [];
  const slopeO = Math.min(prog(t, CUES.rule.slope, CUES.rule.slope + 0.4), 1 - prog(t, BEATS.rule.end - 0.3, BEATS.rule.end));
  const stepOn = t >= CUES.rule.slider && t < BEATS.rule.end + 0.1;
  const nextP = next(start, Math.max(0.001, sliderValue));
  const stepArrow = stepOn ? surfaceArrow(project, start, nextP, 0.08) : [];
  const stepO = Math.min(prog(t, CUES.rule.slider + 0.3, CUES.rule.slider + 0.7), 1 - prog(t, BEATS.rule.end - 0.3, BEATS.rule.end));
  const toPath = (a: { x: number; y: number }[]) => a.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const arrowHead = (a: { x: number; y: number }[], color: string) => {
    if (a.length < 2) return null;
    const p = a[a.length - 1];
    const q = a[a.length - 3];
    const ang = Math.atan2(p.y - q.y, p.x - q.x);
    const s = 26;
    return <path d={`M ${p.x} ${p.y} L ${p.x - s * Math.cos(ang - 0.45)} ${p.y - s * Math.sin(ang - 0.45)} L ${p.x - s * Math.cos(ang + 0.45)} ${p.y - s * Math.sin(ang + 0.45)} Z`} fill={color} />;
  };

  // goal glow
  const goalGlow = 0.55 + 0.25 * Math.sin(t * 3);
  const landBurst = CUES.right.land;

  return (
    <AbsoluteFill>
      <Terrain
        fn={surfaceHeight}
        xRange={[-3, 3]}
        zRange={[-1.6, 4.4]}
        nx={44}
        nz={44}
        fog={[st.cam.dist * 0.9, st.cam.dist * 1.75]}
        cam={st.cam}
        hMax={2.6}
        colors={COLORS_RAMP}
        contours={CONTOURS}
        wireEvery={2}
        wireOpacity={0.06}
        reveal={reveal}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="v-goal">
            <stop offset="0" stopColor={COLORS.yellow} stopOpacity={0.55} />
            <stop offset="1" stopColor={COLORS.yellow} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="v-ball" cx="35%" cy="30%" r="70%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor={st.color} />
            <stop offset="1" stopColor={st.color} stopOpacity={0.75} />
          </radialGradient>
          <filter id="v-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        {/* goal glow: a disc lying on the valley floor (projected, so it has true perspective) */}
        <path d={toPath(Array.from({ length: 33 }, (_, i) => project(world(0.95 * Math.cos((i / 32) * Math.PI * 2), 0.32 * Math.sin((i / 32) * Math.PI * 2), 0.01)))) + " Z"} fill="url(#v-goal)" opacity={goalGlow} />
        {/* trail */}
        {arcs.map((a, i) => (
          <path key={`g${i}`} d={toPath(a)} fill="none" stroke={st.color} strokeWidth={10} opacity={0.18} filter="url(#v-blur)" />
        ))}
        {arcs.map((a, i) => (
          <path key={`a${i}`} d={toPath(a)} fill="none" stroke={st.color} strokeWidth={3} opacity={0.75} strokeLinecap="round" />
        ))}
        {trail.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={6} fill={st.color} opacity={0.95} />
        ))}
        {/* rule arrows */}
        {slopeArrow.length ? (
          <g opacity={slopeO}>
            <path d={toPath(slopeArrow)} fill="none" stroke={COLORS.blue} strokeWidth={10} strokeLinecap="round" />
            {arrowHead(slopeArrow, COLORS.blue)}
          </g>
        ) : null}
        {stepArrow.length ? (
          <g opacity={stepO}>
            <path d={toPath(stepArrow)} fill="none" stroke={COLORS.yellow} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" />
            {arrowHead(stepArrow, COLORS.yellow)}
            {(() => {
              const p = project(world(nextP.x, nextP.y, 0.05));
              return <circle cx={p.x} cy={p.y} r={16} fill="none" stroke={COLORS.yellow} strokeWidth={4} />;
            })()}
          </g>
        ) : null}
        {/* shadow */}
        <ellipse cx={ground.x} cy={ground.y} rx={rpx * 1.1} ry={rpx * 0.45} fill="#000" opacity={Math.max(0, 0.55 - air * 0.25)} />
        {/* motion-blurred ball */}
        {ghosts.length > 1 && speed > 3 ? (
          <path d={toPath(ghosts.map((g2) => g2.p))} fill="none" stroke={st.color} strokeWidth={rpx * 1.9} strokeLinecap="round" opacity={0.45} />
        ) : null}
        <circle cx={cur.p.x} cy={cur.p.y} r={rpx * 2.2} fill={st.color} opacity={0.3} filter="url(#v-blur)" />
        <ellipse cx={cur.p.x} cy={cur.p.y} rx={rpx * sq.sx} ry={rpx * sq.sy} fill="url(#v-ball)" />
      </svg>

      <Burst t={t} t0={landBurst} x={goalP.x} y={goalP.y} color={COLORS.yellow} radius={220} seed={4} dur={0.9} />

      <Pin p={highP} text={copy.valley.high} color={COLORS.red} o={lab(CUES.valley.high, labelOut)} dx={-10} dy={-120} align="left" />
      <Pin p={lowP} text={copy.valley.low} color={COLORS.blue} o={lab(CUES.valley.low, labelOut)} dx={40} dy={96} align="left" />
      <Pin p={goalP} text={copy.valley.goal} color={COLORS.yellow} o={lab(CUES.valley.goal, labelOut)} dy={110} />
      {slopeArrow.length ? (
        <div
          style={{
            position: "absolute",
            left: slopeArrow[23].x - 30,
            top: slopeArrow[23].y + 24,
            transform: "translateX(-100%)",
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 32,
            color: COLORS.blue,
            opacity: slopeO,
          }}
        >
          {copy.rule.slopeLabel}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export { loss, RATES, ease };
