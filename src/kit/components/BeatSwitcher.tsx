import React from "react";
import { AbsoluteFill } from "remotion";
import { lerp, prog } from "../anim";
import { FPS } from "../theme";
import { Backdrop } from "./Backdrop";
import { LightBar } from "./LightBar";

export type Beat = { start: number; end: number };

/**
 * Shows the beat active at time t. At each time listed in `wipes`, the next beat is revealed
 * top-to-bottom behind a photocopier light bar over `wipeFrames` frames. Other boundaries are hard cuts
 * (use those for beats that share a continuous visual).
 */
export function useBeatSwitch<Id extends string>(opts: {
  t: number;
  beats: Record<Id, Beat>;
  order: Id[];
  wipes: number[];
  wipeFrames?: number;
  render: (id: Id) => React.ReactNode;
}): { content: React.ReactNode; bar: React.ReactNode } {
  const { t, beats, order, wipes, wipeFrames = 6, render } = opts;
  const beatAt = (x: number): Id => {
    for (const id of order) if (x >= beats[id].start && x < beats[id].end) return id;
    return order[order.length - 1];
  };
  const half = wipeFrames / 2 / FPS;
  const w = wipes.find((x) => Math.abs(t - x) < half + 1e-6);
  if (w === undefined) return { content: render(beatAt(t)), bar: null };
  const p = prog(t, w - half, w + half, (x) => x);
  return {
    content: (
      <>
        {render(beatAt(w - 0.001))}
        <AbsoluteFill style={{ clipPath: `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0)` }}>
          <Backdrop t={t} />
          {render(beatAt(w + 0.001))}
        </AbsoluteFill>
      </>
    ),
    bar: <LightBar y={lerp(-150, 2070, p)} />,
  };
}
