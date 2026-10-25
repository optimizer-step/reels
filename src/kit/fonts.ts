import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { FONTS } from "./theme";

// Fonts are bundled locally (from @fontsource) so rendering never needs the network.
const faces: { family: string; file: string; weight: string; style?: string }[] = [
  { family: FONTS.head, file: "space-grotesk-latin-500-normal.woff2", weight: "500" },
  { family: FONTS.head, file: "space-grotesk-latin-700-normal.woff2", weight: "700" },
  { family: FONTS.mono, file: "jetbrains-mono-latin-500-normal.woff2", weight: "500" },
  { family: FONTS.mono, file: "jetbrains-mono-latin-700-normal.woff2", weight: "700" },
  { family: FONTS.serif, file: "source-serif-4-latin-400-normal.woff2", weight: "400" },
  { family: FONTS.serif, file: "source-serif-4-latin-600-normal.woff2", weight: "600" },
  { family: FONTS.serif, file: "source-serif-4-latin-400-italic.woff2", weight: "400", style: "italic" },
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded) return;
  loaded = true;
  for (const f of faces) {
    loadFont({
      family: f.family,
      url: staticFile(`fonts/${f.file}`),
      weight: f.weight,
      style: f.style ?? "normal",
    });
  }
};
