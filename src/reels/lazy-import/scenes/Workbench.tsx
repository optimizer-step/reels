import React from "react";
import { COLORS, FONTS, Odometer, ease, lerp, prog, springAt } from "../../../kit";
import { copy } from "../copy";
import { CODE, LAZY_LINES, LIBS, MEASURED } from "../data";
import { BEATS, CUES, TOKEN_USE, WHY_STEPS } from "../timeline";
import { ModuleTree, mixHex, type TreeKey } from "./Tree";

// ---------- geometry (screen px) ----------
const CARD = { x: 60, y: 455, w: 880, h: 516 };
const TITLE_H = 52;
const LH = 46;
const FS = 32;
const CW = FS * 0.6;
const LINE0 = CARD.y + TITLE_H + 24;
const CODE_X = 152;
const lineY = (slot: number) => LINE0 + slot * LH;

// roots of the import trees in the cascade / total beats
const ROOT_CASCADE = { x: 500, y: 905 };
const ROOTS_TOTAL: Record<number, { x: number; y: number; r: number }> = {
  0: { x: 168, y: 1150, r: 52 },
  1: { x: 395, y: 845, r: 262 },
  2: { x: 790, y: 670, r: 140 },
  3: { x: 800, y: 1035, r: 122 },
};
const TOKENS_Y = 1000;
const TOKEN = { w: 250, h: 228 };
const TOKEN_X = [60, 375, 690];

const B = BEATS;
const C = CUES;

// ---------- line choreography ----------
/** Slot of each line in the "imports hidden in main()" layout. */
const HACK_SLOT = [0, 3, 4, 5, 1, 2, 6, 7, 8];
const HACK_INDENT = [0, 4, 4, 4, 0, 0, 0, 0, 0];

const sinkP = (t: number, i: number) => {
  const d = (HACK_SLOT[i] !== i ? 1 : 0) * (i <= 3 ? (i - 1) * 0.08 : 0.05);
  const down = prog(t, C.hack.sink[0] + d, C.hack.sink[1] + d, ease.inOut);
  const up = prog(t, B.lazy.start + d, B.lazy.start + 0.7 + d, ease.inOut);
  return down * (1 - up);
};

/** Editor visibility: in for why, out for cascade/total, back for hack..token. */
const editorShown = (t: number) => {
  const inA = prog(t, B.why.start + 0.05, B.why.start + 0.45, ease.out);
  const outA = prog(t, B.cascade.start, B.cascade.start + 0.22, ease.in);
  const inB = prog(t, B.hack.start + 0.15, B.hack.start + 0.6, ease.out);
  return t < B.hack.start ? Math.min(inA, 1 - outA) : inB;
};

/** Where an import line sits as a "pill" (root of its tree) in the cascade / total beats. */
const pillPos = (t: number, i: number) => {
  const tot = ROOTS_TOTAL[i] ?? ROOTS_TOTAL[1];
  if (i === 1) {
    const toTotal = prog(t, B.total.start, B.total.start + 0.7, ease.inOut);
    return { x: lerp(ROOT_CASCADE.x, tot.x, toTotal), y: lerp(ROOT_CASCADE.y, tot.y, toTotal) };
  }
  return { x: tot.x, y: tot.y };
};

/** 0 = in the editor, 1 = a pill at its tree root. */
const pillP = (t: number, i: number) => {
  if (i > 3) return 0;
  const start = i === 1 ? B.cascade.start + 0.1 : B.total.start + 0.15 + i * 0.06;
  const go = prog(t, start, start + 0.65, ease.inOut);
  const bd = [0.3, 0, 0.12, 0.22][i];
  const back = prog(t, B.hack.start + bd, B.hack.start + bd + 0.5, ease.inOut);
  return go * (1 - back);
};

