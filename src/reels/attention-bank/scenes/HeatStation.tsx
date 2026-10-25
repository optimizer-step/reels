import React from "react";
import { Heatmap, prog } from "../../../kit";
import { HEAT_A, SENT_A } from "../data";
import { CUES } from "../timeline";

const C = CUES.heatmap;
export const HEAT = { left: 1700, top: 2290, cell: 96 };

/** World station: the causal attention matrix for sentence A. */
export const HeatStation: React.FC<{ t: number }> = ({ t }) => (
  <Heatmap
    t={t}
    labels={SENT_A}
    weights={HEAT_A}
    x={HEAT.left}
    y={HEAT.top}
    cell={HEAT.cell}
    start={C.cells}
    dur={1.5}
    causal
    highlightRow={SENT_A.length - 1}
    highlight={prog(t, C.row, C.row + 0.3)}
  />
);
