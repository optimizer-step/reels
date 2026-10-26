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


# =====================================================================================
# v2: production tools (reel 003 onwards). Everything is vectorised numpy; times in seconds.
# =====================================================================================

from scipy.ndimage import maximum_filter1d  # noqa: E402


def m2f(m: float) -> float:
    """MIDI note number -> Hz (A4 = 69 = 440 Hz)."""
    return 440.0 * 2 ** ((m - 69) / 12)


def stereo(x):
    return st(x) if x.ndim == 1 else x


def bus(duration: float) -> np.ndarray:
    return np.zeros((int(duration * SR), 2))


def place(b, x, t, gain=1.0, pan=0.0):
    """Add a sound into a stereo bus at time t. pan -1 (left) .. 1 (right), equal power."""
    x = stereo(x)
    if pan:
        a = (pan + 1) * np.pi / 4
        x = x * np.array([np.cos(a), np.sin(a)]) * np.sqrt(2)
    i0 = int(round(t * SR))
    if i0 < 0:
        x, i0 = x[-i0:], 0
    if i0 >= len(b) or not len(x):
        return
    n = min(len(x), len(b) - i0)
    b[i0 : i0 + n] += x[:n] * gain


def load_audio(path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def reverb(x, seconds=1.8, mix=0.3, predelay=0.015, damp=7000, seed=3, tail=True):
    """Stereo convolution reverb with a synthetic decorrelated impulse (RT60 = seconds)."""
    x = stereo(x)
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 6.9 / seconds) * (1 - np.exp(-t / 0.006))
    ir = np.stack([lp(r.standard_normal(n) * env, damp, 2), lp(r.standard_normal(n) * env, damp, 2)], 1)
    ir = np.concatenate([np.zeros((int(predelay * SR), 2)), ir])
    ir /= np.sqrt(np.sum(ir**2) / 2)
    if tail:
        x = np.concatenate([x, np.zeros((len(ir), 2))])
    wet = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x * (1 - mix) + wet * mix


def lp_auto(x, cutoff_at, block=512, order=2):
    """Low-pass whose cutoff follows cutoff_at(t) (Hz), processed in short blocks with carried state."""
    x = stereo(x)
    y = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        fc = float(np.clip(cutoff_at((i + block / 2) / SR), 40, SR / 2 - 200))
        sos = _sos("low", fc, order)
        if zi is None:
            zi = np.zeros((sos.shape[0], 2, 2))
        y[i : i + block], zi = signal.sosfilt(sos, x[i : i + block], axis=0, zi=zi)
    return y


def gain_env(n, points):
    """Piecewise-linear gain from [(t, g), ...]."""
    t = np.arange(n) / SR
    ts, gs = zip(*points)
    return np.interp(t, ts, gs)


def duck(n, times, depth=0.55, attack=0.004, release=0.18):
    """Sidechain-style gain dips at each time (kick pump)."""
    g = np.ones(n)
    for tk in times:
        i0 = int(tk * SR)
        if i0 >= n:
            continue
        i1 = min(n, i0 + int(release * 6 * SR))
        tt = np.arange(i1 - i0) / SR
        e = depth * np.minimum(1, tt / attack) * np.exp(-np.maximum(0, tt - attack) / release)
        g[i0:i1] = np.minimum(g[i0:i1], 1 - e)
    return g


def vo_duck(n, vo, depth_db=-9.0, thresh_db=-40.0, attack=0.06, release=0.4, lookahead=0.08):
    """Gain curve that dips the music while the voice speaks (control rate 1 kHz)."""
    hop = SR // 1000
    mono = np.mean(vo, axis=1)
    m = len(mono) // hop
    rms = np.sqrt(np.convolve(mono[: m * hop].reshape(m, hop).__pow__(2).mean(1), np.ones(30) / 30, mode="same") + 1e-12)
    active = 20 * np.log10(rms) > thresh_db
    la = int(lookahead * 1000)
    active = np.concatenate([active[la:], np.zeros(la, bool)]) | active  # open a little early
    active = maximum_filter1d(active.astype(float), size=120) > 0  # bridge short gaps between words
    target = np.where(active, 10 ** (depth_db / 20), 1.0)
    g = np.empty(m)
    cur = 1.0
    a_dn, a_up = np.exp(-1 / (attack * 1000)), np.exp(-1 / (release * 1000))
    for i in range(m):
        a = a_dn if target[i] < cur else a_up
        cur = a * cur + (1 - a) * target[i]
        g[i] = cur
    return np.interp(np.arange(n) / SR, np.arange(m) / 1000, g, right=1.0)


