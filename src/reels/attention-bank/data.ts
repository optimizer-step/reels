// Illustrative numbers for reel 002 (labelled "simplified illustration" on screen).
import type { P3 } from "../../kit";

export const SENT_A = ["I", "deposited", "cash", "at", "the", "bank"];
export const SENT_B = ["We", "sat", "on", "the", "river", "bank"];

// attention from "bank" to each earlier word (the remaining 0.10 is "bank" to itself)
export const W_A = [0.04, 0.24, 0.44, 0.06, 0.12];
export const W_B = [0.05, 0.18, 0.07, 0.08, 0.52];

// causal attention matrix for sentence A (rows attend to columns at or before them)
export const HEAT_A: number[][] = [
  [1.0, 0, 0, 0, 0, 0],
  [0.38, 0.62, 0, 0, 0, 0],
  [0.12, 0.53, 0.35, 0, 0, 0],
  [0.07, 0.28, 0.45, 0.2, 0, 0],
  [0.05, 0.14, 0.22, 0.34, 0.25, 0],
  [0.04, 0.24, 0.44, 0.06, 0.12, 0.1],
];

export const MONEY_WORDS: [string, P3][] = [
  ["cash", [-1.0, 0.65, 0.45]],
  ["loan", [-1.55, 0.3, 0.1]],
  ["ATM", [-1.3, 0.88, -0.05]],
  ["cheque", [-1.68, 0.72, 0.55]],
  ["interest", [-0.98, 0.12, 0.05]],
  ["deposit", [-1.38, 0.08, 0.62]],
];
export const RIVER_WORDS: [string, P3][] = [
  ["river", [1.0, 0.02, -0.1]],
  ["water", [1.48, -0.05, -0.55]],
  ["shore", [1.3, -0.48, 0.05]],
  ["boat", [0.95, -0.58, -0.6]],
  ["fish", [1.62, -0.38, -0.2]],
  ["stream", [1.15, 0.22, -0.78]],
];
export const OTHER_WORDS: [string, P3][] = [
  ["cricket", [0.15, 1.05, 0.95]],
  ["pizza", [-0.35, -0.95, -0.95]],
  ["music", [0.55, 0.8, -1.25]],
  ["train", [-0.65, -0.75, 1.15]],
  ["phone", [0.3, -0.3, 1.45]],
  ["chai", [-0.2, 0.55, -1.3]],
];
export const MONEY_C: P3 = [-1.3, 0.47, 0.29];
export const RIVER_C: P3 = [1.25, -0.21, -0.36];
export const BANK_START: P3 = [0, 0.12, 0];
export const BANK_A: P3 = [-0.84, 0.44, 0.3];
export const BANK_B: P3 = [0.78, -0.1, -0.2];