/** 0..1: the pill shows the short "library · modules" label instead of the code line (total beat). */
const shortP = (t: number, i: number) => {
  if (i > 3 || t < B.total.start || t >= B.hack.start + 0.6) return 0;
  const at = i === 1 ? B.total.start + 0.2 : B.total.start + 0.45 + i * 0.06;
  const bd = [0.3, 0, 0.12, 0.22][i];
  return prog(t, at, at + 0.25) * (1 - prog(t, B.hack.start + bd, B.hack.start + bd + 0.2));
};

const lazyTyped = (t: number, i: number) => {
  const k = LAZY_LINES.indexOf(i);
  if (k < 0) return 0;
  return prog(t, C.lazy.stamp + k * 0.13, C.lazy.stamp + k * 0.13 + 0.22, (x) => x);
};

const CodeLine: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  const segs = CODE[i];
  const sp = sinkP(t, i);
  const slot = lerp(i, HACK_SLOT[i], sp);
  const indent = HACK_INDENT[i] * sp;
  const lz = lazyTyped(t, i);
  const lazyChars = 5 * lz; // "lazy "
  const pp = pillP(t, i);
  const ed = editorShown(t);
  // editor position
  const ex = CODE_X + (indent + lazyChars) * CW;
  const ey = lineY(slot);
  // pill position (centred on the tree root)
  const text = segs.map((s) => s[0]).join("");
  const pillScale = i === 1 && t < B.total.start + 0.7 ? lerp(1.18, 1, prog(t, B.total.start, B.total.start + 0.7)) : i === 1 ? 1 : 0.82;
  const sp2 = shortP(t, i);
  const shortText = i <= 3 ? `${LIBS[i].label} · ${LIBS[i].modules}` : "";
  const chars = lerp(text.length + (lz > 0 ? 5 : 0), shortText.length, sp2);
  const pw = chars * CW * pillScale;
  const pos = pillPos(t, i);
  const px = pos.x - pw / 2;
  const py = pos.y - (FS * pillScale) / 2 - 6;
  const x = lerp(ex, px, pp);
  const y = lerp(ey, py, pp);
  const scale = lerp(1, pillScale, pp);
  // lines other than imports fade with the editor; imports stay visible while they are pills
  const pillAlive = i <= 3 && pp > 0.001;
  // the pandas line stays solid while it lifts out of the editor (it is the hero of the cascade)
  const hero = i === 1 && t >= B.cascade.start && t < B.hack.start ? 1 : 0;
  const op = pillAlive ? Math.max(ed, pp, hero) : ed;
  // the other import lines leave with the editor and come back as pills in the total beat
  const reappear = i !== 1 && t >= B.total.start && t < B.hack.start ? Math.min(1, pp * 2) : 1;
  const opacity = op * reappear;
  if (opacity <= 0.001 || !segs.length) return null;
  // the old hack: moved imports get a red squiggle
  const mess = i >= 1 && i <= 3 ? prog(t, C.hack.mess + (i - 1) * 0.08, C.hack.mess + 0.3 + (i - 1) * 0.08) * (1 - prog(t, B.lazy.start, B.lazy.start + 0.3)) : 0;
  const lazyFlash = lz > 0 ? 1 - prog(t, C.lazy.stamp + 0.5, C.lazy.stamp + 1.2) : 0;
  const libColor = i <= 3 ? LIBS[i].color : COLORS.text;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale})`,
        transformOrigin: "left top",
        fontFamily: FONTS.mono,
        fontWeight: 600,
        fontSize: FS,
        lineHeight: `${LH}px`,
        whiteSpace: "pre",
        opacity,
      }}
    >
      {pp > 0.02 ? (
        <div
          style={{
            position: "absolute",
            left: -18,
            top: 0,
            width: chars * CW + 36,
            height: LH,
            borderRadius: LH / 2,
            background: "rgba(16,16,22,0.92)",
            border: `2px solid ${libColor}`,
            boxShadow: `0 0 28px ${libColor}66`,
            opacity: pp,
          }}
        />
      ) : null}
      {sp2 > 0 ? (
        <span style={{ position: "absolute", left: 0, top: 0, color: libColor, fontWeight: 700, opacity: sp2 }}>{shortText}</span>
      ) : null}
      <span style={{ position: "relative", opacity: 1 - sp2 }}>
        {lz > 0 ? (
          <span
            style={{
              position: "absolute",
              right: "100%",
              color: COLORS.yellow,
              fontWeight: 800,
              textShadow: `0 0 ${10 + 30 * lazyFlash}px ${COLORS.yellow}`,
            }}
          >
            {"lazy ".slice(0, Math.ceil(lazyChars))}
          </span>
        ) : null}
        {segs.map(([s, c], k) => (
          <span key={k} style={{ color: c }}>
            {s}
          </span>
        ))}
        {mess > 0 ? (
          <svg width={text.length * CW} height={12} style={{ position: "absolute", left: 0, top: LH - 8, overflow: "visible" }}>
            <path
              d={Array.from({ length: Math.ceil((text.length * CW) / 12) }, (_, k) => `${k ? "L" : "M"}${k * 12} ${k % 2 ? 0 : 7}`).join(" ")}
              fill="none"
              stroke={COLORS.red}
              strokeWidth={3}
              strokeDasharray={`${text.length * CW * 1.2 * mess} 9999`}
            />
          </svg>
        ) : null}
      </span>
    </div>
  );
};

/** Playhead bar behind the line that Python is executing. */
const playheadAt = (t: number): { slot: number; o: number; color: string } | null => {
  if (t >= B.why.start && t < B.cascade.start) {
    let slot = -1;
    WHY_STEPS.forEach((s, k) => {
      if (t >= s) slot = k;
    });
    if (slot < 0) return null;
    const o = 1 - prog(t, B.cascade.start - 0.3, B.cascade.start);
    return { slot, o, color: COLORS.yellow };
  }
  if (t >= TOKEN_USE.pd - 0.45 && t < C.token.never + 0.3) {
    const slot = t < TOKEN_USE.plt - 0.2 ? 7 : 8;
    return { slot, o: prog(t, TOKEN_USE.pd - 0.45, TOKEN_USE.pd - 0.25) * (1 - prog(t, C.token.never, C.token.never + 0.3)), color: COLORS.green };
  }
  return null;
};

const Editor: React.FC<{ t: number }> = ({ t }) => {
  const ed = editorShown(t);
  const ph = playheadAt(t);
  const phY = ph ? lineY(ph.slot) : 0;
  // smooth playhead travel
  const prev = ph && ph.slot > 0 ? lineY(ph.slot - 1) : phY;
  const stepStart = ph && t < B.cascade.start ? WHY_STEPS[Math.min(3, ph.slot)] : ph && ph.slot === 8 ? TOKEN_USE.plt - 0.2 : TOKEN_USE.pd - 0.45;
  const py = ph ? lerp(prev, phY, prog(t, stepStart, stepStart + 0.18, ease.out)) : 0;
  const waiting = t >= C.why.waiting && t < B.cascade.start ? prog(t, C.why.waiting, C.why.waiting + 0.3) * (1 - prog(t, B.cascade.start - 0.2, B.cascade.start)) : 0;
  const dimMain = t >= B.why.start && t < B.cascade.start ? 0.45 : 0;
  return (
    <>
      {ed > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD.h,
            borderRadius: 28,
            background: "linear-gradient(180deg, rgba(24,24,32,0.95), rgba(15,15,21,0.95))",
            border: "2px solid rgba(255,255,255,0.09)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
            opacity: ed,
            transform: `scale(${0.96 + 0.04 * ed})`,
            transformOrigin: "50% 0%",
          }}
        >
          <div style={{ height: TITLE_H, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c, opacity: 0.75 }} />
            ))}
            <span style={{ fontFamily: FONTS.mono, fontWeight: 600, fontSize: 24, color: COLORS.grey, marginLeft: 12 }}>report.py</span>
          </div>
          {/* gutter */}
          {CODE.map((_, k) => (
            <div key={k} style={{ position: "absolute", left: 26, top: lineY(k) - CARD.y, width: 40, textAlign: "right", fontFamily: FONTS.mono, fontSize: 24, lineHeight: `${LH}px`, color: "rgba(255,255,255,0.22)" }}>
              {k + 1}
            </div>
          ))}
          {ph ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: py - CARD.y, height: LH, background: `${ph.color}1f`, borderLeft: `5px solid ${ph.color}`, opacity: ph.o }} />
          ) : null}
          {dimMain > 0 ? (
            <div style={{ position: "absolute", left: 70, right: 10, top: lineY(5) - CARD.y - 4, height: LH * 4 + 8, borderRadius: 12, background: `rgba(11,11,15,${dimMain * prog(t, B.why.start + 0.4, B.why.start + 0.8)})` }} />
          ) : null}
          {waiting > 0 ? (
            <div style={{ position: "absolute", right: 26, top: lineY(5) - CARD.y + 8, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 22, letterSpacing: "0.06em", color: COLORS.yellow, opacity: waiting, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: COLORS.yellow, opacity: 0.5 + 0.5 * Math.sin(t * 8) }} />
              {copy.why.waiting}
            </div>
          ) : null}
        </div>
      ) : null}
      {CODE.map((_, i) => (
        <CodeLine key={i} t={t} i={i} />
      ))}
    </>
  );
};

// ---------- start-up bar (why beat) ----------
const StartupBar: React.FC<{ t: number }> = ({ t }) => {
  const o = prog(t, B.why.start + 0.3, B.why.start + 0.7) * (1 - prog(t, B.cascade.start, B.cascade.start + 0.3));
  if (o <= 0.001) return null;
  const X0 = 90;
  const W = 640;
  const pxPerMs = W / MEASURED.normal.ms;
  const segs = [
    { label: "python", ms: MEASURED.baseMs, color: "#3a3a46", at: B.why.start + 0.4 },
    ...LIBS.map((l, k) => ({ label: l.label, ms: l.ms, color: l.color, at: WHY_STEPS[k] })),
  ];
  let x = X0;
  const parts = segs.map((s, k) => {
    const g = prog(t, s.at, s.at + 0.35, ease.out);
    const w = s.ms * pxPerMs * g;
    const el = (
      <div key={k} style={{ position: "absolute", left: x, top: 0, width: w, height: 54, background: s.color, boxShadow: g > 0 ? `0 0 18px ${s.color}88` : undefined, borderRight: "2px solid #0B0B0F" }}>
        {s.ms * pxPerMs > 100 && g > 0.6 ? (
          <div style={{ position: "absolute", left: 10, top: 62, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 21, color: s.color === "#3a3a46" ? COLORS.grey : s.color, whiteSpace: "nowrap", opacity: (g - 0.6) / 0.4 }}>
            {s.label}
            <br />
            <span style={{ color: COLORS.grey }}>{Math.round(s.ms)} ms</span>
          </div>
        ) : null}
      </div>
    );
    x += w;
    return el;
  });
  const total = segs.reduce((s, sg) => s + sg.ms * prog(t, sg.at, sg.at + 0.35, ease.out), 0);
  return (
    <div style={{ position: "absolute", left: 0, top: 1010, width: 1080, height: 300, opacity: o }}>
      <div style={{ position: "absolute", left: X0, top: -46, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 24, letterSpacing: "0.08em", color: COLORS.grey }}>
        START-UP <span style={{ color: COLORS.text }}>{Math.round(total)} ms</span>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 54 }}>{parts}</div>
      {/* your code, pushed to the right until every import has run */}
      <div
        style={{
          position: "absolute",
          left: x + 10,
          top: -6,
          width: 150,
          height: 66,
          borderRadius: 14,
          border: `2px dashed ${COLORS.yellow}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONTS.mono,
          fontWeight: 700,
          fontSize: 24,
          color: COLORS.yellow,
          background: "rgba(255,214,10,0.06)",
        }}
      >
        main()
      </div>
    </div>
  );
};

