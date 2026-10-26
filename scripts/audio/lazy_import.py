"""Sound for reel 004 (lazy-import): every SFX and the score, synthesised and cut to the timeline.

    python3 scripts/audio/lazy_import.py           # sfx/*.mp3, music.mp3 and the mastered mix.mp3

Re-run whenever the voiceover or the timeline changes (the Generate assets workflow does).
Design notes:
- Sonification: the normal terminal's load is a rain of ticks (one per few modules); every module
  in the real pandas / matplotlib / requests trees is a tick as it appears, pitched by its depth;
  "lazy" is typed key by key; resolved tokens bloom with their own cascade.
- Score: 120 BPM, A minor, blocks that start on cuts. The music drops out under the "0 USED"
  stamp, builds through the old hack, and DROPS on the word "lazy". History is half-time;
  "THE CATCH" tape-stops it; the end returns to the cold open's drone so the audio loops.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from sfxlib import (  # noqa: E402
    ROOT,
    SR,
    Groove,
    adsr,
    bp,
    bus,
    fade,
    fm_bell,
    fm_pluck,
    glitch,
    haas,
    hp,
    impact,
    kick2,
    load_audio,
    lp,
    m2f,
    master_reel,
    mix_stems,
    noise,
    norm,
    osc,
    place,
    pop,
    reel_dir,
    reverb,
    reverse_swell,
    riser,
    save,
    saw,
    st,
    sub_note,
    supersaw,
    t_,
    tape_stop,
    whoosh,
    reel_timeline,
    limit,
)

SLUG = "lazy-import"
OUT = reel_dir(SLUG)
SFX = OUT / "sfx"
TL = reel_timeline(SLUG)
B, C = TL["BEATS"], TL["CUES"]
DUR = TL["DURATION_S"]
TREES = json.loads((ROOT / "src" / "reels" / SLUG / "modules.json").read_text())["trees"]


def one(x, db=-1.0):
    return norm(st(x) if x.ndim == 1 else x, db)


def blip(f, dur=0.035, bright=0.5):
    t = t_(dur)
    x = osc(np.full(len(t), float(f))) * np.exp(-t * 140)
    x += bp(noise(len(t)), 3000, 9000) * np.exp(-t * 320) * bright
    return x


# ---------------------------------------------------------------------------------------------
# SFX
# ---------------------------------------------------------------------------------------------

def key(f=190.0):
    t = t_(0.09)
    x = osc(np.full(len(t), f)) * np.exp(-t * 70) * 0.6 + bp(noise(len(t)), 2200, 7000) * np.exp(-t * 220)
    return one(reverb(x, 0.4, 0.1), -3)


def enter():
    t = t_(0.25)
    x = osc(np.full(len(t), 150.0)) * np.exp(-t * 40) * 0.8 + bp(noise(len(t)), 1500, 6000) * np.exp(-t * 90)
    return one(reverb(x, 0.5, 0.12), -2)


def rain():
    """Normal imports: one tick per ~6 modules over the slowed race, rising as the count grows."""
    dur = TL["RACE"]["normalEnd"] - TL["RACE"]["start"]
    total = TL["RUN"]["normalModules"]
    out = np.zeros((int((dur + 0.3) * SR), 2))
    r = np.random.default_rng(3)
    for m in range(0, total, 6):
        tt = dur * m / total + r.uniform(-0.004, 0.004)
        f = 700 + 1600 * (m / total) + r.uniform(-80, 80)
        place(out, blip(f, 0.03, 0.6) * r.uniform(0.5, 1.0), max(0, tt), pan=r.uniform(-0.5, 0.5))
    return one(out, -3)


def ding():
    x = fm_bell(m2f(88), 1.4, 1.6, 2.0, 3.2) * 0.7 + fm_bell(m2f(83), 1.4, 1.2, 2.0, 3.0) * 0.4
    return one(reverb(haas(x, 6), 1.4, 0.3), -2)


def thunk():
    t = t_(0.8)
    x = kick2(0.8, 120, 38, click=0.4, drive=2.4, decay=5) + bp(noise(len(t)), 200, 900) * np.exp(-t * 25) * 0.4
    return one(reverb(x, 0.8, 0.15), -1)


def hit():
    k = kick2(0.5, 190, 50, click=0.5, drive=2.5, decay=9)
    t = t_(0.5)
    snap = bp(noise(len(t)), 1800, 7000) * np.exp(-t * 45) * 0.5
    return one(reverb(k + snap, 0.8, 0.15), -1)


def whip(sideways=False):
    t = t_(0.55)
    p = t / 0.55
    env = np.exp(-((p - 0.45) ** 2) / 0.02)
    x = bp(noise(len(t)), 600, 9000) * env + osc(400 + 3000 * env) * env * 0.25
    pan = (p * 2 - 1) * (1.0 if sideways else 0.5)
    return one(st(x * (1 - 0.5 * pan), x * (1 + 0.5 * pan)), -2)


def seg(large):
    """A start-up bar segment landing: key click + a body thump sized by its import time."""
    t = t_(0.6)
    f0 = 120 if large else 220
    body = np.sin(2 * np.pi * np.cumsum(f0 * 0.6 + f0 * np.exp(-t * 30)) / SR) * np.exp(-t * (7 if large else 14))
    click = bp(noise(len(t)), 2500, 8000) * np.exp(-t * 250) * 0.6
    swell = bp(noise(len(t)), 300, 2000) * np.exp(-t * 6) * (0.25 if large else 0.1)
    return one(reverb(body + click + swell, 0.7, 0.15), -1.5)


def clock():
    out = np.zeros(int(1.2 * SR))
    for k, f in enumerate([2200, 1700, 2200, 1700]):
        tt = t_(0.05)
        x = bp(noise(len(tt)), f * 0.8, f * 1.3) * np.exp(-tt * 200) + osc(np.full(len(tt), float(f))) * np.exp(-tt * 150) * 0.3
        s = int(k * 0.28 * SR)
        out[s : s + len(x)] += x
    return one(reverb(out, 0.5, 0.15), -5)


def tree_ticks(key_name, grow_at, n=None, gain=1.0):
    """One tick per module as a tree grows. grow_at(i) -> seconds after the file starts."""
    d = TREES[key_name]["depth"]
    n = n or len(d)
    times = [grow_at(i / n) for i in range(1, n)]
    out = np.zeros((int((max(times) + 0.4) * SR), 2))
    r = np.random.default_rng(len(key_name))
    for i, tt in zip(range(1, n), times):
        f = 500 * 2 ** (min(d[i], 14) / 7) * r.uniform(0.96, 1.04)
        place(out, blip(f, 0.028, 0.4) * gain * r.uniform(0.4, 1.0), tt, pan=r.uniform(-0.7, 0.7))
    return out


def inv_pow(g, k):
    """Inverse of grow = 1 - (1 - x)^k."""
    return 1 - (1 - g) ** (1 / k)


def cascade():
    a, b = C["cascade"]["bloom"]
    x = tree_ticks("pandas", lambda g: (b - a) * inv_pow(g, 1.6))
    return one(reverb(x, 0.9, 0.2), -2)


def bloom():
    a, b = C["total"]["bloom"]
    t0 = a
    out = np.zeros((int((b - a + 1.5) * SR), 2))
    for key_name, d in (("matplotlib.pyplot", 0.0), ("requests", 0.25), ("argparse", 0.5)):
        s, e = a + 0.3 + d, b - 0.2 + d * 0.3
        x = tree_ticks(key_name, lambda g, s=s, e=e: (s - t0) + (e - s) * inv_pow(g, 1.4), gain=0.8)
        place(out, x, 0)
    # the counter landing on 892
    place(out, fm_bell(m2f(84), 1.0, 1.4, 2.0, 3.5) * 0.5, b - t0 + 0.05)
    return one(reverb(out, 0.9, 0.2), -2)


def stamp(heavy=True):
    t = t_(1.2)
    x = impact(1.2)[: len(t)] * (1.0 if heavy else 0.5)
    g = glitch(0.25, seed=6)
    x[: len(g)] += g * (0.4 if heavy else 0.15)
    thud = kick2(0.4, 160, 60, click=0.9, drive=3, decay=14)
    x[: len(thud)] += st(thud) * 0.6
    return one(reverb(x, 1.0, 0.18), -0.8)


def slide():
    out = np.zeros((int(1.6 * SR), 2))
    for k in range(3):
        t = t_(0.45)
        p = t / 0.45
        x = bp(noise(len(t)), 200, 1400) * np.sin(np.pi * p) ** 2 + osc(300 - 160 * p) * np.sin(np.pi * p) * 0.3
        place(out, x, k * 0.09 + 0.05, pan=-0.3 + 0.3 * k)
    return one(reverb(out, 0.6, 0.15), -3)


def nope():
    out = np.zeros(int(0.9 * SR))
    for k in range(3):
        t = t_(0.11)
        x = np.sign(osc(np.full(len(t), 160.0))) * 0.4 * np.exp(-t * 20)
        s = int(k * 0.08 * SR)
        out[s : s + len(x)] += lp(x, 2500)
    return one(out, -5)


def type_lazy():
    """`lazy ` typed on three lines (5 keys each, 0.22 s per line, lines 0.13 s apart)."""
    out = np.zeros((int(1.0 * SR), 2))
    for line in range(3):
        for c in range(5):
            tt = line * 0.13 + c * 0.044
            place(out, key(170 + 25 * c) * 0.7, tt, pan=-0.3 + 0.3 * line)
    return one(out, -3)


def lazyhit():
    """The drop on "lazy": a wide shimmering hit with a bright chord bloom."""
    t = t_(2.4)
    hitx = impact(2.4)[: len(t)] * 0.7
    chord = sum(fm_bell(m2f(m), 2.4, 1.2, 2.0, 1.6) for m in (69, 73, 76, 81)) * 0.25
    shimmer = hp(noise(len(t)), 6000) * np.exp(-t * 3) * 0.15
    x = hitx + st(chord + shimmer)
    return one(reverb(x, 2.0, 0.3), -0.8)


def printer():
    """Ticket printer: a short thermal zip."""
    t = t_(0.32)
    zip_ = bp(noise(len(t)), 1800, 6000) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 70 * t))) * np.sin(np.pi * t / 0.32)
    tear = bp(noise(len(t)), 3000, 9000) * np.exp(-((t - 0.27) ** 2) / 0.0004) * 0.6
    return one(reverb(zip_ * 0.6 + tear, 0.4, 0.1), -4)


def bell():
    """Counter bell: a bright 'ting' (the dosa counter)."""
    t = t_(2.0)
    f = 2350.0
    x = sum(np.sin(2 * np.pi * f * r * t + i) * a * np.exp(-t * d) for i, (r, a, d) in enumerate([(1, 1, 2.2), (2.76, 0.5, 3.5), (5.4, 0.25, 5), (8.9, 0.12, 8)]))
    x += bp(noise(len(t)), 4000, 10000) * np.exp(-t * 200) * 0.3
    return one(reverb(haas(x, 5), 1.2, 0.25), -3)


def flip():
    """Token flips and the module loads: whoosh-pop, then a quick cascade of its own."""
    t = t_(0.25)
    sw = bp(noise(len(t)), 1500, 8000) * np.sin(np.pi * t / 0.25) ** 2 * 0.5
    out = np.zeros((int(1.4 * SR), 2))
    place(out, sw, 0)
    place(out, pop(990) * 0.8, 0.17)
    x = tree_ticks("pandas", lambda g: 0.18 + 0.82 * inv_pow(g, 3.0), n=180, gain=0.6)
    place(out, x, 0)
    return one(reverb(out, 0.8, 0.2), -2)


def reject():
    x = stamp(True)
    t = t_(0.7)
    buzz = lp(saw(110, t) + saw(116.5, t), 1200) * np.exp(-t * 4) * 0.35
    place(x, buzz, 0.05)
    return one(x, -0.8)


def accept():
    x = stamp(False)
    chord = sum(fm_bell(m2f(m), 1.8, 1.0, 2.0, 2.0) for m in (72, 76, 79, 84)) * 0.3
    place(x, chord, 0.04)
    return one(reverb(x, 1.2, 0.2), -1)


def chime():
    x = fm_bell(m2f(88), 1.8, 2.4, 3.5, 2.6) * 0.6 + fm_bell(m2f(81), 1.8, 1.8, 2.0, 2.2) * 0.5
    return one(reverb(haas(x, 6), 1.8, 0.35), -2)


def card():
    t = t_(0.4)
    sw = bp(noise(len(t)), 800, 7000) * np.exp(-((t - 0.08) ** 2) / 0.002) * 0.6
    out = np.zeros((len(t), 2))
    place(out, sw, 0, pan=0.4)
    place(out, pop(700) * 0.7, 0.1)
    return one(reverb(out, 0.6, 0.15), -3)


def uhoh():
    """Pitch falling 'uh-oh' (tape slowing) with a low hit."""
    t = t_(0.9)
    f = 520 * 2 ** (-1.6 * (t / 0.9) ** 0.7)
    x = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * saw(f[0] * 0.5, t)) * np.exp(-t * 2.5) * 0.4
    x = lp(x, 3000)
    k = kick2(0.6, 140, 45, click=0.3, drive=2, decay=7)
    out = st(x)
    place(out, k * 0.7, 0.05)
    return one(reverb(out, 0.9, 0.2), -1)


def error():
    t = t_(0.5)
    x = lp(np.sign(osc(np.full(len(t), 220.0))) + np.sign(osc(np.full(len(t), 233.0))), 3000) * 0.3 * np.exp(-t * 6)
    g = glitch(0.22, seed=12)
    out = st(x)
    out[: len(g)] += g * 0.5
    return one(out, -2)


def send():
    t = t_(0.35)
    f = 600 * 2 ** (1.6 * np.minimum(1, t / 0.12))
    x = osc(f) * np.exp(-t * 12) * 0.6 + hp(noise(len(t)), 3000) * np.exp(-t * 20) * 0.3
    return one(reverb(x, 0.7, 0.2), -4)


def logo():
    """Brand sting: a reversed swell into a warm hit and a bright, wide chord bloom."""
    swell = reverse_swell(0.6, 1.3) * 0.5
    t = t_(2.6)
    hitx = kick2(0.8, 150, 45, click=0.4, drive=2.2, decay=5) * 0.7
    chord = sum(fm_bell(m2f(m), 2.6, 1.0, 2.0, 1.3) for m in (65, 69, 72, 76, 79)) * 0.22
    air = hp(noise(len(t)), 5000) * np.exp(-t * 2.5) * 0.08
    out = np.zeros((int(3.3 * SR), 2))
    place(out, swell, 0)
    place(out, st(hitx), 0.6)
    place(out, haas(chord + air, 9), 0.6)
    return one(reverb(out, 2.2, 0.32), -1)


def tap():
    t = t_(0.12)
    x = osc(np.full(len(t), 1300.0)) * np.exp(-t * 90) * 0.5 + bp(noise(len(t)), 2500, 9000) * np.exp(-t * 260)
    return one(reverb(x, 0.4, 0.12), -3)


def follow():
    """'Following': a pop and a rising two-note success chime."""
    out = np.zeros((int(1.6 * SR), 2))
    place(out, pop(880) * 0.8, 0)
    place(out, fm_bell(m2f(81), 1.2, 1.2, 2.0, 3.0) * 0.5, 0.04)
    place(out, fm_bell(m2f(88), 1.3, 1.2, 2.0, 2.8) * 0.55, 0.13)
    return one(reverb(haas(out[:, 0], 6), 1.2, 0.28), -2)


def write_sfx():
    SFX.mkdir(parents=True, exist_ok=True)
    files = {
        "enter": enter(), "rain": rain(), "ding": ding(), "thunk": thunk(), "hit": hit(),
        "whip": whip(), "whipx": whip(True), "seg_s": seg(False), "seg_l": seg(True), "clock": clock(),
        "lift": whoosh(0.7), "cascade": cascade(), "whoosh": whoosh(0.8), "bloom": bloom(), "stamp": stamp(),
        "slide": slide(), "nope": nope(), "rise": riser(0.9), "type": type_lazy(), "lazyhit": lazyhit(),
        "print": printer(), "bell": bell(), "flip": flip(), "stamp2": stamp(False),
        "pop": pop(880), "reject": reject(), "accept": accept(), "chime": chime(),
        "card": card(), "uhoh": uhoh(), "error": error(), "key": key(), "send": send(),
        "logo": logo(), "tap": tap(), "follow": follow(),
    }
    for name, x in files.items():
        save(x, SFX / f"{name}.mp3")
    used = {c["file"] for c in TL["SFX_CUES"]}
    for p in SFX.glob("*.mp3"):
        if p.stem not in used:
            p.unlink()
    missing = used - set(files)
    assert not missing, f"timeline cues sounds that were not generated: {missing}"


# ---------------------------------------------------------------------------------------------
# Score
# ---------------------------------------------------------------------------------------------

Am9 = (45, [57, 60, 64, 67, 71])
Fmaj7 = (41, [53, 57, 60, 64])
Cadd9 = (48, [55, 60, 62, 64])
G6 = (43, [55, 59, 62, 64])
E7 = (40, [56, 59, 62, 64])
Dm9 = (38, [53, 57, 60, 64])
MAIN = [Am9, Fmaj7, Cadd9, G6]
DARK = [Am9, Am9, Fmaj7, E7]
BRIGHT = [Fmaj7, G6, Am9, Cadd9]


def drone(dur, fade_in=0.02, fade_out=0.6):
    t = t_(dur)
    x = np.tanh(2 * osc(np.full(len(t), 55.0))) * 0.5 + supersaw([m2f(45), m2f(52)], dur, cutoff=500)[:, 0] * 1.2
    return x * np.minimum(1, t / fade_in) * np.clip((dur - t) / fade_out, 0, 1)


def score():
    g = Groove(DUR, bpm=120)
    R = TL["RACE"]

    # cold open: drone + a rising 16th tick that tightens as the normal run drags on
    place(g.fx, drone(R["normalEnd"] + 0.3) * 0.5, 0)
    s16 = g.s16
    k = 0
    while k * s16 < R["normalEnd"]:
        p = k * s16 / R["normalEnd"]
        place(g.drums, g.HT, k * s16, 0.18 + 0.3 * p, pan=0.2)
        k += 1
    place(g.fx, reverse_swell(1.1, 1.2) * 0.4, R["normalEnd"] - 1.1)

    # block A: why -> cascade -> total, cut dead at the 0 USED stamp
    stampT = C["total"]["stamp"]

    def partA(t):
        if t < B["cascade"]["start"]:
            return {"pad": 1, "cut": 900, "kick": "half", "hats": 8}
        if t < B["total"]["start"]:
            return {"pad": 1, "cut": 1400, "kick": "main", "clap": "main", "hats": 8, "bass": 1, "arp": 16}
        return {"pad": 1, "cut": 2200, "kick": "four", "clap": "main", "hats": 16, "open": 1, "bass": 1, "arp": 16}

    g.block(B["why"]["start"] + 0.05, stampT - 0.25, MAIN, partA)
    place(g.fx, reverse_swell(1.0, 1.4) * 0.5, stampT - 1.0)

    # block B: the old hack (clunky half-time), then a build that stops just before "lazy"
    lazyT = C["lazy"]["stamp"]

    def partB(t):
        if t < B["lazy"]["start"]:
            return {"pad": 1, "cut": 900, "kick": "half", "clap": "half", "hats": 8, "bass": 1, "bass_pat": [0, 10]}
        return {"pad": 1, "cut": 1200 + 1400 * (t - B["lazy"]["start"]) / max(0.1, lazyT - B["lazy"]["start"]), "kick": "four", "hats": 16, "bass": 1, "bass_pat": list(range(0, 16, 2))}

    g.block(B["hack"]["start"] + 0.1, lazyT - 0.3, DARK, partB)
    place(g.fx, reverse_swell(1.2, 1.5) * 0.6, lazyT - 1.2)

    # block C: THE DROP on "lazy", then the token groove under the voice
    def partC(t):
        if t < lazyT + 2 * g.bar - 0.01:
            return {"pad": 1, "cut": 2800, "kick": "drop", "clap": "drop", "hats": 16, "open": 1, "bass": 1, "arp": 16}
        return {"pad": 1, "cut": 2200, "kick": "main", "clap": "main", "hats": 8, "bass": 1, "arp": 8}

    g.block(lazyT, B["token"]["end"], BRIGHT, partC)

    # block D: history, half-time and serious; a hole after REJECTED; brighter after ACCEPTED
    rej, acc = C["history"]["reject"], C["history"]["accept"]

    def partD(t):
        if t < acc:
            return {"pad": 1, "cut": 1100, "kick": "half", "clap": "half", "hats": 8, "bass": 1, "bass_pat": [0, 8]}
        return {"pad": 1, "cut": 2000, "kick": "half", "clap": "half", "hats": 16, "open": 1, "bass": 1, "bass_pat": [0, 6, 8, 14], "arp": 8}

    g.block(B["history"]["start"] + 0.05, B["payoff"]["start"], DARK[:3] + [Cadd9], partD)

    # block E: payoff, energetic until THE CATCH (tape stop), then dark and sparse
    catchT = C["payoff"]["catch"]

    def partE(t):
        if t < catchT:
            return {"pad": 1, "cut": 2400, "kick": "main", "clap": "main", "hats": 16, "open": 1, "bass": 1, "arp": 16}
        return {"pad": 1, "cut": 800, "kick": "half"}

    g.block(B["payoff"]["start"], B["cta"]["start"], BRIGHT, partE)

    # block F: CTA groove, a held chord under the brand end card, then the cold open's drone (loop)
    whip2 = C["cta"]["whip"]
    endT = B["end"]["start"]
    g.block(B["cta"]["start"], endT - 0.05, [Fmaj7, G6], lambda t: {"pad": 1, "cut": 2400, "kick": "main", "clap": "main", "hats": 16, "open": 1, "bass": 1, "arp": 8})
    hold = whip2 - endT + 0.3
    pad_end = supersaw([m2f(m) for m in (53, 57, 60, 64, 67)], hold, cutoff=2600, seed=7) * adsr(int(hold * SR), 0.05, 0.4, 0.8, 0.5)[:, None]
    place(g.pad, pad_end * 1.1, endT)
    place(g.bass, sub_note(m2f(41), min(1.6, hold), drive=3.0) * 0.4, endT)
    place(g.fx, drone(DUR - whip2 + 0.05, fade_in=0.25, fade_out=0.01) * 0.5, whip2)

    stems = g.stems()
    vo = load_audio(OUT / "vo.mp3") if TL["USE_VO"] and (OUT / "vo.mp3").exists() else None
    mix = mix_stems(stems, vo)
    # silences and tape stops cut to the picture
    mix[int(stampT * SR) : int((B["hack"]["start"] + 0.05) * SR)] *= 0.0
    tape_stop(mix, rej + 0.02, 0.25, silence_until=rej + 0.6)
    tape_stop(mix, catchT - 0.05, 0.4, silence_until=catchT + 0.4)
    tape_stop(mix, B["token"]["end"] - 0.1, 0.25, silence_until=B["history"]["start"] + 0.05)
    mix = limit(norm(mix, -0.5) * 1.6, -1.0)
    save(fade(mix, 0.002, 0.05), OUT / "music.mp3")


if __name__ == "__main__":
    write_sfx()
    score()
    master_reel(OUT, TL)
