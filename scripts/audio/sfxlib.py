"""Optimizer Step sound library: every sound synthesised from code (numpy + scipy), no samples.

Use from a per-reel script:
    from sfxlib import *
    out = reel_dir("attention-bank")
    save(whoosh(1.0), out / "sfx/whoosh.mp3")
    save(music_bed(45, bpm=110, sections=[(0, DMINOR), (36.5, FMAJOR)]), out / "music.mp3")
"""
from __future__ import annotations

import os
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np
from scipy import signal

SR = 44100
_rng = np.random.default_rng(11)
ROOT = Path(__file__).resolve().parents[2]


def reel_dir(slug: str) -> Path:
    return ROOT / "public" / "reels" / slug


# ---------- primitives ----------

def t_(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def noise(n: int) -> np.ndarray:
    return _rng.standard_normal(n)


def _sos(kind, f, order=4):
    return signal.butter(order, f, kind, fs=SR, output="sos")


def lp(x, f, order=4):
    return signal.sosfilt(_sos("low", min(f, SR / 2 - 100), order), x)


def hp(x, f, order=2):
    return signal.sosfilt(_sos("high", f, order), x)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(_sos("band", [lo, hi], order), x)


def sweep_lp(x, f0, f1, curve=1.0):
    """Time-varying one-pole low-pass (cutoff f0 -> f1)."""
    n = len(x)
    fc = f0 + (f1 - f0) * (np.linspace(0, 1, n) ** curve)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty(n)
    s = 0.0
    for i in range(n):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def saw(f, t, ph=0.0):
    return 2 * ((f * t + ph) % 1.0) - 1


def tri(f, t, ph=0.0):
    return 2 * np.abs(saw(f, t, ph)) - 1


def osc(freq_curve):
    """Sine from an instantaneous-frequency array."""
    return np.sin(2 * np.pi * np.cumsum(freq_curve) / SR)


def adsr(n, a, d, s, r):
    e = np.ones(n) * s
    na, nd, nr = min(int(a * SR), n), int(d * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if na + nd < n and nd:
        e[na : na + nd] = np.linspace(1, s, nd)
    if 0 < nr <= n:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def st(l, r=None):
    return np.stack([l, l if r is None else r], axis=1)


def norm(x, peak_db=-1.0):
    return x * (10 ** (peak_db / 20) / (np.max(np.abs(x)) + 1e-9))


def fade(x, fin=0.004, fout=0.02):
    n = len(x)
    w = np.ones(n)
    a, b = int(fin * SR), int(fout * SR)
    if a:
        w[:a] = np.linspace(0, 1, a)
    if b:
        w[-b:] *= np.linspace(1, 0, b)
    return x * (w[:, None] if x.ndim == 2 else w)


def haas(x, ms=9):
    """Mono -> wide stereo with a short delay on one side."""
    d = int(ms / 1000 * SR)
    return st(x, np.concatenate([np.zeros(d), x[:-d]]))


def save(x, path):
    path = Path(path)
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = st(x)
    pcm = (x * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp = f.name
    with wave.open(tmp, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-codec:a", "libmp3lame", "-b:a", "192k", str(path)], check=True)
    os.remove(tmp)
    print("wrote", path.relative_to(ROOT))


# ---------- sound effects ----------

def whoosh(dur=0.9, bright=1.0):
    """Air whoosh that pans left to right; for camera moves and swipes."""
    t = t_(dur)
    p = t / dur
    x = sweep_lp(noise(len(t)), 7000 * bright, 400, 0.6)
    x = hp(x, 180) * np.sin(np.pi * p) ** 1.5
    pan = 0.5 + 0.5 * np.sin(np.pi * (p - 0.5))
    return fade(norm(st(x * (1.25 - pan), x * (0.25 + pan)), -2))


def flight(dur=1.6):
    """Long camera-flight whoosh with a doppler tone underneath."""
    t = t_(dur)
    p = t / dur
    air = hp(sweep_lp(noise(len(t)), 900, 6500, 1.2), 150)
    air = air * np.sin(np.pi * p) ** 1.2
    tone = osc(220 + 340 * np.sin(np.pi * p)) * np.sin(np.pi * p) ** 2 * 0.25
    x = air + tone
    pan = p
    return fade(norm(st(x * (1.2 - pan), x * (0.2 + pan)), -2), 0.02, 0.1)


def impact(dur=1.8):
    """Cinematic hit: sub thump + noise crack + shimmering tail."""
    t = t_(dur)
    sub = np.tanh(2 * osc(70 * np.exp(-t * 3) + 38)) * np.exp(-t * 2.6)
    crack = bp(noise(len(t)), 900, 7000) * np.exp(-t * 28) * 0.7
    shimmer = sum(np.sin(2 * np.pi * f * t + i) for i, f in enumerate([1318.5, 1975.5, 2637.0])) * np.exp(-t * 3.2) * 0.08
    x = sub + crack + shimmer
    return fade(norm(haas(x, 7), -1))


def riser(dur=3.0):
    t = t_(dur)
    p = t / dur
    nz = hp(sweep_lp(noise(len(t)), 250, 8000, 2.0), 120)
    tone = osc(90 * 2 ** (p * 3)) + 0.4 * osc(135 * 2 ** (p * 3))
    trem = 0.75 + 0.25 * np.sin(2 * np.pi * (3 + 18 * p**2) * t)
    x = (0.6 * nz + 0.4 * tone) * p**1.7 * trem
    return fade(norm(haas(x, 11), -1), 0.03, 0.004)


def glitch(dur=0.35, seed=1):
    """Digital stutter: chopped noise + bit-crushed blips."""
    r = np.random.default_rng(seed)
    t = t_(dur)
    x = np.zeros(len(t))
    pos = 0
    while pos < len(t):
        seg = int(r.uniform(0.012, 0.045) * SR)
        kind = r.integers(0, 3)
        tt = np.arange(min(seg, len(t) - pos)) / SR
        if kind == 0:
            chunk = bp(noise(len(tt)), 1500, 9000)
        elif kind == 1:
            chunk = np.sign(np.sin(2 * np.pi * r.uniform(200, 2400) * tt))
        else:
            chunk = np.zeros(len(tt))
        x[pos : pos + len(tt)] = chunk * r.uniform(0.4, 1.0)
        pos += seg
    x = np.round(x * 6) / 6
    return fade(norm(st(x, np.roll(x, 37)), -3))


def pop(freq=880, dur=0.12):
    """Soft UI pop for chips and labels appearing."""
    t = t_(dur)
    x = osc(freq * (1 + 0.6 * np.exp(-t * 60))) * np.exp(-t * 38)
    x += bp(noise(len(t)), 2000, 6000) * np.exp(-t * 120) * 0.25
    return fade(norm(st(x), -4))


def tick(dur=0.05):
    t = t_(dur)
    x = bp(noise(len(t)), 3000, 9000) * np.exp(-t * 180)
    return fade(norm(st(x), -6))


def typing(n=14, rate=11.0, seed=4):
    """Keyboard clicks for a typing animation."""
    r = np.random.default_rng(seed)
    dur = n / rate + 0.2
    out = np.zeros(int(dur * SR))
    for i in range(n):
        tt = t_(0.04)
        c = bp(noise(len(tt)), 1800 + r.uniform(-300, 600), 7500) * np.exp(-tt * 140) * r.uniform(0.5, 1.0)
        c += osc(np.full(len(tt), r.uniform(140, 220))) * np.exp(-tt * 90) * 0.4
        s = int((i / rate + r.uniform(-0.015, 0.015)) * SR)
        s = max(0, s)
        out[s : s + len(c)] += c[: len(out) - s]
    return fade(norm(haas(out, 4), -4))


def swell(dur=3.5, chord=(146.83, 220.0, 293.66, 349.23, 440.0)):
    t = t_(dur)
    l = sum(saw(f * 1.003, t, 0.1 * i) for i, f in enumerate(chord))
    r = sum(saw(f * 0.997, t, 0.37 * i) for i, f in enumerate(chord))
    l, r = sweep_lp(l, 400, 3500, 0.8), sweep_lp(r, 400, 3500, 0.8)
    e = adsr(len(t), 1.2, 0.7, 0.75, 1.4)
    return fade(norm(st(l * e, r * e), -3))


def sub_drop(dur=2.2):
    t = t_(dur)
    x = np.tanh(2.4 * osc(60 * np.exp(-t * 1.2) + 30)) * np.exp(-t * 1.7)
    return fade(norm(st(x), -1))


def beam(dur=0.9):
    """Rising 'laser' shimmer for attention beams drawing on."""
    t = t_(dur)
    p = t / dur
    f = 600 + 1400 * p**0.6
    x = (osc(f) + 0.5 * osc(f * 1.5)) * np.sin(np.pi * p) ** 1.3
    x += bp(noise(len(t)), 3000, 9000) * np.sin(np.pi * p) * 0.15
    return fade(norm(haas(x * 0.6, 12), -4))


# ---------- music ----------

NOTE = {n: 440.0 * 2 ** ((i - 9) / 12) for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def chord(root, quality="m", octave=3):
    base = NOTE[root] * 2 ** (octave - 4)
    iv = {"m": [0, 3, 7, 12], "M": [0, 4, 7, 12], "m7": [0, 3, 7, 10], "M7": [0, 4, 7, 11], "sus2": [0, 2, 7, 12]}[quality]
    return [base * 2 ** (s / 12) for s in iv]


DMINOR = [chord("D", "m"), chord("A#", "M"), chord("F", "M"), chord("C", "M")]
FMAJOR = [chord("F", "M7"), chord("C", "M"), chord("D", "m7"), chord("A#", "M7")]


def music_bed(duration, bpm=110, sections=((0, DMINOR),), bars_per_chord=1, energy=1.0):
    """Modern techy bed: soft kick, hats, sub bass, pad, plucked arpeggio. sections = [(start_s, progression)]."""
    n = int(duration * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    beat = 60 / bpm
    bar = beat * 4
    seg = bar * bars_per_chord

    def prog_at(tt):
        cur = sections[0][1]
        for s0, pr in sections:
            if tt >= s0 - 1e-6:
                cur = pr
        return cur

    def add(sig_l, sig_r, start):
        i0 = int(start * SR)
        if i0 >= n:
            return
        i1 = min(n, i0 + len(sig_l))
        L[i0:i1] += sig_l[: i1 - i0]
        R[i0:i1] += sig_r[: i1 - i0]

    k = 0
    tt = 0.0
    while tt < duration:
        pr = prog_at(tt)
        ch = pr[k % len(pr)]
        tseg = t_(seg + 0.5)
        pad_l = sum(saw(f * 1.004, tseg, 0.13 * i) for i, f in enumerate(ch)) / len(ch)
        pad_r = sum(saw(f * 0.996, tseg, 0.29 * i) for i, f in enumerate(ch)) / len(ch)
        e = adsr(len(tseg), 0.4, 0.3, 0.8, 0.5)
        add(lp(pad_l, 1100) * e * 0.5, lp(pad_r, 1100) * e * 0.5, tt)
        # sub bass on the root, pulsing quarter notes
        for q in range(4 * bars_per_chord):
            tb = t_(beat * 0.95)
            b = np.sin(2 * np.pi * ch[0] / 2 * tb) * adsr(len(tb), 0.01, 0.2, 0.6, 0.15) * 0.55
            add(b, b, tt + q * beat)
        # plucked arpeggio on 8ths
        arp = [ch[0] * 2, ch[1] * 2, ch[2] * 2, ch[3] * 2, ch[2] * 2, ch[1] * 2]
        for e8 in range(8 * bars_per_chord):
            tp = t_(0.35)
            f = arp[e8 % len(arp)]
            pl = lp(saw(f, tp) * np.exp(-tp * 11), 2600) * 0.16 * energy
            side = 0.7 if e8 % 2 else 1.3
            add(pl * side, pl * (2 - side), tt + e8 * beat / 2)
        tt += seg
        k += 1

    # drums
    t_k = t_(0.32)
    kick = np.sin(2 * np.pi * np.cumsum(55 + 110 * np.exp(-t_k * 30)) / SR) * np.exp(-t_k * 9) * 0.7 * energy
    t_h = t_(0.05)
    hat = bp(noise(len(t_h)), 6000, 12000) * np.exp(-t_h * 110) * 0.18
    b = 0
    while b * beat < duration:
        add(kick, kick, b * beat)
        add(hat * 0.6, hat * 0.9, b * beat + beat / 2)
        b += 1
    return fade(norm(np.stack([L, R], axis=1), -3), 0.4, 1.2)
