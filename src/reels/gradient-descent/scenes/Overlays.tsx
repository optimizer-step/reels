import React from "react";
import { COLORS, FONTS, Headline, Odometer, SAFE, Slider, Tag, ease, prog, springAt } from "../../../kit";
import { copy } from "../copy";
import { hudReadout, sliderAppear, sliderColor, sliderPulse, sliderValue } from "../control";
import { BEATS, CUES } from "../timeline";

const SLIDER_TOP = 1150;

/** Kinetic formula: STEP = LEARNING RATE × SLOPE, each token landing on its spoken word. */
const Formula: React.FC<{ t: number }> = ({ t }) => {
  const out = prog(t, BEATS.rule.end - 0.35, BEATS.rule.end - 0.05, ease.in);
  if (t < CUES.rule.formula || out >= 1) return null;
  const tok = (at: number, text: string, color: string, size = 76) => {
    const s = springAt(t, at, { damping: 13, stiffness: 220 });
    return (
      <span
        style={{
          display: "inline-block",
          marginRight: 22,
          color,
          opacity: Math.min(1, s * 2),
          transform: `translateY(${(1 - s) * 50}px) scale(${0.7 + 0.3 * s})`,
          fontSize: size,
        }}
      >
        {text}
      </span>
    );
  };
  const f = copy.rule.formula;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: 330,
        width: SAFE.right - SAFE.left,
        fontFamily: FONTS.head,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1.08,
        opacity: 1 - out,
        transform: `translateY(${-30 * out}px)`,
      }}
    >
      <div>
        {tok(CUES.rule.formula, f.step, COLORS.text)}
        {tok(CUES.rule.formula + 0.12, f.eq, COLORS.grey)}
      </div>
      <div>
        {tok(CUES.rule.slider, f.rate, COLORS.yellow, 70)}
        {tok(CUES.rule.slider + 0.15, f.times, COLORS.grey, 70)}
        {tok(CUES.rule.formula + 0.3, f.slope, COLORS.blue, 70)}
      </div>
    </div>
  );
};

/** Run HUD: step and loss counters across the top. */
const Hud: React.FC<{ t: number }> = ({ t }) => {
  const r = hudReadout(t);
  // hidden while the tape rewinds (the REWIND tag sits in the same corner)
  const rw = [BEATS.rewind2, BEATS.rewind3].reduce((m, w) => Math.max(m, Math.min(prog(t, w.start - 0.12, w.start), 1 - prog(t, w.end - 0.05, w.end + 0.1))), 0);
  const appear = Math.min(prog(t, BEATS.small.start, BEATS.small.start + 0.3), 1 - prog(t, BEATS.chart.start - 0.05, BEATS.chart.start + 0.15), 1 - rw);
  if (!r || appear <= 0) return null;
  const big = r.loss >= 100;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: SAFE.top + 4,
        height: 76,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 26px",
        borderRadius: 18,
        background: "rgba(11,11,15,0.78)",
        border: `2px solid ${r.color}55`,
        opacity: appear,
        fontFamily: FONTS.mono,
        fontWeight: 700,
        fontSize: 30,
        color: COLORS.grey,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {copy.hud.step}
        <Odometer value={Math.floor(r.step)} size={40} color={r.color} />
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {copy.hud.loss}
        <Odometer value={big ? Math.round(r.loss) : r.loss} decimals={big ? 0 : 2} size={40} color={big ? COLORS.red : COLORS.text} />
      </span>
    </div>
  );
};

/** Screen-space text and controls over the valley (hook → big run). */
export const Overlays: React.FC<{ t: number }> = ({ t }) => {
  const v = sliderValue(t);
  const explode = springAt(t, CUES.big.explode + 0.25, { damping: 12, stiffness: 260 });
  return (
    <>
      {/* cold open: lines slam on the wall hits */}
      <Headline t={t} start={0} lineStarts={CUES.hook.lines} variant="slam" lines={copy.hook} top={300} size={108} exit={BEATS.hook.end - 0.15} lineHeight={0.98} />

      {/* the valley */}
      <Headline t={t} start={CUES.valley.headline} lines={copy.valley.headline} top={330} size={92} stagger={0.12} exit={BEATS.valley.end - 0.3} />
      <Tag t={t} start={CUES.valley.tag} top={1236} align="center" size={26} exit={BEATS.valley.end - 0.2}>
        {copy.valley.tag}
      </Tag>

      {/* the rule */}
      <Formula t={t} />

      {/* the three runs */}
      <Headline t={t} start={CUES.small.label} lines={copy.small.label} top={340} size={112} stagger={0.1} exit={BEATS.small.end - 0.15} highlightColor={COLORS.blue} />
      <Tag t={t} start={CUES.small.stillFar} top={500} size={34} color={COLORS.blue} exit={BEATS.small.end - 0.1}>
        {copy.small.far}
      </Tag>
      <Headline t={t} start={CUES.right.label} lines={copy.right.label} top={340} size={112} stagger={0.1} exit={BEATS.right.end - 0.15} />
      <Headline t={t} start={CUES.big.label} lines={copy.big.label} top={340} size={112} stagger={0.1} variant="slam" lineStarts={[CUES.big.label]} exit={BEATS.big.end - 0.1} highlightColor={COLORS.red} />
      {t > CUES.big.explode + 0.25 && t < BEATS.big.end + 0.1 ? (
        <div
          style={{
            position: "absolute",
            left: SAFE.left,
            top: 480,
            fontFamily: FONTS.head,
            fontWeight: 700,
            fontSize: 64,
            letterSpacing: "-0.02em",
            color: COLORS.red,
            opacity: Math.min(1, explode * 1.5),
            transform: `scale(${1.6 - 0.6 * explode})`,
            transformOrigin: "left center",
            textShadow: `0 0 30px ${COLORS.red}88`,
          }}
        >
          {copy.big.explode}
        </div>
      ) : null}

      <Hud t={t} />

      <Slider
        value={v}
        min={0}
        max={0.3}
        label={copy.slider.label}
        valueText={t >= BEATS.cta.start ? "?" : v.toFixed(2)}
        top={SLIDER_TOP}
        color={sliderColor(v)}
        zones={[{ from: 0.2, to: 0.3, color: COLORS.red, label: copy.slider.unstable }]}
        ticks={[0, 0.1, 0.2, 0.3]}
        appear={sliderAppear(t)}
        pulse={sliderPulse(t)}
      />
    </>
  );
};
