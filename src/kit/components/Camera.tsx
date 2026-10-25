import React, { createContext, useContext } from "react";
import { ease as E, lerp } from "../anim";
import { CX, FPS } from "../theme";

/**
 * 2.5D camera over a large "world" canvas.
 *
 * World content is placed in world pixels inside <Layer>. The camera says which world point sits
 * at the screen FOCUS point and how far it is zoomed. Layers with depth < 1 move less (parallax).
 * Fast moves get directional motion blur computed from the camera's screen-space velocity.
 */

export const FOCUS = { x: CX, y: 860 };

export type CamKey = {
  t: number;
  x: number;
  y: number;
  zoom?: number;
  rot?: number;
  /** easing used to arrive at this key (default: smooth in-out) */
  ease?: (p: number) => number;
};
export type CamState = { x: number; y: number; zoom: number; rot: number };

const smooth = (p: number) => (p < 0.5 ? 16 * p ** 5 : 1 - (-2 * p + 2) ** 5 / 2); // in-out quint

export const cameraAt = (keys: CamKey[], t: number): CamState => {
  const st = (k: CamKey): CamState => ({ x: k.x, y: k.y, zoom: k.zoom ?? 1, rot: k.rot ?? 0 });
  if (t <= keys[0].t) return st(keys[0]);
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t <= b.t) {
      const p = (b.ease ?? smooth)(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
      const za = a.zoom ?? 1;
      const zb = b.zoom ?? 1;
      return {
        x: lerp(a.x, b.x, p),
        y: lerp(a.y, b.y, p),
        zoom: Math.exp(lerp(Math.log(za), Math.log(zb), p)),
        rot: lerp(a.rot ?? 0, b.rot ?? 0, p),
      };
    }
  }
  return st(keys[keys.length - 1]);
};

export const easeIn = E.in;
export const easeOut = E.out;

type Ctx = { cam: CamState };
const CamCtx = createContext<Ctx>({ cam: { x: FOCUS.x, y: FOCUS.y, zoom: 1, rot: 0 } });

/** World -> screen for the current camera (depth 1 layer, no rotation). */
export const worldToScreen = (cam: CamState, x: number, y: number) => ({
  x: FOCUS.x + (x - cam.x) * cam.zoom,
  y: FOCUS.y + (y - cam.y) * cam.zoom,
});

export const Camera: React.FC<{
  t: number;
  keys: CamKey[];
  /** motion-blur strength (0 disables) */
  blur?: number;
  id?: string;
  children: React.ReactNode;
}> = ({ t, keys, blur = 1, id = "cam", children }) => {
  const cam = cameraAt(keys, t);
  const h = 0.5 / FPS; // half a frame: a 180-degree shutter
  const a = cameraAt(keys, t - h);
  const b = cameraAt(keys, t + h);
  const dx = Math.abs(b.x - a.x) * cam.zoom;
  const dy = Math.abs(b.y - a.y) * cam.zoom;
  const dz = Math.abs(Math.log(b.zoom) - Math.log(a.zoom));
  const iso = Math.min(5, dz * 220) * blur;
  const sx = Math.min(22, dx * 0.5 * blur + iso);
  const sy = Math.min(22, dy * 0.5 * blur + iso);
  const blurOn = sx > 0.4 || sy > 0.4;
  return (
    <CamCtx.Provider value={{ cam }}>
      {blurOn ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={`${id}-mb`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
          </filter>
        </svg>
      ) : null}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", filter: blurOn ? `url(#${id}-mb)` : undefined }}>{children}</div>
    </CamCtx.Provider>
  );
};

export const useCamera = () => useContext(CamCtx).cam;

/** A plane of world content. depth 1 = the main plane; < 1 = farther away (moves and scales less). */
export const Layer: React.FC<{ depth?: number; opacity?: number; children: React.ReactNode }> = ({ depth = 1, opacity = 1, children }) => {
  const cam = useCamera();
  const z = 1 + (cam.zoom - 1) * depth;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        overflow: "visible",
        opacity,
        transformOrigin: "0 0",
        transform: `translate(${FOCUS.x}px, ${FOCUS.y}px) rotate(${(cam.rot * depth).toFixed(3)}deg) scale(${z.toFixed(5)}) translate(${(-cam.x * depth).toFixed(2)}px, ${(-cam.y * depth).toFixed(2)}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Absolutely positioned box in world pixels (use inside a Layer). */
export const At: React.FC<{ x: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, ...style }}>{children}</div>
);
