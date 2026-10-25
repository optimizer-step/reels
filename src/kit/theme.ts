// Optimizer Step house style. Every reel imports from here, so a change here restyles them all.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const COLORS = {
  bg: "#0B0B0F",
  bgRaised: "#15151B",
  line: "#2A2A33",
  text: "#F5F5F0",
  yellow: "#FFD60A",
  red: "#FF3B30",
  green: "#30D158",
  blue: "#4DA3FF",
  grey: "#8A8A93",
  paper: "#F4F1EA",
  paperDirty: "#C4C0B6",
  ink: "#1B1B1D",
  stamp: "#C2362B",
};

export const FONTS = {
  head: "Space Grotesk",
  mono: "JetBrains Mono",
  serif: "Source Serif 4",
};

export const SIZES = {
  headline: 100,
  headlineSmall: 84,
  tag: 30,
  hud: 44,
};

// Instagram Reels safe zone: all text must stay inside this box
// (Instagram's UI covers the right ~140 px and the bottom ~420 px).
export const SAFE = { left: 60, right: 940, top: 220, bottom: 1500 };
// Horizontal centre of the safe zone; content is centred here, not on the frame.
export const CX = (SAFE.left + SAFE.right) / 2;

// Keep headlines and tags out of this band so optional captions never collide.
export const CAPTION_BAND = { top: 1330, bottom: 1480 };

// Dev overlay that draws the safe zone and caption band.
export const SHOW_SAFE_ZONE = false;
