// Code shown on screen (a condensed view of docs/reels/004-lazy-import/eager_app.py) and the
// measured numbers it produces. Every number here comes from docs/reels/004-lazy-import/.
import { COLORS } from "../../kit";

export type Seg = [string, string];
const KW = COLORS.violet;
const MOD = COLORS.text;
const NAME = COLORS.blue;
const P = COLORS.grey;

export const CODE: Seg[][] = [
  [["import", KW], [" argparse", MOD]],
  [["import", KW], [" pandas", MOD], [" as", KW], [" pd", NAME]],
  [["import", KW], [" matplotlib.pyplot", MOD], [" as", KW], [" plt", NAME]],
  [["import", KW], [" requests", MOD]],
  [],
  [["def", KW], [" main", COLORS.yellow], ["():", P]],
  [["    args = parser.parse_args()", MOD]],
  [["    data = ", MOD], ["pd", NAME], [".read_csv(args.url)", MOD]],
  [["    data.plot(); ", MOD], ["plt", NAME], [".savefig(args.out)", MOD]],
];

/** Lines that get `lazy ` in front, and the library each import line loads. */
export const LAZY_LINES = [1, 2, 3];
export const LIBS = [
  { line: 0, tree: "argparse", label: "argparse", modules: 21, ms: 10.6, color: COLORS.grey },
  { line: 1, tree: "pandas", label: "pandas", modules: 565, ms: 301.3, color: COLORS.blue },
  { line: 2, tree: "matplotlib.pyplot", label: "matplotlib", modules: 167, ms: 341.1, color: COLORS.green },
  { line: 3, tree: "requests", label: "requests", modules: 114, ms: 51.4, color: COLORS.orange },
] as const;

/** Measured on Python 3.15.1 (docs/reels/004-lazy-import/results.txt). */
export const MEASURED = {
  normal: { ms: 788, modules: 892, mb: 125 },
  lazy: { ms: 48, modules: 67, mb: 22 },
  /** interpreter start-up + modules loaded before the first import line */
  baseMs: 788 - (10.6 + 301.3 + 341.1 + 51.4),
};