def tape_stop(b, t0, dur=0.35, silence_until=None):
    """Slow the bus to a halt over dur seconds from t0 (vinyl/tape stop), silent afterwards."""
    i0 = int(t0 * SR)
    n = int(dur * SR)
    if i0 + n >= len(b):
        n = len(b) - i0 - 1
    u = np.arange(n) / n
    speed = (1 - u) ** 1.6
    pos = i0 + np.cumsum(speed)
    src = b.copy()
    idx = np.arange(len(src))
    for c in range(2):
        b[i0 : i0 + n, c] = np.interp(pos, idx, src[:, c]) * (1 - u**3)
    end = int((silence_until if silence_until is not None else t0 + dur) * SR)
    b[i0 + n : max(i0 + n, end)] = 0
    return b


def limit(x, ceiling_db=-1.0, release=0.06, lookahead=0.003):
    """Brick-wall-ish peak limiter: lookahead peak hold, smoothed release, final clip."""
    c = 10 ** (ceiling_db / 20)
    peak = np.max(np.abs(x), axis=1)
    la = max(1, int(lookahead * SR))
    pk = maximum_filter1d(peak, size=2 * la + 1)
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    a = np.exp(-1 / (release * SR))
    gs = signal.lfilter([1 - a], [1, -a], g)
    g = np.minimum(g, gs)
    return np.clip(x * g[:, None], -c, c)


def loudness(path) -> dict:
    """Integrated loudness (LUFS) and true peak (dBTP) via ffmpeg ebur128."""
    log = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    import re as _re

    i = _re.findall(r"I:\s+(-?[\d.]+) LUFS", log)
    p = _re.findall(r"Peak:\s+(-?[\d.]+) dBFS", log)
    return {"I": float(i[-1]) if i else None, "TP": float(p[-1]) if p else None}


# ---------- v2 instruments ----------

def kick2(dur=0.42, f0=165, f1=47, click=0.35, drive=1.8, decay=7.5):
    """Punchy electronic kick: pitch-swept sine body + click, saturated so it reads on phone speakers."""
    t = t_(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 38)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay)
    clk = hp(noise(len(t)), 2500) * np.exp(-t * 420) * click
    x = np.tanh(drive * (body + clk)) / np.tanh(drive)
    return fade(x, 0.0005, 0.02)


def clap(dur=0.4, seed=5):
    r = np.random.default_rng(seed)
    t = t_(dur)
    x = np.zeros(len(t))
    for k, d in enumerate([0, 0.010, 0.021, 0.030]):
        i = int(d * SR)
        tt = t[: len(t) - i]
        x[i:] += r.standard_normal(len(tt)) * np.exp(-tt * (150 if k < 3 else 16)) * (0.75 if k < 3 else 1.0)
    x = bp(x, 900, 5200)
    return fade(x / (np.max(np.abs(x)) + 1e-9))


def hat(open_=False, dur=None):
    dur = dur or (0.32 if open_ else 0.07)
    t = t_(dur)
    metal = sum(np.sign(np.sin(2 * np.pi * f * 1.5 * t + i)) for i, f in enumerate([205.3, 304.4, 369.6, 522.7, 540.0, 800.0]))
    x = hp(metal, 7000, 4) * 0.45 + hp(noise(len(t)), 8000, 2) * 0.55
    x = x * np.exp(-t * (8 if open_ else 65))
    return fade(x / (np.max(np.abs(x)) + 1e-9), 0.0005, 0.01)


def sub_note(freq, dur, glide_from=None, drive=2.2):
    """Saturated sub bass note (harmonics keep it audible on phones). Optional glide into the pitch."""
    t = t_(dur)
    f = np.full(len(t), float(freq))
    if glide_from:
        f = freq + (glide_from - freq) * np.exp(-t * 22)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = np.tanh(drive * x) / np.tanh(drive)
    return x * adsr(len(t), 0.004, 0.08, 0.85, min(0.06, dur * 0.4))


def fm_pluck(freq, dur=0.45, index=2.6, ratio=2.0, decay=7.0, bright=16.0):
    t = t_(dur)
    i = index * np.exp(-t * bright)
    x = np.sin(2 * np.pi * freq * t + i * np.sin(2 * np.pi * freq * ratio * t)) * np.exp(-t * decay)
    return fade(x, 0.002, 0.03)