// ---------- trees + counters (cascade, total) ----------
const treeState = (t: number, i: number) => {
  const lib = LIBS[i];
  const pos = pillPos(t, i);
  const tot = ROOTS_TOTAL[i];
  let grow = 0;
  let r = tot.r;
  if (i === 1) {
    grow = prog(t, C.cascade.bloom[0], C.cascade.bloom[1], (x) => 1 - Math.pow(1 - x, 1.6));
    r = lerp(330, tot.r, prog(t, B.total.start, B.total.start + 0.7, ease.inOut));
  } else {
    const d = i === 0 ? 0.5 : i === 2 ? 0 : 0.25;
    grow = prog(t, C.total.bloom[0] + 0.3 + d, C.total.bloom[1] - 0.2 + d * 0.3, (x) => 1 - Math.pow(1 - x, 1.4));
  }
  const back = prog(t, B.hack.start, B.hack.start + 0.55, ease.in);
  // as the pill flies back to its editor line, the tree collapses into it
  const ex = CODE_X + (lib.label.length * CW) / 2;
  const ey = lineY(lib.line) + LH / 2;
  const cx = lerp(pos.x, ex, back);
  const cy = lerp(pos.y + 2, ey, back);
  const grey = prog(t, C.total.stamp - 0.1, C.total.stamp + 0.3);
  return { grow, r, cx, cy, collapse: back, grey, color: lib.color, tree: lib.tree as TreeKey };
};

