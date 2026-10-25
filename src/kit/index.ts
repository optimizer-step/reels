// Optimizer Step reel kit: import everything a reel needs from here.
export * from "./theme";
export * from "./anim";
export { ensureFonts } from "./fonts";
export { Grain, Vignette } from "./components/Grain";
export { Degrade } from "./components/Degrade";
export { LightBar } from "./components/LightBar";
export { Headline, Tag } from "./components/Headline";
export { Captions, SafeZoneOverlay } from "./components/Captions";
export { CounterHUD, hudNumber, hudTextAt } from "./components/HUD";
export type { HudEvent } from "./components/HUD";
export { BellCurve, CURVE, heightAt, px, tailRatio } from "./components/BellCurve";
export { RobotIcon, GlobeIcon, Arrow, DownArrow } from "./components/Icons";
export { Backdrop } from "./components/Backdrop";
export { useBeatSwitch } from "./components/BeatSwitcher";
export type { Beat } from "./components/BeatSwitcher";
export { ReelAudio } from "./components/ReelAudio";
export type { SfxCue } from "./components/ReelAudio";
