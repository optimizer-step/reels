"""Word-level forced alignment for voiceover lines (offline, PocketSphinx).

    from align import align_words
    words = align_words("line-01.wav", "One wrong number… and the whole AI training crashes.")
    # -> [{"text": "One", "start": 0.0, "end": 0.22}, ...]   (seconds from the start of the file)

Returns [] when alignment fails; callers then fall back to a syllable estimate. Needs
`pip install pocketsphinx` (it ships its own US English acoustic model and dictionary).
"""
from __future__ import annotations

import re
import subprocess

# words the CMU dictionary lacks or says wrong, as ARPAbet phones
EXTRA = {
    "ai": "EY AY",
    "gpt": "JH IY P IY T IY",
    "ml": "EH M EH L",
    "llm": "EH L EH L EH M",
    "llms": "EH L EH L EH M Z",
}
DIGITS = "zero one two three four five six seven eight nine".split()


def _tokens(word: str) -> list[str]:
    """Display word -> the dictionary tokens it is spoken as."""
    out = []
    for part in re.split(r"[-/]", word):
        p = re.sub(r"[^a-z0-9']", "", part.lower()).strip("'")
        if not p:
            continue
        if p.isdigit():
            out += [DIGITS[int(c)] for c in p]
        else:
            out.append(p)
    return out


def align_words(wav: str, text: str) -> list[dict]:
    try:
        from pocketsphinx import Decoder
    except ImportError:
        return []
    display = [w for w in text.split() if re.search(r"[A-Za-z0-9]", w)]
    d = Decoder(samprate=16000, loglevel="FATAL")
    spoken: list[list[str]] = []
    for w in display:
        toks = []
        for tok in _tokens(w):
            key = tok
            if tok in EXTRA:
                key = f"{tok}_x"
                if d.lookup_word(key) is None:
                    d.add_word(key, EXTRA[tok], True)
            elif d.lookup_word(tok) is None:
                return []  # unknown word: let the caller estimate
            toks.append(key)
        spoken.append(toks)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", wav, "-ar", "16000", "-ac", "1", "-f", "s16le", "-"], check=True, capture_output=True).stdout
    d.set_align_text(" ".join(t for toks in spoken for t in toks))
    d.start_utt()
    d.process_raw(raw, full_utt=True)
    d.end_utt()
    segs = [(re.sub(r"\(\d+\)$", "", s.word), s.start_frame / 100, s.end_frame / 100) for s in d.seg()]
    segs = [s for s in segs if not s[0].startswith("<") and not s[0].startswith("[")]
    if len(segs) != sum(len(t) for t in spoken):
        return []
    out, k = [], 0
    for w, toks in zip(display, spoken):
        if not toks:
            continue
        first, last = segs[k], segs[k + len(toks) - 1]
        out.append({"text": w, "start": round(first[1], 3), "end": round(last[2], 3)})
        k += len(toks)
    return out
