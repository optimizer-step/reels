import React from "react";
import { COLORS, Headline, Tag } from "../../../kit";
import { copy } from "../copy";
import { BEATS, CUES } from "../timeline";

const B = BEATS;
const C = CUES;

export const HookHeadline: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline t={t} start={0} variant="slam" lineStarts={C.hook.lines} lines={copy.hook.headline} top={232} size={100} lineHeight={0.98} exit={B.hook.end - 0.12} />
    <Tag t={t} start={C.hook.tag} top={448} size={23} align="center" exit={B.hook.end - 0.12}>
      {copy.hook.tag}
    </Tag>
  </>
);

export const WorkbenchHeadlines: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline t={t} start={B.why.start + 0.45} lines={copy.why.headline} top={236} size={88} stagger={0.1} exit={B.cascade.start - 0.12} />
    <Headline t={t} start={B.cascade.start + 0.3} lines={copy.cascade.headline} top={236} size={88} stagger={0.1} exit={B.total.start - 0.12} />
    <Headline t={t} start={C.total.help - 0.4} lines={copy.total.headline} top={236} size={88} stagger={0.1} exit={B.hack.start - 0.12} />
    <Headline t={t} start={B.hack.start + 0.3} lines={copy.hack.headline} top={290} size={104} stagger={0.1} exit={B.lazy.start - 0.12} highlightColor={COLORS.red} />
    <Tag t={t} start={C.hack.tag} top={1000} size={24} exit={B.lazy.start - 0.1}>
      {copy.hack.tag}
    </Tag>
    <Headline t={t} start={B.lazy.start + 0.25} variant="slam" lineStarts={[B.lazy.start + 0.25, C.lazy.stamp]} lines={copy.lazy.headline} top={236} size={96} lineHeight={0.98} exit={B.token.start + 0.05} />
    <Headline t={t} start={B.token.start + 0.35} lines={copy.token.headline} top={236} size={88} stagger={0.1} exit={B.token.end - 0.2} highlightColor={COLORS.green} />
  </>
);

export const HistoryHeadline: React.FC<{ t: number }> = ({ t }) => (
  <Headline t={t} start={B.history.start + 0.4} lines={copy.history.headline} top={290} size={104} stagger={0.1} exit={B.payoff.start + 0.05} />
);

export const PayoffHeadlines: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline t={t} start={B.payoff.start + 0.35} lines={copy.payoff.headline} top={290} size={104} stagger={0.1} exit={C.payoff.catch - 0.2} />
    <Headline t={t} start={C.payoff.catch} variant="slam" lineStarts={[C.payoff.catch]} lines={[["THE", "*CATCH*"]]} top={290} size={104} highlightColor={COLORS.red} exit={B.payoff.end - 0.12} />
  </>
);