def fm_bell(freq, dur=2.2, index=3.2, ratio=3.5, decay=2.4):
    t = t_(dur)
    i = index * np.exp(-t * 3.5)
    x = np.sin(2 * np.pi * freq * t + i * np.sin(2 * np.pi * freq * ratio * t)) * np.exp(-t * decay)
    x += 0.35 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * decay * 1.8)
    return fade(x, 0.001, 0.1)


def supersaw(freqs, dur, voices=5, cents=14, cutoff=1800, seed=1):
    """Detuned saw chord, wide stereo, low-passed. The pad of modern electronic music."""
    r = np.random.default_rng(seed)
    t = t_(dur)
    L = np.zeros(len(t))
    R = np.zeros(len(t))
    for f in freqs:
        for v in range(voices):
            d = (v - (voices - 1) / 2) / ((voices - 1) / 2) * cents
            s = saw(f * 2 ** (d / 1200), t, r.random())
            p = v / (voices - 1)
            L += s * (1.0 - 0.7 * p)
            R += s * (0.3 + 0.7 * p)
    k = len(freqs) * voices
    return np.stack([lp(L, cutoff, 2), lp(R, cutoff, 2)], 1) / k


def reverse_swell(dur=1.2, bright=1.0, seed=8):
    """Reversed-cymbal style swell that peaks exactly at its end (place it so the end hits the downbeat)."""
    r = np.random.default_rng(seed)
    t = t_(dur)
    x = hp(r.standard_normal(len(t)), 2500 * bright) * np.exp(-(dur - t) * 4.5)
    x += 0.5 * bp(r.standard_normal(len(t)), 500, 3000) * np.exp(-(dur - t) * 6)
    return fade(norm(haas(x, 9), -2), 0.05, 0.004)


# ---------- v2 arrangement + mastering helpers (shared by reel sound scripts) ----------

def reel_timeline(slug: str) -> dict:
    """A reel's timeline constants (BEATS, CUES, SFX_CUES, DURATION_S, ...) via scripts/audio/cues.mjs."""
    import json

    out = subprocess.run(["node", str(ROOT / "scripts" / "audio" / "cues.mjs"), slug], capture_output=True, text=True, check=True, cwd=ROOT).stdout
    return json.loads(out)


GROOVE_KICK = {"half": [0, 10], "main": [0, 6, 8, 11], "drop": [0, 3, 6, 8, 10, 11, 14], "four": [0, 4, 8, 12]}
GROOVE_CLAP = {"half": [8], "main": [4, 12], "drop": [4, 12], "four": [4, 12]}


