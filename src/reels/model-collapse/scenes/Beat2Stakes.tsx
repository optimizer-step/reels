import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { ease, lerp, prog, rand, springAt } from "../../../kit/anim";
import { GlobeIcon, RobotIcon } from "../../../kit/components/Icons";
import { Tag } from "../../../kit/components/Headline";
import { copy } from "../copy";
import { COLORS, CX, FONTS } from "../../../kit/theme";
import { ASSETS, BROLL, CUES } from "../timeline";

const C = CUES.stakes;
const COLS = 4;
const ROWS = 5;
const CW = 184;
const CH = 92;
const GAP = 16;
const GRID_LEFT = CX - (COLS * CW + (COLS - 1) * GAP) / 2;
const GRID_TOP = 316;

// which cards turn out to be AI-written (10 of 20, seeded)
const order = Array.from({ length: 20 }, (_, i) => i).sort((a, b) => rand(a * 7.3) - rand(b * 7.3));
const AI_SET = new Set(order.slice(0, 10));
const flipRank = (i: number) => order.indexOf(i);

const LOOP = { cx: CX, cy: 820, r: 262 };
const nodeAngle = [-90, 30, 150];

const Card: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const gx = GRID_LEFT + col * (CW + GAP);
  const gy = GRID_TOP + row * (CH + GAP);
  const pop = springAt(t, C.grid + i * 0.035);
  const isAI = AI_SET.has(i);
  const f = isAI ? prog(t, C.flip + flipRank(i) * 0.05, C.flip + flipRank(i) * 0.05 + 0.38, ease.inOut) : 0;
  // fly into the loop
  const q = prog(t, C.loop + i * 0.008, C.loop + 0.6 + i * 0.008, ease.inOut);
  const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
  const tx = LOOP.cx + Math.cos(a) * LOOP.r - CW / 2;
  const ty = LOOP.cy + Math.sin(a) * LOOP.r - CH / 2;
  const x = lerp(gx, tx, q);
  const y = lerp(gy, ty, q);
  const sc = lerp(0.55 + 0.45 * pop, 0.1, q);
  const op = Math.min(pop, 1 - prog(t, C.loop + 0.45, C.loop + 0.7));
  if (op <= 0) return null;
  const face: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: 14,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };
  const w1 = 0.5 + rand(i * 3.3) * 0.4;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: CW, height: CH, opacity: op, transform: `scale(${sc})`, perspective: 700 }}>
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${f * 180}deg)` }}>
        <div style={{ ...face, background: "#17171D", border: `2px solid ${COLORS.line}` }}>
          <div style={{ position: "absolute", left: 16, top: 16, width: 16, height: 16, borderRadius: 8, background: "#3a3a46" }} />
          <div style={{ position: "absolute", left: 40, top: 18, width: (CW - 60) * w1, height: 12, borderRadius: 6, background: "#5a5a66" }} />
          <div style={{ position: "absolute", left: 16, top: 46, width: CW - 34, height: 8, borderRadius: 4, background: "#2e2e38" }} />
          <div style={{ position: "absolute", left: 16, top: 64, width: (CW - 34) * 0.7, height: 8, borderRadius: 4, background: "#2e2e38" }} />
        </div>
        <div
          style={{
            ...face,
            transform: "rotateY(180deg)",
            background: "#1f1b08",
            border: `2px solid ${COLORS.yellow}`,
            boxShadow: `0 0 24px ${COLORS.yellow}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RobotIcon size={52} />
        </div>
      </div>
    </div>
  );
};

const arcPath = (a0: number, a1: number) => {
  const r = LOOP.r;
  const p = (a: number) => [LOOP.cx + Math.cos((a * Math.PI) / 180) * r, LOOP.cy + Math.sin((a * Math.PI) / 180) * r];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
};

