/**
 * Word-synced cues. Each reel keeps a `words.json` transcript of its voiceover:
 *   [{ "text": "bank", "start": 1.92, "end": 2.31 }, ...]   (seconds)
 * `cue("bank", 2, 7.4)` returns the start of the 2nd spoken "bank", or 7.4 if there is no
 * transcript yet. Write timelines with cue() and the reel retimes itself to the real voiceover.
 */
export type Word = { text: string; start: number; end: number };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ']/g, "");

export const makeCue = (words: Word[]) => {
  const list = words.map((w) => ({ ...w, n: norm(w.text) }));
  return (phrase: string, nth = 1, fallback: number, edge: "start" | "end" = "start", offset = 0): number => {
    const parts = phrase.split(/\s+/).map(norm).filter(Boolean);
    if (!list.length || !parts.length) return fallback;
    let seen = 0;
    for (let i = 0; i + parts.length <= list.length; i++) {
      if (parts.every((p, k) => list[i + k].n === p)) {
        seen++;
        if (seen === nth) {
          const w = edge === "start" ? list[i].start : list[i + parts.length - 1].end;
          return w + offset;
        }
      }
    }
    return fallback;
  };
};
