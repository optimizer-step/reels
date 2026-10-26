// Every on-screen string for reel 003. *word* = yellow highlight with underline swipe.
export const copy = {
  hook: [["ONE", "NUMBER"], ["CAN", "BREAK"], ["*AI*", "*TRAINING*"]],
  rewind: "REWIND",
  valley: {
    headline: [["AI", "LEARNS", "BY"], ["GOING", "*DOWNHILL*"]],
    high: "HIGH = MORE WRONG",
    low: "LOW = LESS WRONG",
    goal: "GOAL",
    tag: "Simplified example · every number is computed",
  },
  rule: {
    formula: { step: "STEP", eq: "=", rate: "LEARNING RATE", times: "×", slope: "SLOPE" },
    slopeLabel: "SLOPE",
    stepLabel: "STEP",
  },
  slider: { label: "LEARNING RATE", unstable: "UNSTABLE" },
  small: { label: [["TOO", "*SMALL*"]], far: "STEP 40 · STILL FAR" },
  right: { label: [["JUST", "*RIGHT*"]] },
  big: { label: [["TOO", "*BIG*"]], explode: "LOSS EXPLODES" },
  hud: { step: "STEP", loss: "LOSS" },
  chart: {
    headline: [["SAME", "PROBLEM."], ["ONE", "NUMBER", "*CHANGED.*"]],
    yLabel: "LOSS",
    xLabel: "STEP",
    big: "0.22",
    right: "0.18",
    small: "0.02",
    breakout: { from: "LOSS", to: "2,28,229 BY STEP 30" }, // drawn with <Arrow /> between
  },
  twist: {
    headline: [["BIG", "MODELS", "WARM", "UP,"], ["THEN", "*SLOW*", "*DOWN*"]],
    yLabel: "LEARNING RATE",
    xLabel: "TRAINING TIME",
    warm: "WARM UP",
    peak: "PEAK",
    decay: "SLOW DOWN",
    tag: "GPT-3 schedule · Brown et al., 2020 · not to scale",
  },
  cta: {
    headline: [["COMMENT", "A"], ["*LEARNING*", "*RATE*"]],
    sub: "I'll run yours in the next reel",
    placeholder: "Add a comment…",
    typed: "0.15",
  },
  cover: [["ONE", "NUMBER"], ["CAN", "*BREAK*"], ["AI", "TRAINING"]],
};
