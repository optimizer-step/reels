import React from "react";
import { COLORS, DownArrow, FONTS, Headline, Tag, ease, prog, springAt } from "../../../kit";
import { copy } from "../copy";
import { BEATS, CUES } from "../timeline";

const Line: React.FC<{ t: number; at: number; out: number; top: number; children: React.ReactNode; size?: number; color?: string }> = ({
  t,
  at,
  out,
  top,
  children,
  size = 52,
  color = COLORS.text,
}) => {
  const i = prog(t, at, at + 0.35, ease.out);
  const o = Math.min(i, 1 - prog(t, out, out + 0.25));
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1000,
        top,
        textAlign: "center",
        fontFamily: FONTS.head,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.02em",
        color,
        opacity: o,
        transform: `translateY(${(1 - i) * 24}px)`,
        textShadow: "0 8px 30px rgba(0,0,0,0.85)",
      }}
    >
      {children}
    </div>
  );
};

/** All screen-space text (headlines, pills, tags, questions, CTA). */
export const Overlays: React.FC<{ t: number }> = ({ t }) => {
  const pill = springAt(t, CUES.attention.pill);
  const pillOut = prog(t, BEATS.change.start - 0.1, BEATS.change.start + 0.2);
  const ctaOut = CUES.cta.fade;
  const comment = springAt(t, CUES.cta.comment);
  return (
    <>
      {/* 1 hook */}
      <Headline t={t} start={CUES.hook.headline} lines={copy.hook.headline} top={300} size={96} stagger={0.12} exit={BEATS.hook.end - 0.25} />
      <Line t={t} at={CUES.hook.question} out={BEATS.hook.end - 0.2} top={1250} size={54}>
        {copy.hook.question}
      </Line>

      {/* 2 numbers */}
      <Headline t={t} start={CUES.numbers.headline} lines={copy.numbers.headline} top={360} size={86} stagger={0.11} exit={BEATS.attention.start - 0.2} />

      {/* 3 attention */}
      {pill > 0 && pillOut < 1 ? (
        <div style={{ position: "absolute", left: 0, width: 1000, top: 352, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: 1 - pillOut }}>
          <div
            style={{
              transform: `scale(${pill})`,
              padding: "14px 30px",
              borderRadius: 60,
              border: `3px solid ${COLORS.yellow}88`,
              background: "rgba(255,214,10,0.08)",
              fontFamily: FONTS.mono,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: "0.03em",
              color: COLORS.yellow,
              whiteSpace: "nowrap",
            }}
          >
            {copy.attention.pill}
          </div>
          <div style={{ fontFamily: FONTS.head, fontWeight: 500, fontSize: 40, color: COLORS.text, opacity: prog(t, CUES.attention.sub, CUES.attention.sub + 0.35) }}>
            {copy.attention.sub}
          </div>
        </div>
      ) : null}

      {/* 4 change */}
      <Headline t={t} start={CUES.change.headline} lines={copy.change.headline1} top={360} size={92} exit={BEATS.space.start - 0.3} />
      <Headline t={t} start={CUES.change.headline2} lines={copy.change.headline2} top={462} size={92} exit={BEATS.space.start - 0.3} />
      <Line t={t} at={CUES.change.question} out={BEATS.space.start + 0.2} top={1250} size={50} color={COLORS.yellow}>
        {copy.change.question}
      </Line>

      {/* 5 space */}
      <Headline t={t} start={CUES.space.headline} lines={copy.space.headline} top={340} size={100} stagger={0.14} exit={CUES.heatmap.cut - 0.15} />
      <Tag t={t} start={CUES.space.tag} top={1262} align="center" size={24} exit={CUES.heatmap.cut - 0.1}>
        {copy.space.tag}
      </Tag>

      {/* 6 heatmap */}
      <Headline t={t} start={CUES.heatmap.headline} lines={copy.heatmap.headline} top={300} size={84} stagger={0.12} exit={BEATS.takeaway.start - 0.2} />
      <Tag t={t} start={CUES.heatmap.tag} top={1262} align="center" size={26} exit={BEATS.takeaway.start - 0.2}>
        {copy.heatmap.tag}
      </Tag>

      {/* 7 takeaway */}
      <Headline t={t} start={CUES.takeaway.headline} lines={copy.takeaway.headline} top={300} size={88} stagger={0.12} exit={CUES.cta.text - 0.3} />

      {/* 8 CTA: masked wipe clears type before the camera returns to BANK. */}
      <div style={{ position: "absolute", inset: 0, clipPath: "inset(0 " + (100 * prog(t, 44.1, 44.7)).toFixed(1) + "% 0 0)" }}>
      <Headline t={t} start={CUES.cta.text} lines={copy.cta.headline} top={330} size={88} stagger={0.1} align="center" exit={ctaOut} />
      {comment > 0 && t < ctaOut + 0.3 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1000,
            top: 1150,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            fontFamily: FONTS.head,
            fontWeight: 700,
            fontSize: 50,
            color: COLORS.text,
            opacity: Math.min(comment, 1 - prog(t, ctaOut, ctaOut + 0.28)),
            transform: `translateY(${(1 - comment) * 30}px)`,
            textShadow: "0 8px 30px rgba(0,0,0,0.85)",
          }}
        >
          {copy.cta.comment}
          <DownArrow bounce={Math.abs(Math.sin((t - CUES.cta.comment) * Math.PI * 1.8)) * 12} />
        </div>
      ) : null}
      </div>
    </>
  );
};
