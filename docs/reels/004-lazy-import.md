# 004 — One word that makes Python start 16× faster (lazy imports)

- **Folder:** `src/reels/lazy-import` · compositions `LazyImport`, `LazyImport-Cover`
- **Length:** ~48.7 s (incl. 3.4 s brand end card) · 1080×1920 · 30 fps · English
- **Status:** v1 built with a scratch voice (Kokoro `af_heart`, 1.15×). Swap in the HeyGen voice
  with the *Generate reel assets* workflow (task `voice`, slug `lazy-import`).
- **Audience:** working professionals learning Python for AI/ML, no CS background. One idea:
  normal imports load everything up front; `lazy` loads a module only when it is first used.
- **Proof:** a real benchmark, run on Python 3.15.1 (files in `docs/reels/004-lazy-import/`).

## The benchmark (what every number on screen comes from)

`report.py` is a small CLI: `argparse` plus `pandas`, `matplotlib.pyplot` and `requests` at the top.
`lazy_app.py` is the same file with `lazy` in front of those three imports. Both run
`report --help`, which needs none of them.

| `report --help` | Normal imports | `lazy` imports |
| --- | --- | --- |
| Start-up time (median of 60, alternating runs) | 788 ms | 48 ms (16.6× faster) |
| Modules loaded (`-X importtime`) | 892 | 67 |
| Peak memory (max RSS) | 125 MB | 22 MB |

The 892 modules break down as `argparse` 21, `pandas` 565, `matplotlib.pyplot` 167, `requests` 114
and 25 start-up modules. The module trees drawn on screen are the real ones parsed from
`importtime-eager-help.txt`.

Doing real work (`report sales.csv`), the lazy version still loads pandas and matplotlib when they
are used, but never loads `requests`, which the code never touches: 909 → 804 modules.

Machine: 2-vCPU cloud container (Intel Xeon 2.1 GHz), Python 3.15.1, pandas 3.1.0,
matplotlib 3.11.2, requests 2.34.2. Your numbers will differ; the gap is the point.

## Edit structure

| Time (s) | Beat | Transition in | What moves |
| --- | --- | --- | --- |
| 0–3.4 | Hook: the race | — (frame 0 = last frame) | Two terminals run `report --help`, slowed 4×: `lazy` finishes at once, normal crawls through real module names to 788 ms |
| 3.4–6.6 | Why | Pull back, glide down to the code | An execution playhead runs the import lines; `main()` waits, dimmed |
| 6.6–10.3 | The cascade | Zoom into `import pandas` | The real pandas import tree blooms: 565 modules, counter racing |
| 10.3–15.0 | The waste | Zoom out | All trees bloom; 892 modules, 788 ms, 125 MB; help prints; **0 USED** stamp |
| 15.0–18.5 | The old hack | — | Import lines slide down into `def main()`; tag: 17% of stdlib imports already hide in functions |
| 18.5–21.5 | One word | Lines slide back up | `lazy` stamps onto each import; the trees collapse into tokens |
| 21.5–28.3 | Tokens | — | Dosa-counter tokens; `pd` and `plt` resolve when used; `requests` stays NEVER LOADED |
| 28.3–36.2 | Why so late | **Whip** to a timeline | 2022 PEP 690 "all imports lazy" REJECTED; 2025 PEP 810 opt-in ACCEPTED; Python 3.15 ships Oct 2026 |
| 36.2–42.8 | Payoff + catch | **Whip** down | Three stat cards; then a traceback card: errors appear at first use |
| 42.8–45.3 | CTA | — | COMMENT LAZY; comment box types it and sends |
| 45.3–48.7 | Brand end card + loop | CTA rises away | Optimizer Step logo: circular reveal, light sweep round the ring, a spark down the logo's descent path, shine on the wordmark; a Follow button pops in, gets tapped, turns to Following; whip back to the race at frame 0 |

## Voiceover and on-screen text

| # | Starts | Voiceover | On screen |
| --- | --- | --- | --- |
| 1 | 0.05 | Same app. One word makes it start sixteen times faster. | ONE WORD. 16× FASTER START. · normal 788 ms / lazy 48 ms · tag: `report --help` · Python 3.15.1 · measured · slowed 4× |
| 2 | 3.5 | Why? Every import runs before your code even starts. | EVERY IMPORT RUNS FIRST · YOUR CODE (waiting) |
| 3 | 6.7 | And pandas isn't one file. It's five hundred and sixty-five. | `import pandas` = 565 MODULES |
| 4 | 10.4 | Just to show help, it loads eight hundred and ninety-two modules… and uses none. | 892 MODULES LOADED · 0 USED · 788 ms · 125 MB |
| 5 | 15.0 | Coders used to hide imports inside functions to dodge this. | THE OLD HACK · tag: ~17% of Python's own imports (outside tests) already hide in functions — PEP 810 |
| 6 | 18.6 | Python 3.15 makes it one word: lazy. | `lazy` |
| 7 | 21.6 | Now each import is a token, like at a dosa counter. It loads only when it's used. Never used? Never loaded. | TOKEN · LOADS ON FIRST USE · NEVER LOADED · `--help`: 67 modules · 48 ms · 22 MB |
| 8 | 28.4 | Why so late? Making all imports lazy was rejected in 2022: too risky. So now it's opt-in, line by line. | 2022 · PEP 690 · ALL IMPORTS LAZY · REJECTED · 2025 · PEP 810 · OPT-IN, PER LINE · ACCEPTED · OCT 2026 · PYTHON 3.15 |
| 9 | 36.3 | Faster startup, less memory, cleaner code. The catch: a broken import fails when it's used, not at startup. | 50–70% FASTER CLI START · 30–40% LESS MEMORY · IMPORTS STAY ON TOP · tag: real-world figures quoted in PEP 810 · THE CATCH: ERRORS AT FIRST USE |
| 10 | 42.9 | Comment LAZY for the benchmark. | COMMENT LAZY · for the benchmark script |

