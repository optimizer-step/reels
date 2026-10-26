import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { Arrow, Burst, COLORS, FONTS, Glitch, Headline, LineChart, SAFE, Tag, ease, lerp, prog, springAt, type Series } from "../../../kit";
import { copy } from "../copy";
import { scheduleHead } from "../control";
import { RATES, run, schedule } from "../math";
import { ASSETS, BEATS, BROLL, CUES, PRESENTER } from "../timeline";

// the chart, the twist and the CTA live on one "board": screen-space, under the persistent slider
const BOX = { x: 160, y: 620, w: 760, h: 400 };
const X_MAX = 40;
const Y_MAX = 12;
const small40 = run(RATES.small, 40).map((p, i) => [i, p.loss] as [number, number]);
const right40 = run(RATES.right, 40).map((p, i) => [i, p.loss] as [number, number]);
const big30 = run(RATES.big, 30).map((p, i) => [i, p.loss] as [number, number]);
const sched = Array.from({ length: 121 }, (_, i) => [(i / 120) * X_MAX, 10 * schedule(i / 120)] as [number, number]);

const sx = (x: number) => BOX.x + (x / X_MAX) * BOX.w;
const sy = (y: number) => BOX.y + BOX.h - (y / Y_MAX) * BOX.h;

const Fade: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) => (o <= 0.001 ? null : <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>);

const CurveLabel: React.FC<{ x: number; y: number; text: string; color: string; o: number }> = ({ x, y, text, color, o }) =>
  o <= 0.001 ? null : (
    <div
      style={{
        position: "absolute",
        left: x + 18,
        top: y - 24,
        fontFamily: FONTS.mono,
        fontWeight: 700,
        fontSize: 30,
        color,
        opacity: o,
        transform: `translateX(${(1 - o) * -14}px)`,
      }}
    >
      {text}
    </div>
  );

/** How to take part: a comment box that types an answer (no fake comments from other people). */
const CommentBox: React.FC<{ t: number }> = ({ t }) => {
  const at = CUES.cta.sub + 0.35;
  const s = springAt(t, at);
  if (s <= 0.001) return null;
  const typed = copy.cta.typed;
  const n = Math.floor(typed.length * prog(t, at + 0.6, at + 1.3, (x) => x));
  const sent = springAt(t, at + 1.6, { damping: 10, stiffness: 300 });
  const cursor = Math.floor(t * 3) % 2 === 0;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left + 20,
        width: SAFE.right - SAFE.left - 40,
        top: 840,
        height: 112,
        borderRadius: 56,
        background: "rgba(255,255,255,0.06)",
        border: `3px solid ${n > 0 ? COLORS.yellow : "rgba(255,255,255,0.18)"}`,
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "0 22px",
        opacity: Math.min(1, s * 1.5),
        transform: `translateY(${(1 - s) * 60}px)`,
      }}
    >
      <div style={{ width: 66, height: 66, borderRadius: 33, background: "linear-gradient(135deg, #3a3a46, #22222a)", flexShrink: 0 }} />
      <div style={{ flex: 1, fontFamily: n > 0 ? FONTS.mono : FONTS.head, fontWeight: n > 0 ? 700 : 500, fontSize: n > 0 ? 50 : 40, color: n > 0 ? COLORS.yellow : COLORS.grey }}>
        {n > 0 ? typed.slice(0, n) : copy.cta.placeholder}
        {n > 0 && n < typed.length + 1 && cursor ? <span style={{ display: "inline-block", width: 14, height: 46, marginLeft: 4, verticalAlign: "-6px", background: COLORS.yellow }} /> : null}
      </div>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          background: n >= typed.length ? COLORS.yellow : "rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 + 0.25 * Math.sin(Math.PI * Math.min(1, sent))})`,
          flexShrink: 0,
        }}
      >
        <svg width={34} height={34} viewBox="0 0 34 34">
          <path d="M 4 17 L 30 4 L 22 30 L 17 19 Z" fill={n >= typed.length ? COLORS.bg : COLORS.grey} />
        </svg>
      </div>
    </div>
  );
};

