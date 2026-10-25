import React from "react";
import { COLORS, FONTS, RobotIcon, prog, springAt } from "../../../kit";
import { copy } from "../copy";
import { CUES, STATIONS } from "../timeline";

const C = CUES.takeaway;
const X = STATIONS.prompts.x - 410;
const W = 820;
const TOP = STATIONS.prompts.y - 300; // first card sits at screen y ~560

const PromptCard: React.FC<{
  t: number;
  top: number;
  prompt: string;
  typing: [number, number];
  reply: string;
  replyAt: number;
  label: string;
  labelColor: string;
}> = ({ t, top, prompt, typing, reply, replyAt, label, labelColor }) => {
  const s = springAt(t, typing[0] - 0.25);
  if (s <= 0.001) return null;
  const n = Math.floor(prompt.length * prog(t, typing[0], typing[1], (x) => x));
  const typingNow = t < typing[1] + 0.1;
  const cursor = typingNow || Math.floor(t * 3) % 2 === 0;
  const r = springAt(t, replyAt);
  const lab = springAt(t, replyAt + 0.25);
  return (
    <div
      style={{
        position: "absolute",
        left: X,
        top,
        width: W,
        borderRadius: 30,
        background: "#121218",
        border: `3px solid ${COLORS.line}`,
        boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
        padding: "28px 30px",
        opacity: Math.min(1, s * 1.5),
        transform: `translateY(${(1 - s) * 60}px) scale(${0.92 + 0.08 * s})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ padding: "6px 14px", borderRadius: 10, background: "rgba(255,255,255,0.08)", fontFamily: FONTS.mono, fontWeight: 700, fontSize: 24, color: COLORS.grey }}>
          {copy.takeaway.youLabel}
        </div>
        <div style={{ fontFamily: FONTS.mono, fontWeight: 500, fontSize: 34, color: COLORS.text, whiteSpace: "pre" }}>
          {prompt.slice(0, n)}
          <span style={{ display: "inline-block", width: 16, height: 36, marginLeft: 3, verticalAlign: "-5px", background: COLORS.yellow, opacity: cursor ? 1 : 0 }} />
        </div>
      </div>
      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: r,
          transform: `translateY(${(1 - r) * 20}px)`,
          height: r > 0 ? undefined : 0,
          overflow: "hidden",
        }}
      >
        <RobotIcon size={46} color={labelColor} />
        <div style={{ fontFamily: FONTS.head, fontWeight: 500, fontSize: 36, color: COLORS.text }}>{reply}</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 22,
          top: -22,
          padding: "6px 16px",
          borderRadius: 12,
          background: labelColor,
          fontFamily: FONTS.mono,
          fontWeight: 700,
          fontSize: 26,
          color: COLORS.bg,
          transform: `scale(${lab}) rotate(${-4 + (1 - lab) * 20}deg)`,
          opacity: Math.min(1, lab * 1.4),
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** World station: vague prompt vs. prompt with context. */
export const PromptStation: React.FC<{ t: number }> = ({ t }) => (
  <>
    <PromptCard t={t} top={TOP} prompt={copy.takeaway.prompt1} typing={C.type1} reply={copy.takeaway.reply1} replyAt={C.reply1} label={copy.takeaway.label1} labelColor={COLORS.red} />
    <PromptCard t={t} top={TOP + 260} prompt={copy.takeaway.prompt2} typing={C.type2} reply={copy.takeaway.reply2} replyAt={C.reply2} label={copy.takeaway.label2} labelColor={COLORS.yellow} />
  </>
);