## Sound design

`scripts/audio/lazy_import.py` synthesises everything and cuts it to the timeline:

- **Sonification:** the normal terminal's load is a rain of ticks (one per few modules); every
  module in the real pandas, matplotlib and requests trees ticks as it appears, pitched by its
  depth; `lazy` is typed key by key; each token prints like a ticket, the dosa line rings a
  counter bell, and resolved tokens bloom with their own little cascade.
- **Score (120 BPM, A minor):** a ticking drone under the race; a groove that builds through the
  cascade and cuts dead on "0 USED"; a clunky half-time for the old hack; a build that stops for a
  breath and **drops on the word "lazy"**; half-time for the history, with a hole after REJECTED;
  a tape-stop on "THE CATCH"; and the cold open's drone at the end, so the audio loops.
- **Mix:** stems duck under the voice (melody most), SFX dip 6 dB under it, master at -14 LUFS.

## Caption

```text
One word made this Python app start 16× faster: lazy.

Normal imports load everything before your code runs — this tiny CLI loaded 892 modules just to print --help.
Python 3.15's `lazy import` loads a module only when your code first uses it.

Why it took until 2026: making every import lazy was rejected in 2022 (it could break code that relies on imports running immediately). PEP 810 made it opt-in, one line at a time.

Comment LAZY and I'll send you the benchmark script.

#Python #Python315 #LazyImports #Programming #LearnPython #OptimizerStep
```

**Pinned comment:** Benchmark: `report --help` on Python 3.15.1 with pandas, matplotlib and
requests imported at the top: 788 ms / 892 modules / 125 MB normally; 48 ms / 67 modules / 22 MB
with `lazy`. Median of 60 alternating runs on a 2-vCPU cloud machine. Sources: PEP 810 (accepted
3 Nov 2025), PEP 690 (rejected Dec 2022).

## Fact sheet

| Claim | Status | Source |
| --- | --- | --- |
| Normal imports load and run a module at the import statement; lazy imports defer it to the first use of the name | True | [PEP 810](https://peps.python.org/pep-0810/), Abstract |
| Syntax: `lazy import json`, `lazy from json import dumps`; only at module level (not in functions, classes, `try` blocks, or `import *`) | True | PEP 810, Syntax restrictions |
| A lazy import is a placeholder (proxy) until first use, then the name is rebound to the real object | True ("token" is our analogy) | PEP 810, Rationale |
| `--help` on CLIs "can load dozens of unnecessary modules and take several seconds" | True (quoted motivation) | PEP 810, Motivation |
| ~17% of standard-library imports outside tests (~3,500 imports, 730 files) already sit inside functions to defer them | True | PEP 810, Motivation |
| 50–70% faster CLI start-up "in practice"; 30–40% memory savings "observed in real workloads" | True as quoted by the PEP authors | PEP 810, Motivation |
| Errors and side effects of a lazy import happen at first use, not at the import line | True | PEP 810, Rationale and Reification |
| PEP 690 (make imports lazy globally) was rejected in December 2022; the Steering Council feared "a split in the community over how imports work" and errors surfacing at first use | True | [PEP 690](https://peps.python.org/pep-0690/) (Status: Rejected); [LWN, Dec 2022](https://lwn.net/Articles/917280/) |
| Meta's Cinder showed up to 70% faster start-up and up to 40% less memory on real CLIs | True (PEP 690 text) | PEP 690, Motivation |
| PEP 810 was accepted unanimously by the Steering Council on 3 Nov 2025 | True | [Simon Willison quoting Barry Warsaw](https://simonwillison.net/2025/Nov/3/barry-warsaw/); PEP 810 header |
| Python 3.15.0 was released on 9 Oct 2026 with lazy imports | True | [python.org downloads](https://www.python.org/downloads/); [Real Python, Oct 2026](https://realpython.com/python-news-october-2026/) |
| 16× faster, 892 vs 67 modules, 125 vs 22 MB | Measured by us; labelled "measured" on screen | `docs/reels/004-lazy-import/` |

Wording rules: say "start-up" (lazy imports do not make code run faster once loaded); say
"measured on our machine" for our numbers; the 50–70% / 30–40% figures are "quoted in PEP 810".
