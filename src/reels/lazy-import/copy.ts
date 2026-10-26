// Every on-screen string for reel 004. *word* = highlighted (yellow + underline swipe).
export const copy = {
  hook: {
    headline: [["ONE", "WORD."], ["*16×*", "FASTER", "START."]],
    normal: "normal imports",
    lazy: "lazy imports",
    command: "python report.py --help",
    tag: "measured · Python 3.15.1 · report --help · slowed 4×",
  },
  why: { headline: [["EVERY", "IMPORT"], ["RUNS", "*FIRST*"]], waiting: "YOUR CODE · WAITING" },
  cascade: { headline: [["ONE", "IMPORT"], ["=", "*565*", "MODULES"]] },
  total: {
    headline: [["892", "MODULES"], ["JUST", "FOR", "*--help*"]],
    used: "0 USED",
    tag: "measured · real module trees from python -X importtime",
  },
  hack: {
    headline: [["THE", "OLD", "*HACK*"]],
    tag: "~17% of Python's own imports (outside tests) already hide in functions · PEP 810",
  },
  lazy: { headline: [["ONE", "WORD:"], ["*lazy*"]] },
  token: {
    headline: [["LOADS", "ON"], ["FIRST", "*USE*"]],
    token: "TOKEN",
    never: "NEVER LOADED",
    loaded: "LOADED ON USE",
    hud: "--help with lazy",
  },
  history: {
    headline: [["WHY", "SO", "*LATE?*"]],
    a: { year: "2022", pep: "PEP 690", what: "Make ALL imports lazy", stamp: "REJECTED", why: "Could break code that expects imports to run right away" },
    b: { year: "2025", pep: "PEP 810", what: "Opt-in: one line at a time", stamp: "ACCEPTED", why: "Unanimously, 3 Nov 2025" },
    c: { year: "OCT 2026", pep: "Python 3.15", what: "Ships with lazy imports", stamp: "", why: "" },
  },
  payoff: {
    headline: [["WHY", "IT", "*MATTERS*"]],
    cards: [
      { big: "50–70%", label: "faster CLI start-up" },
      { big: "30–40%", label: "less memory" },
      { big: "1 line", label: "imports stay on top" },
    ],
    tag: "real-world figures quoted in PEP 810",
    catch: "THE CATCH",
    catchSub: "A broken import fails at first use, not at start-up",
  },
  cta: {
    headline: [["COMMENT"], ["*LAZY*"]],
    sub: "for the benchmark script",
    placeholder: "Add a comment…",
    typed: "LAZY",
  },
  cover: [["ONE", "WORD."], ["*16×*", "FASTER"], ["PYTHON", "START."]],
};
