import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { prog } from "../anim";
import { FPS } from "../theme";

export type SfxCue = { file: string; t: number; volume: number; end?: number };

/**
 * Voiceover, music bed and SFX for a reel. All paths are relative to `dir` inside public/.
 * Music ducks under VO and drops to silence inside each `silences` window.
 */
export const ReelAudio: React.FC<{
  dir: string;
  duration: number;
  vo?: { enabled: boolean; volume?: number; file?: string };
  music?: { enabled: boolean; volume: number; file?: string; silences?: { start: number; end: number }[] };
  sfx?: { enabled: boolean; cues: SfxCue[]; folder?: string };
}> = ({ dir, duration, vo, music, sfx }) => (
  <>
    {vo?.enabled ? <Audio src={staticFile(`${dir}/${vo.file ?? "vo.mp3"}`)} volume={vo.volume ?? 1} /> : null}
    {music?.enabled ? (
      <Audio
        src={staticFile(`${dir}/${music.file ?? "music.mp3"}`)}
        volume={(f) => {
          const tt = f / FPS;
          let gate = 1;
          for (const s of music.silences ?? []) {
            const g = 1 - Math.min(prog(tt, s.start - 0.12, s.start), 1 - prog(tt, s.end, s.end + 0.4));
            gate = Math.min(gate, g);
          }
          const fadeIn = prog(tt, 0, 0.3);
          const fadeOut = 1 - prog(tt, duration - 0.6, duration);
          return music.volume * gate * fadeIn * fadeOut;
        }}
      />
    ) : null}
    {sfx?.enabled
      ? sfx.cues.map((c, i) => (
          <Sequence
            key={i}
            from={Math.round(c.t * FPS)}
            durationInFrames={c.end !== undefined ? Math.max(1, Math.round((c.end - c.t) * FPS)) : undefined}
            layout="none"
          >
            <Audio src={staticFile(`${dir}/${sfx.folder ?? "sfx"}/${c.file}.mp3`)} volume={c.volume} />
          </Sequence>
        ))
      : null}
  </>
);
