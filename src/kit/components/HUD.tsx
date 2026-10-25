import React from "react";
import { ease, prog, springAt } from "../anim";
import { COLORS, FONTS, SAFE, SIZES } from "../theme";

export type HudEvent = { t: number; text: string };

/**
 * Counter HUD in the top-left of the safe zone (e.g. "GEN 3", "EPOCH 12", "STEP 4/5").
 * Flips on every change; optional pips underneath act as a visible progress bar.
 */
export const CounterHUD: React.FC<{
  t: number;
  events: HudEvent[];
  hideAt?: number;
  color: string;
  pips?: { count: number; value: number; color: string };
}> = ({ t, events, hideAt = Infinity, color, pips }) => {
  if (!events.length || t < events[0].t || t > hideAt + 0.5) return null;
  let i = 0;
  for (let k = 0; k < events.length; k++) if (events[k].t <= t) i = k;
  const cur = events[i];
  const prev = i > 0 ? events[i - 1] : null;
  const flip = prog(t - cur.t, 0, 0.18, ease.out);
  const punch = 1 + 0.14 * (1 - springAt(t, cur.t, { damping: 11, stiffness: 260 }));
  const appear = springAt(t, events[0].t);
  const opacity = Math.min(appear, 1 - prog(t, hideAt, hideAt + 0.4));

  const textStyle: React.CSSProperties = {
    fontFamily: FONTS.mono,
    fontWeight: 700,
    fontSize: SIZES.hud,
    letterSpacing: "0.02em",
    color,
    whiteSpace: "nowrap",
    lineHeight: "60px",
    height: 60,
  };

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top + 6,
        opacity,
        transform: `translateY(${(1 - appear) * -30}px) scale(${punch})`,
        transformOrigin: "left center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "6px 22px 6px 18px",
          borderRadius: 16,
          background: "rgba(11,11,15,0.72)",
          border: `2px solid ${color}55`,
          boxShadow: `0 0 30px ${color}22`,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            background: color,
            boxShadow: `0 0 14px ${color}`,
            opacity: 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 1.6)),
          }}
        />
        <div style={{ position: "relative", overflow: "hidden", height: 60 }}>
          {prev && flip < 1 ? (
            <div style={{ ...textStyle, position: "absolute", left: 0, top: 0, transform: `translateY(${-flip * 60}px)`, opacity: 1 - flip }}>
              {prev.text}
            </div>
          ) : null}
          <div style={{ ...textStyle, transform: `translateY(${(1 - flip) * 60}px)`, opacity: flip }}>{cur.text}</div>
        </div>
      </div>
      {pips ? (
        <div style={{ display: "flex", gap: 6, marginTop: 12, marginLeft: 4 }}>
          {Array.from({ length: pips.count }, (_, k) => (
            <div
              key={k}
              style={{
                width: 14,
                height: 8,
                borderRadius: 2,
                background: k < pips.value ? pips.color : "rgba(255,255,255,0.14)",
                opacity: k < pips.value ? 0.95 : 1,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

/** Reads the first integer in a HUD label ("GEN 12" -> 12). */
export const hudNumber = (text: string) => {
  const m = text.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};

/** Text of the HUD event active at time t. */
export const hudTextAt = (events: HudEvent[], t: number) => {
  let cur = events[0];
  for (const e of events) if (e.t <= t) cur = e;
  return cur?.text ?? "";
};