const Node: React.FC<{ t: number; k: number; label: string; icon: React.ReactNode; color: string }> = ({ t, k, label, icon, color }) => {
  const s = springAt(t, C.loop + 0.25 + k * 0.15);
  const a = (nodeAngle[k] * Math.PI) / 180;
  const x = LOOP.cx + Math.cos(a) * LOOP.r;
  const y = LOOP.cy + Math.sin(a) * LOOP.r;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s})`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 26px 16px 20px",
        borderRadius: 22,
        background: "#141419",
        border: `3px solid ${color}`,
        boxShadow: `0 0 40px ${color}33, 0 20px 40px rgba(0,0,0,0.5)`,
        fontFamily: FONTS.head,
        fontWeight: 700,
        fontSize: 46,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </div>
  );
};

export const Beat2Stakes: React.FC<{ t: number }> = ({ t }) => {
  const statPop = springAt(t, C.stat);
  const n = Math.round(50 * prog(t, C.stat, C.statCountEnd, ease.out));
  const statOut = prog(t, C.loop, C.loop + 0.32, ease.in);
  const draw = prog(t, C.loop + 0.35, C.loop + 1.0, ease.inOut);
  const chase = ((t - (C.loop + 0.9)) / 1.7) * 360;
  const showLoop = t >= C.loop + 0.2;
  const gaps = 21; // degrees left clear around each node
  return (
    <AbsoluteFill>
      {Array.from({ length: COLS * ROWS }, (_, i) => (
        <Card key={i} i={i} t={t} />
      ))}

      {/* stat */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1000,
          top: 868,
          textAlign: "center",
          fontFamily: FONTS.head,
          fontWeight: 700,
          fontSize: 206,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: COLORS.yellow,
          opacity: Math.min(prog(t, C.stat, C.stat + 0.15), 1 - statOut),
          transform: `translateY(${(1 - statPop) * 80 + statOut * 60}px) scale(${0.8 + 0.2 * statPop})`,
          textShadow: `0 0 60px ${COLORS.yellow}44`,
        }}
      >
        <span style={{ color: COLORS.grey, fontWeight: 500 }}>{copy.stakes.statPrefix}</span>
        {n}%
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1000,
          top: 1086,
          textAlign: "center",
          fontFamily: FONTS.head,
          fontWeight: 700,
          fontSize: 56,
          lineHeight: 1.06,
          letterSpacing: "-0.02em",
          color: COLORS.text,
          opacity: Math.min(prog(t, C.stat + 0.25, C.stat + 0.5), 1 - statOut),
          transform: `translateY(${(1 - prog(t, C.stat + 0.25, C.stat + 0.6, ease.out)) * 30 + statOut * 60}px)`,
        }}
      >
        {copy.stakes.statLabel.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <Tag t={t} start={C.stat + 0.6} top={1236} align="center" exit={C.loop}>
        {copy.stakes.tag}
      </Tag>

      {/* the loop */}
      {showLoop ? (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <marker id="ah" viewBox="0 0 12 12" refX="7" refY="6" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 1 1 L 10 6 L 1 11 z" fill={COLORS.grey} />
              </marker>
              <filter id="dotglow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
            {[0, 1, 2].map((k) => {
              const a0 = nodeAngle[k] + gaps;
              const a1 = nodeAngle[k] + 120 - gaps;
              return (
                <path
                  key={k}
                  d={arcPath(a0, a1)}
                  fill="none"
                  stroke={COLORS.grey}
                  strokeWidth={5}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - draw}
                  markerEnd={draw > 0.95 ? "url(#ah)" : undefined}
                />
              );
            })}
            {draw > 0.6
              ? [0, 1, 2, 3].map((k) => {
                  const a = ((chase - k * 7 - 90) * Math.PI) / 180;
                  const x = LOOP.cx + Math.cos(a) * LOOP.r;
                  const y = LOOP.cy + Math.sin(a) * LOOP.r;
                  const r = 13 - k * 2.6;
                  return (
                    <g key={k} opacity={(1 - k * 0.22) * prog(t, C.loop + 0.8, C.loop + 1.0)}>
                      {k === 0 ? <circle cx={x} cy={y} r={26} fill={COLORS.yellow} opacity={0.6} filter="url(#dotglow)" /> : null}
                      <circle cx={x} cy={y} r={r} fill={COLORS.yellow} />
                    </g>
                  );
                })
              : null}
          </svg>
          <Node t={t} k={0} label={copy.stakes.nodes.ai} icon={<RobotIcon size={48} />} color={COLORS.yellow} />
          <Node t={t} k={1} label={copy.stakes.nodes.internet} icon={<GlobeIcon size={46} />} color={COLORS.text} />
          <Node t={t} k={2} label={copy.stakes.nodes.next} icon={<RobotIcon size={48} />} color={COLORS.yellow} />
        </>
      ) : null}

      {BROLL.robotCopy && t < C.brollEnd ? (
        <AbsoluteFill>
          <OffthreadVideo src={staticFile(`${ASSETS}/broll/robot-copy.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(11,11,15,0.2), rgba(11,11,15,0.75))" }} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
