import React from "react";
import { AbsoluteFill } from "remotion";
import { ease, lerp, prog, rand, springAt } from "../../../kit/anim";
import { Arrow } from "../../../kit/components/Icons";
import { Tag } from "../../../kit/components/Headline";
import { copy } from "../copy";
import { COLORS, CX, FONTS } from "../../../kit/theme";
import { CUES, HUD_EVENTS } from "../timeline";

const C = CUES.proof;
const TICKS = HUD_EVENTS.filter((e) => /^GEN [123]$/.test(e.text)).map((e) => e.t);
const ROW_Y = 730;
const SPACING = 340;
const BW = 236;
const BH = 168;

const camera = (t: number) => TICKS.reduce((acc, tk) => acc + prog(t, tk - 0.5, tk + 0.05, ease.inOut), 0);

const Chip: React.FC<{ x: number; y: number; gen: number; seed: number }> = ({ x, y, gen, seed }) => {
  const decay = Math.min(1, gen / 5);
  const lines = [0.85, 0.65, 0.75];
  return (
    <div
      style={{
        position: "absolute",
        left: x - 34,
        top: y - 22,
        width: 68,
        height: 44,
        borderRadius: 8,
        background: lerp(0, 1, decay) > 0.5 ? "#d9d6cf" : "#f1efe9",
        opacity: 0.95 - decay * 0.25,
        boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
        transform: `rotate(${(rand(seed) - 0.5) * 10 * decay}deg)`,
      }}
    >
      {lines.map((w, k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: 9 + (rand(seed + k) - 0.5) * 10 * decay,
            top: 9 + k * 10,
            height: 5,
            width: (68 - 18) * w * (1 - decay * rand(seed * 2 + k) * 0.6),
            borderRadius: 3,
            background: k === 1 && decay > 0.4 ? COLORS.red : "#3a3934",
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
};

export const Beat3Proof: React.FC<{ t: number }> = ({ t }) => {
  const cam = camera(t);
  const pill = springAt(t, C.pill);
  const conveyorIn = prog(t, C.conveyor, C.conveyor + 0.5, ease.out);
  const stepActive = Math.floor(Math.max(0, t - C.labels) / 0.5) % 3;
  return (
    <AbsoluteFill>
      {/* pill */}
      <div style={{ position: "absolute", left: 0, width: 1000, top: 318, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            transform: `scale(${pill})`,
            padding: "14px 34px",
            borderRadius: 60,
            border: "3px solid rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.06)",
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: "0.06em",
            color: COLORS.text,
          }}
        >
          {copy.proof.pill}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1000,
          top: 424,
          textAlign: "center",
          fontFamily: FONTS.head,
          fontWeight: 500,
          fontSize: 38,
          color: COLORS.grey,
          opacity: prog(t, C.pill + 0.2, C.pill + 0.5),
        }}
      >
        {copy.proof.unis}
      </div>

      {/* conveyor track */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ROW_Y - 2,
          height: 4,
          background: "repeating-linear-gradient(to right, rgba(255,255,255,0.18) 0 18px, rgba(0,0,0,0) 18px 34px)",
          backgroundPosition: `${-(t * 120) % 34}px 0`,
          opacity: conveyorIn,
        }}
      />

      {/* data chips flowing from each model into the next */}
      {Array.from({ length: 7 }, (_, k) => {
        const x0 = CX + (k - cam) * SPACING + BW / 2 - 10;
        const x1 = CX + (k + 1 - cam) * SPACING - BW / 2 + 10;
        if (x1 < -100 || x0 > 1180) return null;
        return Array.from({ length: 3 }, (_, j) => {
          const ph = (((t - C.conveyor) / 0.9 + j / 3) % 1 + 1) % 1;
          const x = lerp(x0, x1, ph);
          const y = ROW_Y - Math.sin(ph * Math.PI) * 70;
          return (
            <div key={`${k}-${j}`} style={{ opacity: conveyorIn * Math.sin(ph * Math.PI) }}>
              <Chip x={x} y={y} gen={k} seed={k * 11 + j} />
            </div>
          );
        });
      })}

      {/* model boxes */}
      {Array.from({ length: 7 }, (_, k) => {
        const x = CX + (k - cam) * SPACING;
        if (x < -200 || x > 1280) return null;
        const focus = Math.max(0, 1 - Math.abs(k - cam));
        const s = springAt(t, C.conveyor + Math.min(k, 3) * 0.08);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: x - BW / 2,
              top: ROW_Y - BH / 2,
              width: BW,
              height: BH,
              borderRadius: 24,
              background: "#15151B",
              border: `3px solid rgba(245,245,240,${0.22 + 0.7 * focus})`,
              boxShadow: focus > 0.5 ? `0 0 50px rgba(255,214,10,${0.18 * focus}), 0 20px 50px rgba(0,0,0,0.6)` : "0 20px 50px rgba(0,0,0,0.6)",
              transform: `scale(${(0.86 + 0.14 * focus) * s})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <div style={{ fontFamily: FONTS.head, fontWeight: 700, fontSize: 42, letterSpacing: "0.02em", color: COLORS.text }}>
              {copy.proof.model}
            </div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontWeight: 700,
                fontSize: 28,
                color: k === 0 ? COLORS.grey : COLORS.red,
                padding: "2px 12px",
                borderRadius: 8,
                background: k === 0 ? "rgba(255,255,255,0.06)" : "rgba(255,59,48,0.12)",
              }}
            >
              GEN {k}
            </div>
          </div>
        );
      })}

      {/* train -> generate -> retrain */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1000,
          top: 980,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          fontFamily: FONTS.head,
          fontWeight: 700,
          fontSize: 46,
          letterSpacing: "-0.01em",
        }}
      >
        {copy.proof.steps.map((s, i) => {
          const o = prog(t, C.labels + i * 0.15, C.labels + i * 0.15 + 0.3, ease.out);
          return (
            <React.Fragment key={s}>
              {i > 0 ? (
                <span style={{ opacity: o }}>
                  <Arrow width={56} color={COLORS.grey} />
                </span>
              ) : null}
              <span
                style={{
                  opacity: o,
                  transform: `translateY(${(1 - o) * 20}px)`,
                  color: stepActive === i ? COLORS.yellow : COLORS.text,
                  display: "inline-block",
                }}
              >
                {s}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      <Tag t={t} start={C.tag} top={1236} align="center">
        {copy.proof.tag}
      </Tag>
    </AbsoluteFill>
  );
};