const Trees: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.cascade.bloom[0] || t > B.hack.start + 0.7) return null;
  return (
    <>
      {[1, 2, 3, 0].map((i) => {
        const s = treeState(t, i);
        return (
          <ModuleTree
            key={i}
            id={`tree-${i}`}
            tree={s.tree}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            grow={s.grow}
            color={s.color}
            grey={s.grey * 0.75}
            collapse={s.collapse}
            rotate={i * 0.9}
            labels={0}
            t={t}
          />
        );
      })}
    </>
  );
};

const Counters: React.FC<{ t: number }> = ({ t }) => {
  if (t < B.cascade.start || t > B.hack.start + 0.4) return null;
  const s = [0, 1, 2, 3].map((i) => treeState(t, i).grow);
  const inTotal = t >= B.total.start;
  const modules = inTotal ? Math.round(25 + LIBS.reduce((m, l, k) => m + l.modules * (k === 0 ? Math.max(s[0], 1) : s[k]), 0)) : Math.round(565 * s[1]);
  const ms = inTotal ? MEASURED.baseMs + LIBS.reduce((m, l, k) => m + l.ms * (k === 0 ? Math.max(s[0], 1) : s[k]), 0) : 301.3 * s[1];
  const mb = inTotal ? 12 + (MEASURED.normal.mb - 12) * (modules - 25) / (MEASURED.normal.modules - 25) : 0;
  const o = prog(t, C.cascade.bloom[0], C.cascade.bloom[0] + 0.3) * (1 - prog(t, B.hack.start, B.hack.start + 0.3));
  const item = (label: string, v: React.ReactNode, color = COLORS.text) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      {v}
      <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, letterSpacing: "0.1em", color }}>{label}</span>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 60, width: 880, top: 1206, display: "flex", justifyContent: "space-around", opacity: o }}>
      {item(inTotal ? "MODULES LOADED" : "MODULES (PANDAS)", <Odometer value={Math.min(inTotal ? 892 : 565, modules)} size={56} color={COLORS.text} />, COLORS.grey)}
      {item("START-UP", <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 56, color: COLORS.text }}>{Math.round(Math.min(inTotal ? 788 : 302, ms))} ms</span>, COLORS.grey)}
      {inTotal ? item("MEMORY", <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 56, color: COLORS.text }}>{Math.round(mb)} MB</span>, COLORS.grey) : null}
    </div>
  );
};