export const Board: React.FC<{ t: number }> = ({ t }) => {
  const C = CUES.chart;
  const T = CUES.twist;
  const ctaIn = prog(t, BEATS.cta.start - 0.1, BEATS.cta.start + 0.3, ease.inOut);

  // ---- chart ----
  const drawP = ease.inOut(prog(t, C.draw[0], C.draw[1]));
  const bigP = prog(t, C.bigDraw[0], C.bigDraw[1], (p) => (p < 0.75 ? ease.inOut(p / 0.75) * 0.55 : 0.55 + ease.in((p - 0.75) / 0.25) * 0.45));
  const bigUpto = bigP < 0.55 ? lerp(0, 3.55, bigP / 0.55) : lerp(3.55, 9, (bigP - 0.55) / 0.45);
  const curvesOut = prog(t, T.morph, T.morph + 0.5);
  const series: Series[] = [
    { id: "small", pts: small40, color: COLORS.blue, upto: drawP * X_MAX, opacity: 1 - curvesOut },
    { id: "right", pts: right40, color: COLORS.yellow, upto: drawP * X_MAX, opacity: 1 - curvesOut },
    // escapes through the top of the chart and burns out before it reaches the headline
    { id: "big", pts: big30, color: COLORS.red, upto: bigUpto, unclipped: true, fadeTop: [BOX.y - 130, BOX.y - 10], opacity: 1 - curvesOut },
  ];
  const head = scheduleHead(t);
  if (t >= T.curve[0]) series.push({ id: "sched", pts: sched, color: COLORS.yellow, upto: head * X_MAX, width: 8 });

  const yLabelChart = 1 - prog(t, T.morph, T.morph + 0.35);
  const yLabelTwist = prog(t, T.morph + 0.2, T.morph + 0.55);
  const breakoutHit = t >= C.breakout;
  const crack = breakoutHit ? 1 - prog(t, C.breakout + 0.6, C.breakout + 1.2) : 0;
  const yTicksO = 1 - prog(t, T.morph, T.morph + 0.4);

  // labels along the schedule
  const lab = (u: number) => (head >= u ? springAt(t, T.curve[0] + (T.curve[1] - T.curve[0]) * u) : 0);

  const board = (
    <AbsoluteFill style={{ opacity: 1 - ctaIn, transform: `scale(${1 - 0.08 * ctaIn})`, filter: ctaIn > 0.02 ? `blur(${(ctaIn * 10).toFixed(1)}px)` : undefined }}>
      {BROLL.datacenter && t >= T.morph - 0.2 ? (
        <AbsoluteFill style={{ opacity: 0.32 * prog(t, T.morph, T.morph + 0.8) }}>
          <OffthreadVideo src={staticFile(`${ASSETS}/broll/datacenter.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(11,11,15,0.85), rgba(11,11,15,0.45) 40%, rgba(11,11,15,0.9))" }} />
        </AbsoluteFill>
      ) : null}

      <LineChart
        id="gd-chart"
        box={BOX}
        xDomain={[0, X_MAX]}
        yDomain={[0, Y_MAX]}
        series={series}
        xTicks={yTicksO > 0.01 ? [0, 10, 20, 30, 40] : []}
        yTicks={yTicksO > 0.01 ? [0, 4, 8, 12] : []}
        axisOpacity={prog(t, BEATS.chart.start + 0.2, BEATS.chart.start + 0.6)}
      />
      {/* axis labels with a morph between the chart and the twist */}
      <div style={{ position: "absolute", left: BOX.x, top: BOX.y - 62, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 28, color: COLORS.text }}>
        <span style={{ position: "absolute", whiteSpace: "nowrap", opacity: yLabelChart, transform: `translateY(${-20 * (1 - yLabelChart)}px)` }}>{copy.chart.yLabel}</span>
        <span style={{ position: "absolute", whiteSpace: "nowrap", opacity: yLabelTwist, transform: `translateY(${20 * (1 - yLabelTwist)}px)`, color: COLORS.yellow }}>{copy.twist.yLabel}</span>
      </div>
      <div style={{ position: "absolute", right: 1080 - (BOX.x + BOX.w), top: BOX.y + BOX.h + 54, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 28, color: COLORS.text, textAlign: "right" }}>
        <span style={{ display: "block", opacity: yLabelChart }}>{copy.chart.xLabel}</span>
        <span style={{ display: "block", marginTop: -34, opacity: yLabelTwist }}>{copy.twist.xLabel}</span>
      </div>

      {/* legend */}
      <div style={{ position: "absolute", right: 1080 - (BOX.x + BOX.w), top: BOX.y + 8, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 28, opacity: prog(t, C.draw[0], C.draw[0] + 0.3) * (1 - curvesOut) }}>
        {[
          [copy.chart.small, COLORS.blue, C.draw[0]],
          [copy.chart.right, COLORS.yellow, C.draw[0] + 0.1],
          [copy.chart.big, COLORS.red, C.bigDraw[0]],
        ].map(([label, color, at]) => (
          <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 10, color: color as string, opacity: prog(t, at as number, (at as number) + 0.25) }}>
            <span style={{ width: 28, height: 6, borderRadius: 3, background: color as string, display: "inline-block" }} />
            {label as string}
          </div>
        ))}
      </div>

      {/* breakout: the 0.22 line smashes through the top of the chart */}
      {crack > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {[-1, 1].map((d) => (
            <path
              key={d}
              d={`M ${sx(3.55)} ${BOX.y} l ${d * 22} ${-18} l ${d * 10} ${26} l ${d * 30} ${-14} l ${d * 18} ${20}`}
              fill="none"
              stroke={COLORS.red}
              strokeWidth={4}
              opacity={crack}
            />
          ))}
        </svg>
      ) : null}
      <Burst t={t} t0={C.breakout} x={sx(3.55)} y={BOX.y} color={COLORS.red} radius={260} seed={11} dur={0.8} />
      {breakoutHit && t < T.morph + 0.3 ? (
        <div
          style={{
            position: "absolute",
            left: sx(5),
            top: BOX.y + 40,
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 30,
            color: COLORS.red,
            opacity: springAt(t, C.breakout + 0.15) * (1 - prog(t, T.morph - 0.1, T.morph + 0.2)),
          }}
        >
          <div style={{ fontFamily: FONTS.head, fontSize: 58, letterSpacing: "-0.02em" }}>{copy.big.explode}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {copy.chart.breakout.from}
            <Arrow width={44} color={COLORS.red} />
            {copy.chart.breakout.to}
          </div>
        </div>
      ) : null}

      {/* twist labels on the schedule */}
      <CurveLabel x={sx(3.9)} y={sy(5)} text={copy.twist.warm} color={COLORS.text} o={lab(0.05)} />
      <CurveLabel x={sx(4.6) + 10} y={sy(10) - 30} text={copy.twist.peak} color={COLORS.yellow} o={lab(0.12)} />
      <CurveLabel x={sx(25)} y={sy(schedule(0.62) * 10) - 34} text={copy.twist.decay} color={COLORS.text} o={lab(0.58)} />

      <Headline t={t} start={C.headline} lines={copy.chart.headline} top={300} size={80} stagger={0.1} exit={T.morph - 0.25} />
      <Headline t={t} start={T.headline} lines={copy.twist.headline} top={300} size={78} stagger={0.1} exit={BEATS.cta.start - 0.25} />
      {/* source credit sits right under the claim it backs */}
      <Tag t={t} start={T.tag} top={496} size={24} exit={BEATS.cta.start - 0.2}>
        {copy.twist.tag}
      </Tag>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill>
      <Glitch t={t} t0={C.breakout - 0.03} dur={0.32} strength={1.2} seed={5}>
        {board}
      </Glitch>
      {/* CTA */}
      {t >= BEATS.cta.start - 0.1 ? (
        <AbsoluteFill>
          <Headline t={t} start={CUES.cta.headline} lines={copy.cta.headline} top={420} size={112} stagger={0.12} align="center" variant="slam" lineStarts={[CUES.cta.headline, CUES.cta.headline + 0.3]} />
          <div
            style={{
              position: "absolute",
              left: 0,
              width: 1000,
              top: 700,
              textAlign: "center",
              fontFamily: FONTS.head,
              fontWeight: 500,
              fontSize: 48,
              color: COLORS.text,
              opacity: prog(t, CUES.cta.sub, CUES.cta.sub + 0.35),
              transform: `translateY(${(1 - prog(t, CUES.cta.sub, CUES.cta.sub + 0.4, ease.out)) * 24}px)`,
            }}
          >
            {copy.cta.sub}
          </div>
          <CommentBox t={t} />
          {PRESENTER ? (
            <div style={{ position: "absolute", left: SAFE.left, top: 800, width: 320, height: 320, borderRadius: 160, overflow: "hidden", border: `5px solid ${COLORS.yellow}`, opacity: prog(t, CUES.cta.sub, CUES.cta.sub + 0.3) }}>
              <OffthreadVideo src={staticFile(`${ASSETS}/broll/presenter-cta.webm`)} transparent muted style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
