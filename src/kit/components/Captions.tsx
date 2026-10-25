import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { CAPTION_BAND, COLORS, FONTS, SAFE } from "../theme";

type Cap = { text: string; startMs: number; endMs: number };

/** Burned-in captions from a JSON file in public/: [{ text, startMs, endMs }]. */
export const Captions: React.FC<{ t: number; src: string }> = ({ t, src }) => {
  const [caps, setCaps] = useState<Cap[] | null>(null);
  const [handle] = useState(() => delayRender(`Loading ${src}`));
  useEffect(() => {
    fetch(staticFile(src))
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Cap[]) => setCaps(Array.isArray(d) ? d : []))
      .catch(() => setCaps([]))
      .finally(() => continueRender(handle));
  }, [handle, src]);
  if (!caps) return null;
  const ms = t * 1000;
  const cur = caps.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!cur) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: CAPTION_BAND.top,
        height: CAPTION_BAND.bottom - CAPTION_BAND.top,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          padding: "10px 24px",
          borderRadius: 18,
          background: "rgba(0,0,0,0.7)",
          fontFamily: FONTS.head,
          fontWeight: 700,
          fontSize: 50,
          lineHeight: 1.15,
          color: COLORS.text,
          textAlign: "center",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};

/** Dev overlay: safe zone (green) and caption band (blue). */
export const SafeZoneOverlay: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top,
        width: SAFE.right - SAFE.left,
        height: SAFE.bottom - SAFE.top,
        border: "3px dashed rgba(0,255,140,0.8)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: CAPTION_BAND.top,
        width: SAFE.right - SAFE.left,
        height: CAPTION_BAND.bottom - CAPTION_BAND.top,
        background: "rgba(0,160,255,0.18)",
        pointerEvents: "none",
      }}
    />
  </>
);