const UsedStamp: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.total.stamp || t > B.hack.start + 0.3) return null;
  const s = springAt(t, C.total.stamp, { damping: 11, stiffness: 320 });
  const o = Math.min(1, s * 2) * (1 - prog(t, B.hack.start, B.hack.start + 0.25));
  return (
    <div
      style={{
        position: "absolute",
        left: 500,
        top: 870,
        transform: `translate(-50%, -50%) rotate(-9deg) scale(${2.2 - 1.2 * s})`,
        padding: "10px 34px",
        border: `8px solid ${COLORS.red}`,
        borderRadius: 18,
        fontFamily: FONTS.head,
        fontWeight: 700,
        fontSize: 120,
        letterSpacing: "-0.02em",
        color: COLORS.red,
        background: "rgba(11,11,15,0.6)",
        opacity: o,
        boxShadow: `0 0 50px ${COLORS.red}55`,
        whiteSpace: "nowrap",
      }}
    >
      {copy.total.used}
    </div>
  );
};

// ---------- tokens (token beat) ----------
const Token: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const lib = LIBS[k + 1];
  const appear = springAt(t, C.token.tokens + k * 0.12, { damping: 13, stiffness: 200 });
  const out = prog(t, B.token.end - 0.25, B.token.end + 0.05);
  if (appear <= 0.001 || out >= 1) return null;
  const useAt = k === 0 ? TOKEN_USE.pd : k === 1 ? TOKEN_USE.plt : Infinity;
  // flip: 0..0.5 shrink the ticket, 0.5..1 grow the loaded module
  const flip = prog(t, useAt, useAt + 0.36, (x) => x);
  const sx = flip < 0.5 ? 1 - flip * 2 : (flip - 0.5) * 2;
  const resolved = flip >= 0.5;
  const x = TOKEN_X[k];
  const y = TOKENS_Y;
  const name = k === 0 ? "pd" : k === 1 ? "plt" : "requests";
  const grow = resolved ? prog(t, useAt + 0.18, useAt + 1.0, ease.out) : 0;
  const neverS = k === 2 ? springAt(t, C.token.stamp, { damping: 11, stiffness: 300 }) : 0;
  const notch = 18;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: TOKEN.w, height: TOKEN.h, opacity: Math.min(1, appear * 1.5) * (1 - out), transform: `translateY(${(1 - appear) * 60}px)` }}>
      <div style={{ position: "absolute", inset: 0, transform: `scaleX(${Math.max(0.02, sx)})` }}>
        {!resolved ? (
          <svg width={TOKEN.w} height={TOKEN.h} style={{ position: "absolute", inset: 0 }}>
            <path
              d={`M 16 2 H ${TOKEN.w - 16} Q ${TOKEN.w - 2} 2 ${TOKEN.w - 2} 16 V ${TOKEN.h / 2 - notch} A ${notch} ${notch} 0 0 0 ${TOKEN.w - 2} ${TOKEN.h / 2 + notch} V ${TOKEN.h - 16} Q ${TOKEN.w - 2} ${TOKEN.h - 2} ${TOKEN.w - 16} ${TOKEN.h - 2} H 16 Q 2 ${TOKEN.h - 2} 2 ${TOKEN.h - 16} V ${TOKEN.h / 2 + notch} A ${notch} ${notch} 0 0 0 2 ${TOKEN.h / 2 - notch} V 16 Q 2 2 16 2 Z`}
              fill={mixHex(COLORS.bg, lib.color, k === 2 ? 0.05 + 0.04 * neverS : 0.1)}
              stroke={k === 2 && neverS > 0 ? mixHex(lib.color, COLORS.grey, neverS) : lib.color}
              strokeWidth={3}
              strokeDasharray="10 8"
            />
            <line x1={notch + 8} x2={TOKEN.w - notch - 8} y1={TOKEN.h / 2 + 34} y2={TOKEN.h / 2 + 34} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 6" strokeWidth={2} />
          </svg>
        ) : (
          <div style={{ position: "absolute", inset: 0, borderRadius: 18, border: `3px solid ${lib.color}`, background: mixHex(COLORS.bg, lib.color, 0.12), boxShadow: `0 0 ${40 * (1 - prog(t, useAt + 0.4, useAt + 1.4))}px ${lib.color}` }} />
        )}
        {!resolved ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: FONTS.mono, fontWeight: 700 }}>
            <div style={{ position: "absolute", top: 16, left: 22, right: 22, display: "flex", justifyContent: "space-between", fontSize: 18, letterSpacing: "0.12em", color: COLORS.grey }}>
              <span>{copy.token.token}</span>
              <span style={{ color: lib.color }}>#{String(7 + k).padStart(2, "0")}</span>
            </div>
            <span style={{ fontSize: name.length > 4 ? 44 : 64, color: lib.color, marginTop: 8 }}>{name}</span>
            <span style={{ fontSize: 18, color: COLORS.grey, marginTop: 14 }}>{lib.modules} modules waiting</span>
          </div>
        ) : null}
      </div>
      {resolved ? (
        <>
          <ModuleTree id={`tok-${k}`} tree={lib.tree as TreeKey} cx={TOKEN.w / 2} cy={TOKEN.h / 2 - 12} r={k === 0 ? 92 : 80} grow={grow} color={lib.color} rotate={k * 1.3} t={t} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: FONTS.mono, fontWeight: 700, fontSize: 18, letterSpacing: "0.08em", color: lib.color, opacity: prog(t, useAt + 0.5, useAt + 0.8) }}>
            {copy.token.loaded}
          </div>
        </>
      ) : null}
      {k === 2 && neverS > 0 ? (
        <div
          style={{
            position: "absolute",
            left: TOKEN.w / 2,
            top: TOKEN.h / 2,
            transform: `translate(-50%, -50%) rotate(-10deg) scale(${2 - neverS})`,
            padding: "6px 14px",
            border: `4px solid ${COLORS.red}`,
            borderRadius: 10,
            fontFamily: FONTS.mono,
            fontWeight: 800,
            fontSize: 32,
            color: COLORS.red,
            background: "rgba(11,11,15,0.88)",
            whiteSpace: "nowrap",
            opacity: Math.min(1, neverS * 2),
          }}
        >
          {copy.token.never}
        </div>
      ) : null}
    </div>
  );
};

const LazyHud: React.FC<{ t: number }> = ({ t }) => {
  const o = prog(t, C.token.tokens + 0.5, C.token.tokens + 0.9) * (1 - prog(t, B.token.end - 0.25, B.token.end + 0.05));
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 60, width: 880, top: 1252, display: "flex", justifyContent: "center", gap: 18, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 24, color: COLORS.grey, opacity: o, whiteSpace: "nowrap" }}>
      <span>{copy.token.hud}:</span>
      <span style={{ color: COLORS.green }}>{MEASURED.lazy.modules} modules</span>
      <span style={{ color: COLORS.green }}>{MEASURED.lazy.ms} ms</span>
      <span style={{ color: COLORS.green }}>{MEASURED.lazy.mb} MB</span>
    </div>
  );
};

/** The editor + runtime "workbench": the why, cascade, total, hack, lazy and token beats. */
export const Workbench: React.FC<{ t: number }> = ({ t }) => (
  <>
    <StartupBar t={t} />
    <Trees t={t} />
    <Editor t={t} />
    <Counters t={t} />
    <UsedStamp t={t} />
    {[0, 1, 2].map((k) => (
      <Token key={k} t={t} k={k} />
    ))}
    <LazyHud t={t} />
  </>
);

