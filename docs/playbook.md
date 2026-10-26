# Playbook: AI/ML reels that travel

## What Instagram rewards (as of late 2026)

- **Watch time**: how long people watch, whether they finish, whether they rewatch.
- **Shares and sends**: reported to carry more weight in 2026; sends are how reels reach non-followers.
- **Likes** and quick early interaction; follows after watching.
- **Original content, no watermark**, ideally under ~90 s (the hard cap is 3 minutes).
- **Trial Reels**: shown only to non-followers; check results after 24 h, then share or archive.
  Use them to test every new hook while the account is small.
- Post again within a day or two of a reel that takes off.

Sources: [Hootsuite, Instagram algorithm 2026](https://blog.hootsuite.com/instagram-algorithm/),
[TechCrunch on Trial Reels](https://techcrunch.com/2024/12/10/instagram-rolls-out-trial-reels-that-arent-shown-to-a-creators-followers).

## Six rules for every reel

1. The first 1.5 s work on mute: something moving plus five words or fewer.
2. One idea, 30–45 s.
3. A screenshot moment: absurd but true (the jackrabbits). That is what gets sent.
4. A re-hook every 7–10 s: new visual, a question, a counter ticking.
5. Loop ending: last frame = first frame.
6. English voice and English on-screen text, always.

## Formats that work in this niche

| Format | Example |
| --- | --- |
| Weird true research result | Model collapse → jackrabbits |
| Watch the math move | Gradient descent as a ball rolling downhill; attention as a heatmap |
| Indian-life analogy | Overfitting = the student who memorised last year's paper |
| Myth vs fact | "ChatGPT searches the internet for every answer" — no |
| How X works in 30 s | How ChatGPT picks the next word |
| News decoded fast | A new model or paper explained within 48 h |

## Concept bank

| Slug | Hook | Screenshot moment |
| --- | --- | --- |
| `overfitting-exam` | The topper who failed the new paper | Accuracy 100% on practice, 40% on the real exam |
| ~~`attention-bank`~~ | Built as reel 002 | — |
| `gradient-chai` | Finding the chai stall in fog | The ball overshoots when the step is too big |
| `temperature-dice` | Why ChatGPT answers differently every time | Same prompt, temperature 0 vs 1.5 side by side |
| `tokens-strawberry` | Why AI used to miscount the r's in "strawberry" | "straw" + "berry": the model never sees letters |

## Workflow per reel

1. Pick a concept; verify the science and save sources in `docs/reels/<nnn>-<slug>.md`.
2. Script in English with the beat structure in `CLAUDE.md` (VO + on-screen text + visual + SFX per beat).
3. Voiceover (English): Venkatesh records, or ElevenLabs in his cloned voice.
4. Build in code; check stills; render.
5. 2–3 B-roll shots from Kling/Higgsfield if they add mood.
6. Post as a Trial Reel with the cover, caption and pinned sources comment; add trending audio
   in-app under the voice if wanted.
7. After 24–48 h, log views, average watch time, skip rate and shares in the reel's brief,
   and adjust the next hook.
