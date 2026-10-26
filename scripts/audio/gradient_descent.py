"""Sound for reel 003 (gradient-descent): every SFX and the score, synthesised and cut to the timeline.

    python3 scripts/audio/gradient_descent.py           # sfx/*.mp3, music.mp3 and the mastered mix.mp3
    python3 scripts/audio/gradient_descent.py --levels  # also print voice/music/sfx levels over time

The timeline (src/reels/gradient-descent/timeline.ts) is read through scripts/audio/cues.mjs, so
re-run this whenever the voiceover or the timeline changes. Design notes:
- The score is 120 BPM in A minor, in blocks that start on picture cuts; each rewind tape-stops it.
- Sonification: the slider ratchet ticks once per 0.01 of learning rate (pitch = rate), the small
  run ticks once per step, the right run's hops climb a pentatonic scale to the goal, the HUD counter
  ticks per step as the loss explodes, and the schedule is played as pitch (warm up, peak, slow down).
- The music is ducked under the voice (vo.mp3); mix.mp3 is the mastered final track (-14 LUFS,
  -1.5 dBFS ceiling) that the reel plays. Cue volumes and MUSIC_VOLUME live in timeline.ts.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from sfxlib import (  # noqa: E402
    ROOT,
    SR,
    adsr,
    bp,
    bus,
    clap,
    duck,
    fade,
    fm_bell,
    fm_pluck,
    gain_env,
    glitch,
    haas,
    hat,
    hp,
    impact,
    kick2,
    limit,
    load_audio,
    loudness,
    lp,
    m2f,
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
    sub_drop,
    sub_note,
    supersaw,
    swell,
    t_,
    tape_stop,
    vo_duck,
    whoosh,
)

SLUG = "gradient-descent"
OUT = reel_dir(SLUG)
SFX = OUT / "sfx"

cues_json = subprocess.run(["node", str(ROOT / "scripts" / "audio" / "cues.mjs"), SLUG], capture_output=True, text=True, check=True, cwd=ROOT).stdout
TL = json.loads(cues_json)
B, C = TL["BEATS"], TL["CUES"]
DUR = TL["DURATION_S"]
STEP = TL["STEP_DUR"]


def ease_in(p):
    return p**3


def ease_out(p):
    return 1 - (1 - p) ** 3


def ease_in_out(p):
    return np.where(p < 0.5, 4 * p**3, 1 - (-2 * p + 2) ** 3 / 2)


def prog(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1)


def schedule(u, warm=0.12, floor=0.1):
    u = np.asarray(u, float)
    p = np.clip((u - warm) / (1 - warm), 0, 1)
    return np.where(u <= 0, 0, np.where(u < warm, u / warm, floor + (1 - floor) * 0.5 * (1 + np.cos(np.pi * p))))


def schedule_head(t):
    """Mirror of control.ts scheduleHead (piecewise through the spoken keys)."""
    K = C["twist"]["keys"]
    out = np.zeros_like(t)
    for i in range(len(K) - 1):
        (ta, ua), (tb, ub) = K[i], K[i + 1]
        m = (t > ta) & (t <= tb)
        p = (t[m] - ta) / (tb - ta)
        shaped = ease_in(p) * 0.5 + p * 0.5 if i == 0 else (ease_out(p) if i == len(K) - 2 else p)
        out[m] = ua + (ub - ua) * shaped
    out[t > K[-1][0]] = 1
    return out


def one(x, db=-1.0):
    return norm(st(x) if x.ndim == 1 else x, db)


# =====================================================================================
# SFX
# =====================================================================================

def thud(i: int):
    """A ball hitting a wall; i = 0..4 escalates weight, pitch and grit. Has a mid 'knock' so it
    reads on phone speakers, not just a sub."""
    t = t_(0.5)
    f = (62 + 8 * i) + (150 + 30 * i) * np.exp(-t * 45)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (11 - i))
    knock = np.sin(2 * np.pi * np.cumsum(260 + 40 * i + 300 * np.exp(-t * 80)) / SR) * np.exp(-t * 32) * 0.7
    slap = bp(noise(len(t)), 500, 3500) * np.exp(-t * 55) * (0.5 + 0.1 * i)
    tick = hp(noise(len(t)), 4000) * np.exp(-t * 300) * 0.3
    x = np.tanh((1.4 + 0.5 * i) * (body * 0.8 + knock + slap + tick))
    return one(reverb(haas(x, 4), 0.6, 0.14), -1)


def escape():
    """Ball smashes out: sub boom + crack + upward zip + glitch debris."""
    t = t_(1.6)
    hit = impact(1.6)[: len(t)]
    zip_ = osc(500 + 2600 * (1 - np.exp(-t * 6))) * np.exp(-t * 5) * 0.25
    zip_ = haas(hp(zip_, 300), 12)
    g = glitch(0.28, seed=4)
    x = hit * 0.9 + zip_
    x[: len(g)] += g * 0.35
    return one(reverb(x, 1.4, 0.18), -0.8)


def rewind(dur):
    """VHS rewind: motor whine, garbled reversed chirps, hiss, and a mechanical clunk at the end."""
    r = np.random.default_rng(21)
    t = t_(dur)
    p = t / dur
    motor = saw(55 + 40 * p, t) * 0.15 + osc(1100 + 900 * p + 120 * np.sin(2 * np.pi * 13 * t)) * 0.12
    chir = np.zeros(len(t))
    pos = 0.0
    while pos < dur - 0.03:
        n = int(r.uniform(0.018, 0.045) * SR)
        i0 = int(pos * SR)
        tt = np.arange(min(n, len(t) - i0)) / SR
        f0 = r.uniform(700, 2600)
        chir[i0 : i0 + len(tt)] += np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * tt / 0.04)) / SR) * np.sin(np.pi * tt / tt[-1]) ** 2 * r.uniform(0.3, 1)
        pos += r.uniform(0.02, 0.05)
    chir = bp(chir, 600, 5000)
    hiss = hp(noise(len(t)), 5000) * 0.08
    x = (motor + chir * 0.6 + hiss) * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.06 + 0.2)
    clunk = kick2(0.12, 300, 120, click=0.8, decay=40) * 0.6
    x = np.concatenate([x, np.zeros(int(0.15 * SR))])
    x[len(t) - int(0.05 * SR) : len(t) - int(0.05 * SR) + len(clunk)] += clunk
    return one(haas(x, 7), -2)


def key():
    """Mechanical key: thock + click."""
    t = t_(0.09)
    x = osc(np.full(len(t), 190.0)) * np.exp(-t * 70) * 0.6 + bp(noise(len(t)), 2200, 7000) * np.exp(-t * 220)
    return one(reverb(x, 0.4, 0.1), -3)


def click():
    """Slider detent: crisp click with a little body."""
    t = t_(0.07)
    x = bp(noise(len(t)), 2500, 9000) * np.exp(-t * 300) + osc(np.full(len(t), 900.0)) * np.exp(-t * 120) * 0.4
    return one(x, -3)


def ratchet():
    """One detent tick each time the demo sweep crosses a 0.01 step; pitch follows the rate."""
    d0, d1 = C["rule"]["demo"]
    t = np.arange(int((d1 - d0) * 1000)) / 1000 + d0
    p = prog(t, d0, d1)
    v = np.where(p < 0.3, 0.12 + (0.05 - 0.12) * ease_in_out(p / 0.3), np.where(p < 0.7, 0.05 + (0.25 - 0.05) * ease_in_out((p - 0.3) / 0.4), 0.25 + (0.12 - 0.25) * ease_in_out((p - 0.7) / 0.3)))
    steps = np.floor(v * 100 + 1e-6)
    out = np.zeros((int((d1 - d0 + 0.3) * SR), 2))
    for k in np.nonzero(np.diff(steps))[0]:
        tt = t_(0.05)
        f = 900 + 7000 * v[k + 1]
        tick = (bp(noise(len(tt)), 2000, 9000) * np.exp(-tt * 260) + osc(np.full(len(tt), f)) * np.exp(-tt * 140) * 0.5) * 0.8
        place(out, tick, t[k + 1] - d0, pan=(v[k + 1] - 0.15) * 4)
    return one(out, -3)


def ticks():
    """Small run: one soft tick per step (40 at 0.0625 s), rising as the loss falls."""
    out = np.zeros((int((40 * STEP["small"] + 0.3) * SR), 2))
    for k in range(1, 41):
        tt = t_(0.04)
        f = 1200 + 25 * k
        x = osc(np.full(len(tt), float(f))) * np.exp(-tt * 160) * 0.6 + bp(noise(len(tt)), 3000, 8000) * np.exp(-tt * 300) * 0.4
        place(out, x * (0.6 + 0.4 * (k % 4 == 0)), k * STEP["small"], pan=0.3 * np.sin(k))
    return one(out, -4)


def hops():
    """Right run: 14 hops climbing A minor pentatonic to the goal, softer as the steps shrink."""
    scale = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88]
    out = np.zeros((int((14 * STEP["right"] + 0.6) * SR), 2))
    for k in range(1, 15):
        tt = t_(0.18)
        f = m2f(scale[k - 1])
        x = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.5 * np.exp(-tt * 70))) / SR) * np.exp(-tt * 22)
        x += fm_pluck(f * 2, 0.18, 1.2, 1.0, 20)[: len(tt)] * 0.3
        place(out, x * (1 - 0.45 * k / 14), k * STEP["right"], pan=0.4 * (-1) ** k)
    return one(reverb(out, 0.9, 0.2), -3)


def land():
    """Lands on the goal: soft thump + A major add9 bell chord."""
    t = t_(2.4)
    x = np.zeros((len(t), 2))
    place(x, kick2(0.3, 120, 50, click=0.1) * 0.5, 0)
    for m, g in [(69, 0.5), (73, 0.4), (76, 0.4), (83, 0.25)]:
        place(x, fm_bell(m2f(m), 2.2, 2.0, 2.0, 2.2) * g, 0.012 * (m - 69) / 4)
    return one(reverb(x, 2.0, 0.3), -1.5)


def chime():
    x = fm_bell(m2f(88), 1.8, 2.4, 3.5, 2.6) * 0.6 + fm_bell(m2f(81), 1.8, 1.8, 2.0, 2.2) * 0.5
    return one(reverb(haas(x, 6), 1.8, 0.35), -2)


def slam():
    """Knob slammed to 0.22: heavy hit + metallic clank + crack."""
    t = t_(0.9)
    k = kick2(0.9, 220, 42, click=0.6, drive=3, decay=5)
    clank = np.sin(2 * np.pi * 420 * t + 3 * np.exp(-t * 9) * np.sin(2 * np.pi * 420 * 1.41 * t)) * np.exp(-t * 9) * 0.35
    crack = bp(noise(len(t)), 1500, 8000) * np.exp(-t * 40) * 0.5
    return one(reverb(k + clank + crack, 1.0, 0.18), -0.8)


def hud():
    t = t_(0.2)
    x = np.zeros(len(t))
    for i, f in enumerate([1320, 1760]):
        tt = t_(0.05)
        s = int(i * 0.06 * SR)
        x[s : s + len(tt)] += np.sign(np.sin(2 * np.pi * f * tt)) * 0.3 * np.exp(-tt * 40)
    return one(lp(x, 6000), -6)


def meh():
    """'Still far': two soft descending tones."""
    t = t_(0.5)
    x = np.zeros(len(t))
    for i, m in enumerate([76, 72]):
        tt = t_(0.22)
        s = int(i * 0.14 * SR)
        x[s : s + len(tt)] += fm_pluck(m2f(m), 0.22, 1.0, 1.0, 9)
    return one(reverb(x, 0.8, 0.2), -4)


def counter():
    """HUD counts steps 7 -> 30 while the loss explodes: a tick per step, accelerating and rising."""
    a, b = 0.0, 1.25
    t = np.arange(int(b * 1000)) / 1000
    s = 7 + 23 * ease_in(prog(t, a, b))
    out = np.zeros((int((b + 0.3) * SR), 2))
    for k in np.nonzero(np.diff(np.floor(s)))[0]:
        tt = t_(0.035)
        f = 700 * 2 ** ((s[k + 1] - 7) / 12)
        x = osc(np.full(len(tt), f)) * np.exp(-tt * 140) + bp(noise(len(tt)), 3000, 9000) * np.exp(-tt * 300) * 0.5
        place(out, x, t[k + 1], pan=0.25 * (-1) ** k)
    return one(out, -3)


def whip():
    """Whip pan: air rush that peaks mid-move with a tonal zip."""
    t = t_(0.55)
    p = t / 0.55
    env = np.exp(-((p - 0.45) ** 2) / 0.02)
    air = bp(noise(len(t)), 600, 9000) * env
    zip_ = osc(400 + 3000 * env) * env * 0.25
    x = air + zip_
    pan = p * 2 - 1
    return one(st(x * (1 - 0.5 * pan), x * (1 + 0.5 * pan)), -2)


def draw():
    """Lines drawing on the chart: a soft descending glide (loss falling) with a grain of ticks."""
    t = t_(1.7)
    p = t / 1.7
    f = 880 * 2 ** (-1.4 * ease_out(p))
    x = (osc(f) * 0.6 + osc(f * 1.5) * 0.2) * np.sin(np.pi * np.minimum(1, p * 1.05)) ** 0.8
    gr = bp(noise(len(t)), 4000, 9000) * (np.sin(2 * np.pi * 24 * t) > 0.9) * 0.15
    return one(reverb(haas(x + gr, 10), 1.0, 0.25), -6)


def tension():
    """The 0.22 line climbing: rising detuned tone + noise, cut hard at the breakout."""
    t = t_(1.4)
    p = t / 1.4
    f = 160 * 2 ** (3 * p**1.5)
    x = (saw(f, t) + saw(f * 1.01, t, 0.3)) * 0.3 + hp(noise(len(t)), 1500) * 0.3 * p
    x = lp(x, 6000) * (0.2 + 0.8 * p) * (0.8 + 0.2 * np.sin(2 * np.pi * (8 + 30 * p) * t))
    return one(haas(x, 9), -2)


def flat():
    """'One fixed number': one steady tone (the dashed line), the musical opposite of the schedule."""
    t = t_(1.0)
    f = m2f(69)
    x = (osc(np.full(len(t), f)) + 0.25 * np.sign(osc(np.full(len(t), f)))) * adsr(len(t), 0.02, 0.1, 0.8, 0.35)
    return one(reverb(lp(x, 3000), 0.8, 0.2), -5)


def sched():
    """The schedule played as pitch: rises through warm-up, peaks, glides down as it slows."""
    k0, k3 = C["twist"]["curve"]
    dur = k3 - k0 + 0.6
    t = t_(dur)
    tt = t + k0
    lr = schedule(schedule_head(tt))
    f = 196 * 2 ** (2.2 * lr)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * prog(t, 0.6, 1.2)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = np.sin(ph) * 0.6 + 0.25 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    x *= np.minimum(1, t / 0.05) * np.clip((dur - t) / 0.5, 0, 1)
    return one(reverb(haas(x, 8), 1.4, 0.3), -4)


def hit():
    """CTA headline slam: tight punch + snap."""
    k = kick2(0.5, 190, 50, click=0.5, drive=2.5, decay=9)
    t = t_(0.5)
    snap = bp(noise(len(t)), 1800, 7000) * np.exp(-t * 45) * 0.5
    return one(reverb(k + snap, 0.8, 0.15), -1)


def send():
    t = t_(0.35)
    f = 600 * 2 ** (1.6 * np.minimum(1, t / 0.12))
    x = osc(f) * np.exp(-t * 12) * 0.6 + hp(noise(len(t)), 3000) * np.exp(-t * 20) * 0.3
    return one(reverb(x, 0.7, 0.2), -4)


def write_sfx():
    for i in range(5):
        save(thud(i), SFX / f"thud{i}.mp3")
    save(escape(), SFX / "escape.mp3")
    save(rewind(B["rewind1"]["end"] - B["rewind1"]["start"] + 0.05), SFX / "rewind.mp3")
    save(rewind(B["rewind2"]["end"] - B["rewind2"]["start"] + 0.05), SFX / "rewind_short.mp3")
    save(swell(3.0, chord=(110.0, 164.81, 220.0, 261.63, 329.63)), SFX / "swell.mp3")
    save(pop(880), SFX / "pop.mp3")
    save(pop(1175), SFX / "pop2.mp3")
    save(chime(), SFX / "chime.mp3")
    save(whoosh(0.8), SFX / "whoosh.mp3")
    save(key(), SFX / "key.mp3")
    save(riser(0.6), SFX / "rise.mp3")
    save(ratchet(), SFX / "ratchet.mp3")
    save(hud(), SFX / "hud.mp3")
    save(click(), SFX / "click.mp3")
    save(ticks(), SFX / "ticks.mp3")
    save(meh(), SFX / "meh.mp3")
    save(hops(), SFX / "hops.mp3")
    save(land(), SFX / "land.mp3")
    save(slam(), SFX / "slam.mp3")
    save(counter(), SFX / "counter.mp3")
    save(whip(), SFX / "whip.mp3")
    save(draw(), SFX / "draw.mp3")
    save(tension(), SFX / "tension.mp3")
    save(glitch(0.32, seed=4), SFX / "glitch.mp3")
    save(flat(), SFX / "flat.mp3")
    save(sched(), SFX / "sched.mp3")
    save(hit(), SFX / "hit.mp3")
    save(send(), SFX / "send.mp3")
    # drop files the timeline no longer uses
    used = {c["file"] for c in TL["SFX_CUES"]}
    for p in SFX.glob("*.mp3"):
        if p.stem not in used:
            p.unlink()
    missing = used - {p.stem for p in SFX.glob("*.mp3")}
    assert not missing, f"timeline cues sounds that were not generated: {missing}"


# =====================================================================================
# Score: 120 BPM, A minor. Blocks start on picture cuts; rewinds tape-stop the music.
# =====================================================================================

BEAT = 0.5
BAR = 4 * BEAT
S16 = BEAT / 4

# chords: (bass midi, pad midis)
Am7 = (45, [57, 60, 64, 67])
Fmaj7 = (41, [53, 57, 60, 64])
Cadd9 = (48, [55, 60, 62, 64])
G6 = (43, [55, 59, 62, 64])
E7 = (40, [56, 59, 62, 64])
Dm9 = (38, [53, 57, 60, 64])
PROG_MAIN = [Am7, Fmaj7, Cadd9, G6]
PROG_DARK = [Am7, Am7, Fmaj7, E7]
PROG_BRIGHT = [Fmaj7, G6, Am7, Cadd9]
PROG_CTA = [Fmaj7, G6, Cadd9, Am7]

KICK = {"half": [0, 10], "main": [0, 6, 8, 11], "drop": [0, 3, 6, 8, 10, 11, 14], "four": [0, 4, 8, 12]}
CLAP = {"half": [8], "main": [4, 12], "drop": [4, 12]}


# music bus faders (linear). Balanced so the score still reads on phone speakers (little below 150 Hz).
MIXER = {"drums": 1.0, "bass": 1.0, "pad": 3.0, "arp": 2.5, "fx": 0.9}
STEMS: dict = {}


def score(duration):
    n = int(duration * SR)
    drums, bass, pad, arp, fx = bus(duration), bus(duration), bus(duration), bus(duration), bus(duration)
    kicks: list[float] = []

    K, CL, HT, OH = kick2(click=0.55), clap(), hat(), hat(True)

    def block(t0, t1, prog, part_at):
        """Fill [t0, t1) on a grid starting at t0. part_at(t) -> dict of active parts."""
        bar = 0
        while t0 + bar * BAR < t1:
            tb = t0 + bar * BAR
            bass_m, pad_ms = prog[bar % len(prog)]
            p = part_at(tb)
            # pad: one chord per bar
            if p.get("pad"):
                d = min(BAR, t1 - tb) + 0.25
                place(pad, supersaw([m2f(m) for m in pad_ms], d, cutoff=p.get("cut", 1800), seed=bar) * adsr(int(d * SR), 0.05, 0.2, 0.85, 0.25)[:, None], tb)
            for s in range(16):
                ts = tb + s * S16
                if ts >= t1:
                    break
                q = part_at(ts)
                kp = KICK.get(q.get("kick", ""), [])
                if s in kp:
                    place(drums, K, ts, 0.9)
                    kicks.append(ts)
                if s in CLAP.get(q.get("clap", ""), []):
                    place(drums, CL, ts, 1.0)
                hd = q.get("hats", 0)
                if hd and (hd == 16 or s % 2 == 0):
                    vel = [1.0, 0.35, 0.6, 0.35][s % 4]
                    place(drums, HT, ts + 0.006 * (s % 2), 0.42 * vel, pan=0.25)
                if q.get("open") and s in (6, 14):
                    place(drums, OH, ts, 0.22, pan=-0.2)
                if q.get("bass") and s in (q.get("bass_pat") or [0, 3, 6, 8, 11, 14]):
                    glide = m2f(bass_m + 12) if (s == 0 and bar % 2 == 1) else None
                    place(bass, sub_note(m2f(bass_m), S16 * 2.6, glide_from=glide, drive=3.5) * 0.42, ts)
                if q.get("arp") and (q["arp"] == 16 or s % 2 == 0):
                    notes = [m + 12 for m in pad_ms]
                    order = [0, 2, 1, 3, 2, 1, 3, 2]
                    m = notes[order[(s // (1 if q["arp"] == 16 else 2)) % 8]]
                    place(arp, fm_pluck(m2f(m), 0.4, 2.2, 2.0, 8, 18) * 0.16, ts, pan=0.35 * (-1) ** s)
            bar += 1

    # cold open: a sub drone and a reversed swell that lands on the escape
    hook_end = C["hook"]["escape"]
    t = t_(hook_end + 0.6)
    drone = (np.tanh(2 * osc(np.full(len(t), 55.0))) * 0.5 + supersaw([m2f(45), m2f(52)], len(t) / SR, cutoff=500)[:, 0] * 1.2) * np.minimum(1, t / 0.02) * np.clip((hook_end + 0.6 - t) / 0.6, 0, 1)
    place(fx, drone * 0.5, 0)
    place(fx, reverse_swell(1.3) * 0.5, hook_end - 1.3)

    # block 1: valley -> rule -> small run (one continuous groove that builds)
    v0, r0, s0 = B["valley"]["start"], B["rule"]["start"], B["small"]["start"]

    def part1(tt):
        if tt < v0 + BAR:
            return {"pad": 1, "cut": 800, "hats": 8 if tt >= v0 + BAR / 2 else 0}
        if tt < r0:
            return {"pad": 1, "cut": 1100, "kick": "half", "clap": "half", "hats": 8, "bass": 1, "bass_pat": [0, 8]}
        if tt < s0:
            return {"pad": 1, "cut": 1500, "kick": "main", "clap": "main", "hats": 8, "bass": 1, "arp": 8}
        return {"pad": 1, "cut": 1800, "kick": "main", "clap": "main", "hats": 16, "open": 1, "bass": 1, "arp": 0}

    block(v0, B["rewind2"]["start"], PROG_MAIN, part1)

    # block 2: just right (bright, light)
    block(B["right"]["start"], B["rewind3"]["start"], [Fmaj7, Cadd9], lambda tt: {"pad": 1, "cut": 2200, "kick": "main", "clap": "main", "hats": 8, "bass": 1, "arp": 16})

    # block 3: too big (driving 16th bass) until the explode, then a dark tail into the whip
    ex = C["big"]["explode"]
    block(B["big"]["start"], ex, PROG_DARK, lambda tt: {"pad": 1, "cut": 1200 + 1500 * (tt - B["big"]["start"]) / (ex - B["big"]["start"]), "kick": "four", "clap": "main", "hats": 16, "bass": 1, "bass_pat": list(range(0, 16, 2))})
    place(fx, reverse_swell(1.0, 1.3) * 0.45, ex - 1.0)
    t = t_(C["chart"]["whip"] - ex + 0.3)
    tail = supersaw([m2f(45), m2f(52), m2f(57)], len(t) / SR, cutoff=600)[:, 0] * 1.5 * np.exp(-t * 1.2)
    place(fx, tail, ex + 0.05)

    # block 4: the chart (dark groove), cut before the breakout, then the drop
    ch0, gate0, brk = C["chart"]["whip"], C["chart"]["bigDraw"][0] + 0.2, C["chart"]["breakout"]
    block(ch0 + 0.25, gate0, PROG_DARK, lambda tt: {"pad": 1, "cut": 1300, "kick": "main", "clap": "main", "hats": 8, "bass": 1})
    place(fx, reverse_swell(brk - gate0 + 0.1, 1.4) * 0.6, gate0 - 0.1)

    # block 5: drop at the breakout -> twist -> CTA (one grid)
    tw0, fixed, warm, peak, slow = B["twist"]["start"], C["twist"]["fixed"], C["twist"]["keys"][0][0], C["twist"]["keys"][1][0], C["twist"]["keys"][2][0]
    cta0, whip2 = B["cta"]["start"], C["cta"]["whip"]

    def part5(tt):
        if tt < tw0:
            return {"pad": 1, "cut": 2600, "kick": "drop", "clap": "drop", "hats": 16, "open": 1, "bass": 1, "arp": 16}
        if tt < fixed:
            return {"pad": 1, "cut": 1600, "kick": "half", "clap": "half", "hats": 8, "bass": 1, "bass_pat": [0, 8]}
        if tt < warm:
            return {"pad": 1, "cut": 900}
        if tt < slow:
            return {"pad": 1, "cut": 2400, "kick": "main", "clap": "main", "hats": 16, "bass": 1, "arp": 16}
        if tt < cta0:
            return {"pad": 1, "cut": 1400, "kick": "half", "clap": "half", "hats": 8, "bass": 1, "bass_pat": [0, 8]}
        if tt < whip2:
            return {"pad": 1, "cut": 2200, "kick": "main", "clap": "main", "hats": 16, "open": 1, "bass": 1, "arp": 8}
        return {}

    block(brk, whip2, [Am7] + PROG_BRIGHT * 2 + PROG_CTA * 2, part5)
    place(fx, reverse_swell(0.9, 1.2) * 0.4, warm - 0.9)

    # tail back into the cold open's drone so the loop is seamless
    t = t_(duration - whip2 + 0.05)
    drone2 = np.tanh(2 * osc(np.full(len(t), 55.0))) * 0.5 + supersaw([m2f(45), m2f(52)], len(t) / SR, cutoff=500)[:, 0] * 1.2
    place(fx, drone2 * 0.5 * np.minimum(1, t / 0.25), whip2)

    # ---- mix the music bus ----
    pump = duck(n, kicks, depth=0.5, release=0.16)[:, None]
    pad_f = pad * pump
    bass_f = bass * duck(n, kicks, depth=0.35, release=0.1)[:, None]
    arp_w = reverb(arp, 1.6, 0.35, tail=False)
    drums_w = drums + reverb(drums * 0.25, 1.2, 1.0, tail=False) * 0.25
    STEMS.update(drums=drums_w, bass=bass_f, pad=pad_f, arp=arp_w, fx=fx)
    return STEMS


# how far each stem dips while the voice speaks (dB): melody gets out of the way entirely,
# so the arp answers the voice in the gaps; low end and drums dip less to keep the groove
VO_DUCK_DB = {"drums": -8, "bass": -6, "pad": -13, "arp": -22, "fx": -10}


def write_music():
    stems = score(DUR)
    n = len(stems["drums"])
    vo_path = OUT / "vo.mp3"
    vo = load_audio(vo_path) if TL["USE_VO"] and vo_path.exists() else None
    mix = np.zeros((n, 2))
    for k, fader in MIXER.items():
        x = stems[k] * fader
        if vo is not None:
            x = x * vo_duck(n, vo, depth_db=VO_DUCK_DB[k], attack=0.05, release=0.35)[:, None]
        mix += x
    mix = hp(mix, 30, 2)
    # tape stops into each rewind; silence until the next block
    for rw in ("rewind1", "rewind2", "rewind3"):
        tape_stop(mix, B[rw]["start"] - 0.04, 0.32, silence_until=B[rw]["end"])
    mix = limit(norm(mix, -0.5) * 1.6, -1.0)
    save(fade(mix, 0.002, 0.05), OUT / "music.mp3")


def write_mix(target_lufs=-14.0):
    """Master the final track: voice + score + every SFX cue, mixed the way the timeline places them.
    SFX dip 6 dB under the voice, then a limiter (-1 dBTP) and loudness normalisation (-14 LUFS,
    what Instagram and YouTube play back at). Reel.tsx plays this file when USE_MIX is on."""
    n = int(DUR * SR)
    vo = bus(DUR)
    has_vo = TL["USE_VO"] and (OUT / "vo.mp3").exists()
    if has_vo:
        place(vo, load_audio(OUT / "vo.mp3"), 0)
    music = bus(DUR)
    place(music, load_audio(OUT / "music.mp3") * TL["MUSIC_VOLUME"], 0)
    fx = bus(DUR)
    for c in TL["SFX_CUES"]:
        x = load_audio(SFX / f"{c['file']}.mp3")
        if "end" in c:
            x = x[: int((c["end"] - c["t"]) * SR)]
            x = fade(x, 0.001, 0.01)
        place(fx, x * c["volume"], round(c["t"] * 30) / 30)
    if has_vo:
        fx = fx * vo_duck(n, vo, depth_db=-6, attack=0.03, release=0.25)[:, None]
    mix = vo + music + fx
    tmp = ROOT / "out" / SLUG / "mix-pre.wav"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    for _ in range(3):  # limit, measure, adjust
        mastered = limit(mix, -1.5, release=0.08)
        save(mastered, tmp)
        lu = loudness(tmp)["I"]
        if lu is None or abs(lu - target_lufs) < 0.3:
            break
        mix = mix * 10 ** ((target_lufs - lu) / 20)
    tmp.unlink(missing_ok=True)
    save(mastered, OUT / "mix.mp3")
    lv = loudness(OUT / "mix.mp3")
    print(f"mix: {lv['I']} LUFS, true peak {lv['TP']} dBTP")


def level_report(step=0.5):
    """RMS of voice / music / sfx per window (dB) to check the balance by eye."""
    n = int(DUR * SR)
    vo, mu, fx = bus(DUR), bus(DUR), bus(DUR)
    if (OUT / "vo.mp3").exists():
        place(vo, load_audio(OUT / "vo.mp3"), 0)
    place(mu, load_audio(OUT / "music.mp3") * TL["MUSIC_VOLUME"], 0)
    for c in TL["SFX_CUES"]:
        place(fx, load_audio(SFX / f"{c['file']}.mp3") * c["volume"], c["t"])
    W = int(step * SR)
    db = lambda a: 20 * np.log10(np.sqrt(np.mean(a**2)) + 1e-9)  # noqa: E731
    print("   t    voice  music    sfx")
    for i in range(0, n - W, W):
        s = slice(i, i + W)
        print(f"{i / SR:5.1f} {db(vo[s]):7.1f} {db(mu[s]):6.1f} {db(fx[s]):6.1f}")


if __name__ == "__main__":
    SFX.mkdir(parents=True, exist_ok=True)
    write_sfx()
    write_music()
    write_mix()
    if "--levels" in sys.argv:
        level_report()