class Groove:
    """Stems for a 4/4 electronic groove, filled in blocks that start on picture cuts.

    g = Groove(duration, bpm=120)
    g.block(t0, t1, [(bass_midi, [pad_midis]), ...], lambda t: {"pad": 1, "cut": 1500, "kick": "main", ...})
    stems = g.stems()   # drums, bass, pad, arp, fx (pump and reverb applied)
    Parts: pad (+cut Hz), kick/clap pattern names, hats 8|16, open, bass (+bass_pat 16th steps), arp 8|16.
    """

    def __init__(self, duration: float, bpm: float = 120):
        self.duration = duration
        self.n = int(duration * SR)
        self.beat = 60 / bpm
        self.bar = 4 * self.beat
        self.s16 = self.beat / 4
        self.drums, self.bass, self.pad, self.arp, self.fx = (bus(duration) for _ in range(5))
        self.kicks: list[float] = []
        self.K, self.CL, self.HT, self.OH = kick2(click=0.55), clap(), hat(), hat(True)

    def block(self, t0, t1, prog, part_at, seed=0):
        bar = 0
        while t0 + bar * self.bar < t1:
            tb = t0 + bar * self.bar
            bass_m, pad_ms = prog[bar % len(prog)]
            p = part_at(tb)
            if p.get("pad"):
                d = min(self.bar, t1 - tb) + 0.25
                env = adsr(int(d * SR), 0.05, 0.2, 0.85, 0.25)[:, None]
                place(self.pad, supersaw([m2f(m) for m in pad_ms], d, cutoff=p.get("cut", 1800), seed=bar + seed) * env, tb)
            for s in range(16):
                ts = tb + s * self.s16
                if ts >= t1:
                    break
                q = part_at(ts)
                if s in GROOVE_KICK.get(q.get("kick", ""), []):
                    place(self.drums, self.K, ts, 0.9)
                    self.kicks.append(ts)
                if s in GROOVE_CLAP.get(q.get("clap", ""), []):
                    place(self.drums, self.CL, ts, 1.0)
                hd = q.get("hats", 0)
                if hd and (hd == 16 or s % 2 == 0):
                    place(self.drums, self.HT, ts + 0.006 * (s % 2), 0.42 * [1.0, 0.35, 0.6, 0.35][s % 4], pan=0.25)
                if q.get("open") and s in (6, 14):
                    place(self.drums, self.OH, ts, 0.22, pan=-0.2)
                if q.get("bass") and s in (q.get("bass_pat") or [0, 3, 6, 8, 11, 14]):
                    glide = m2f(bass_m + 12) if (s == 0 and bar % 2 == 1) else None
                    place(self.bass, sub_note(m2f(bass_m), self.s16 * 2.6, glide_from=glide, drive=3.5) * 0.42, ts)
                if q.get("arp") and (q["arp"] == 16 or s % 2 == 0):
                    notes = [m + 12 for m in pad_ms]
                    order = [0, 2, 1, 3, 2, 1, 3, 2]
                    m = notes[order[(s // (1 if q["arp"] == 16 else 2)) % 8]]
                    place(self.arp, fm_pluck(m2f(m), 0.4, 2.2, 2.0, 8, 18) * 0.16, ts, pan=0.35 * (-1) ** s)
            bar += 1

    def stems(self) -> dict:
        pump = duck(self.n, self.kicks, depth=0.5, release=0.16)[:, None]
        return {
            "drums": self.drums + reverb(self.drums * 0.25, 1.2, 1.0, tail=False) * 0.25,
            "bass": self.bass * duck(self.n, self.kicks, depth=0.35, release=0.1)[:, None],
            "pad": self.pad * pump,
            "arp": reverb(self.arp, 1.6, 0.35, tail=False),
            "fx": self.fx,
        }


# faders and voice-ducking depths that balance a Groove for phone speakers under a voiceover
GROOVE_MIXER = {"drums": 1.0, "bass": 1.0, "pad": 3.0, "arp": 2.5, "fx": 0.9}
GROOVE_VO_DUCK_DB = {"drums": -8, "bass": -6, "pad": -13, "arp": -22, "fx": -10}


def mix_stems(stems: dict, vo=None, mixer=GROOVE_MIXER, vo_duck_db=GROOVE_VO_DUCK_DB) -> np.ndarray:
    n = len(next(iter(stems.values())))
    mix = np.zeros((n, 2))
    for k, fader in mixer.items():
        x = stems[k] * fader
        if vo is not None:
            x = x * vo_duck(n, vo, depth_db=vo_duck_db[k], attack=0.05, release=0.35)[:, None]
        mix += x
    return hp(mix, 30, 2)


def master_reel(out_dir, tl: dict, target_lufs=-14.0, sfx_vo_duck_db=-6.0):
    """voice + music.mp3 x MUSIC_VOLUME + every SFX cue -> mix.mp3, limited and normalised."""
    duration = tl["DURATION_S"]
    n = int(duration * SR)
    vo = bus(duration)
    has_vo = tl["USE_VO"] and (out_dir / "vo.mp3").exists()
    if has_vo:
        place(vo, load_audio(out_dir / "vo.mp3"), 0)
    music = bus(duration)
    place(music, load_audio(out_dir / "music.mp3") * tl["MUSIC_VOLUME"], 0)
    fx = bus(duration)
    for c in tl["SFX_CUES"]:
        x = load_audio(out_dir / "sfx" / f"{c['file']}.mp3")
        if "end" in c:
            x = fade(x[: int((c["end"] - c["t"]) * SR)], 0.001, 0.01)
        place(fx, x * c["volume"], round(c["t"] * 30) / 30)
    if has_vo:
        fx = fx * vo_duck(n, vo, depth_db=sfx_vo_duck_db, attack=0.03, release=0.25)[:, None]
    mix = vo + music + fx
    tmp = out_dir / "_mix-pre.wav"
    mastered = limit(mix, -1.5, release=0.08)
    for _ in range(3):
        mastered = limit(mix, -1.5, release=0.08)
        save(mastered, tmp)
        lu = loudness(tmp)["I"]
        if lu is None or abs(lu - target_lufs) < 0.3:
            break
        mix = mix * 10 ** ((target_lufs - lu) / 20)
    tmp.unlink(missing_ok=True)
    save(mastered, out_dir / "mix.mp3")
    lv = loudness(out_dir / "mix.mp3")
    print(f"mix: {lv['I']} LUFS, true peak {lv['TP']} dBTP")
