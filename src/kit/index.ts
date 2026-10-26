// Optimizer Step reel kit: import everything a reel needs from here.
export * from "./theme";
export * from "./anim";
export { ensureFonts } from "./fonts";
export { makeCue } from "./sync";
export type { Word } from "./sync";

// v1: house style building blocks
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

// v2: camera world, 3D, ML visuals, effects
export { Camera, Layer, At, FOCUS, cameraAt, useCamera, worldToScreen } from "./components/Camera";
export type { CamKey, CamState } from "./components/Camera";
export { Space3D, project } from "./components/Space3D";
export type { P3, Point3D, View3D } from "./components/Space3D";
export { TokenRow, tokenLayout } from "./components/Tokens";
export type { TokenBox, TokenState } from "./components/Tokens";
export { AttentionBeams } from "./components/Attention";
export { Heatmap } from "./components/Heatmap";
export { DecodeText, DustField, Burst, Glitch, glow } from "./components/Effects";

// v3: editing craft — time remaps, shake, motion blur, terrain, controls, counters, charts
export { remap, shake, shutterSamples, squashStretch, stepValue } from "./motion";
export type { TimeKey, Impact } from "./motion";
export { Terrain, makeProjector, ramp } from "./components/Terrain";
export type { OrbitCam, V3, Projected, TerrainProps } from "./components/Terrain";
export { RewindFX, WhipPan, Flash } from "./components/Transitions";
export { Odometer } from "./components/Odometer";
export { Slider } from "./components/Slider";
export { LineChart } from "./components/LineChart";
export type { Series } from "./components/LineChart";
export { EndCard, END_CARD } from "./components/EndCard";
