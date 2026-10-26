import React from "react";
import { COLORS, FONTS } from "../theme";

/**
 * Rolling-digit counter. Digits roll continuously like a mechanical odometer; higher digits
 * roll only while the digit below is carrying. Indian grouping (12,34,567) by default.
 */
export const Odometer: React.FC<{
  value: number;
  decimals?: number;
  size?: number;
  color?: string;
  grouping?: "in" | "intl" | "none";
  minDigits?: number;
  weight?: number;
}> = ({ value, decimals = 0, size = 48, color = COLORS.text, grouping = "in", minDigits = 1, weight = 700 }) => {
  const scale = 10 ** decimals;
  const v = Math.max(0, value * scale);
  const intDigits = Math.max(minDigits, String(Math.floor(value)).length);
  const total = intDigits + decimals;
  const h = size * 1.15;
  const cols: React.ReactNode[] = [];
  for (let i = total - 1; i >= 0; i--) {
    const place = 10 ** i;
    let pos: number;
    if (i === 0) pos = v;
    else {
      const below = v % place;
      const carry = Math.max(0, below - (place - 1));
      pos = Math.floor(v / place) + carry;
    }
    const d = Math.floor(pos) % 10;
    const frac = pos - Math.floor(pos);
    cols.push(
      <span key={i} style={{ display: "inline-block", position: "relative", width: size * 0.6, height: h, overflow: "hidden" }}>
        <span style={{ position: "absolute", left: 0, top: -frac * h, lineHeight: `${h}px` }}>{d}</span>
        <span style={{ position: "absolute", left: 0, top: (1 - frac) * h, lineHeight: `${h}px` }}>{(d + 1) % 10}</span>
      </span>,
    );
    const intIndex = i - decimals; // digits left of the decimal point remaining after this one
    if (i === decimals && decimals > 0) {
      cols.push(
        <span key="dot" style={{ display: "inline-block", width: size * 0.35, textAlign: "center", lineHeight: `${h}px` }}>
          .
        </span>,
      );
    } else if (intIndex > 0 && grouping !== "none") {
      const comma = grouping === "intl" ? intIndex % 3 === 0 : intIndex === 3 || (intIndex > 3 && (intIndex - 3) % 2 === 0);
      const show = Math.floor(v / (10 ** (decimals + intIndex))) > 0;
      if (comma && show) {
        cols.push(
          <span key={`c${i}`} style={{ display: "inline-block", width: size * 0.32, textAlign: "center", lineHeight: `${h}px` }}>
            ,
          </span>,
        );
      }
    }
  }
  return (
    <span style={{ display: "inline-flex", fontFamily: FONTS.mono, fontWeight: weight, fontSize: size, color, height: h, alignItems: "center" }}>{cols}</span>
  );
};
