"""Synthesises every sound in the reel from code (no samples, no downloads).

Writes public/sfx/{whirr,stamp,riser,scratch,whoosh,bass,swell}.mp3 and public/music.mp3.
Run: python3 scripts/make_audio.py
"""
import os
import subprocess
import tempfile
import wave

import numpy as np
from scipy import signal

SR = 44100
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "reels", "model-collapse")


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def noise(n):
    return rng.standard_normal(n)


def lp(x, f, order=4):
    sos = signal.butter(order, min(f, SR / 2 - 100), "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def hp(x, f, order=2):
    sos = signal.butter(order, f, "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def sweep_lp(x, f0, f1, curve=1.0):
    """Time-varying one-pole low-pass with cutoff moving from f0 to f1."""
    n = len(x)
    fc = f0 + (f1 - f0) * (np.linspace(0, 1, n) ** curve)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros(n)
    s = 0.0
    for i in range(n):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def saw(freq, t, phase=0.0):
    return 2 * ((freq * t + phase) % 1.0) - 1


def env_adsr(n, a, d, s, r):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n)
    e[:na] = np.linspace(0, 1, na)
    if na + nd < n:
        e[na : na + nd] = np.linspace(1, s, nd)
    if nr > 0:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def stereo(l, r=None):
    if r is None:
        r = l
    return np.stack([l, r], axis=1)


def norm(x, peak_db=-1.0):
    p = np.max(np.abs(x)) + 1e-9
    return x * (10 ** (peak_db / 20) / p)


def fade(x, fin=0.005, fout=0.02):
    n = len(x)
    a, b = int(fin * SR), int(fout * SR)
    w = np.ones(n)
    if a:
        w[:a] = np.linspace(0, 1, a)
    if b:
        w[-b:] = np.linspace(1, 0, b)
    return x * (w[:, None] if x.ndim == 2 else w)


def write_mp3(x, path):
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = stereo(x)
    pcm = (x * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp = f.name
    with wave.open(tmp, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-codec:a", "libmp3lame", "-b:a", "192k", path], check=True)
    os.remove(tmp)
    print("wrote", os.path.relpath(path))


# ---------------- SFX ----------------

def whirr(dur=1.7):
    t = t_(dur)
    hum = 0.5 * np.sin(2 * np.pi * 98 * t) + 0.25 * np.sin(2 * np.pi * 196 * t) + 0.12 * saw(49, t)
    hum = lp(hum, 900)
    motor = bp(noise(len(t)), 300, 2400) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * t))
    scan = sweep_lp(noise(len(t)), 600, 5200, 0.8) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    x = 0.55 * hum + 0.35 * motor + 0.45 * scan
    e = env_adsr(len(t), 0.08, 0.2, 0.85, 0.35)
    l = x * e
    r = np.roll(x, 90) * e
    return fade(norm(stereo(l, r), -2))


def stamp():
    t = t_(0.45)
    f = 120 * np.exp(-t * 22) + 48
    ph = 2 * np.pi * np.cumsum(f) / SR
    thump = np.sin(ph) * np.exp(-t * 16)
    click = bp(noise(len(t)), 1800, 6500) * np.exp(-t * 90)
    paper = bp(noise(len(t)), 3000, 9000) * np.exp(-t * 30) * 0.25
    x = 0.9 * thump + 0.55 * click + paper
    return fade(norm(stereo(x), -1.5))


def riser(dur=9.0):
    t = t_(dur)
    p = t / dur
    nz = sweep_lp(noise(len(t)), 250, 7000, 2.2)
    nz = hp(nz, 120)
    f = 70 * (2 ** (p * 2.6))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    trem = 0.75 + 0.25 * np.sin(2 * np.pi * (2 + 14 * p ** 2) * t)
    x = (0.65 * nz + 0.35 * tone) * (p ** 1.8) * trem
    l = x
    r = np.roll(x, 140)
    return fade(norm(stereo(l, r), -1), 0.05, 0.004)


def scratch():
    t = t_(0.55)
    # wobbling playback speed gives the vinyl-scratch shape
    speed = np.sin(2 * np.pi * 7.5 * t) * np.exp(-t * 2)
    pos = np.cumsum(speed) / SR
    src = bp(noise(SR), 400, 3500)
    idx = (np.abs(pos) * SR * 6).astype(int) % len(src)
    x = src[idx] * (0.4 + 0.6 * np.abs(speed))
    tone = np.sin(2 * np.pi * np.cumsum(500 + 380 * speed) / SR) * 0.35
    x = (x + tone) * env_adsr(len(t), 0.005, 0.1, 0.8, 0.12)
    return fade(norm(stereo(x), -1.5))


def whoosh(dur=0.75):
    t = t_(dur)
    p = t / dur
    nz = noise(len(t))
    lo = sweep_lp(nz, 6000, 500, 0.7)
    x = hp(lo, 200) * np.sin(np.pi * p) ** 1.6
    pan = 0.5 + 0.5 * np.sin(np.pi * (p - 0.5))
    return fade(norm(stereo(x * (1.2 - pan), x * (0.2 + pan)), -2))


def bass(dur=2.6):
    t = t_(dur)
    f = 62 * np.exp(-t * 1.1) + 30
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR)
    sub = np.tanh(2.2 * sub) * np.exp(-t * 1.6)
    hit = lp(noise(len(t)), 900) * np.exp(-t * 14) * 0.6
    x = sub + hit
    return fade(norm(stereo(x), -1))


def swell(dur=3.8):
    t = t_(dur)
    notes = [130.81, 196.0, 261.63, 329.63, 392.0, 587.33]  # C major add9
    l = np.zeros(len(t))
    r = np.zeros(len(t))
    for i, n in enumerate(notes):
        l += saw(n * 1.003, t, 0.1 * i)
        r += saw(n * 0.997, t, 0.37 * i)
    l = sweep_lp(l, 400, 3200, 0.8)
    r = sweep_lp(r, 400, 3200, 0.8)
    shimmer = sweep_lp(noise(len(t)), 2000, 9000, 1.5) * 0.15
    e = env_adsr(len(t), 1.3, 0.8, 0.75, 1.4)
    return fade(norm(stereo((l + shimmer) * e, (r + shimmer) * e), -2))


# ---------------- Music bed ----------------

def chord_pad(freqs, dur, cutoff=1100, detune=0.004):
    t = t_(dur)
    l = np.zeros(len(t))
    r = np.zeros(len(t))
    for i, f in enumerate(freqs):
        l += saw(f * (1 + detune), t, 0.13 * i) + 0.5 * saw(f * (1 - detune), t, 0.31 * i)
        r += saw(f * (1 - detune), t, 0.23 * i) + 0.5 * saw(f * (1 + detune), t, 0.41 * i)
    l, r = lp(l, cutoff), lp(r, cutoff)
    e = env_adsr(len(t), 0.6, 0.4, 0.8, 0.6)
    return l * e / len(freqs), r * e / len(freqs)


def music(dur=54.0, twist=39.0):
    n = int(dur * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    bar = 2.4  # 100 bpm, 4/4
    dark = [
        [110.0, 164.81, 220.0, 261.63],  # Am
        [87.31, 130.81, 174.61, 220.0],  # F
        [98.0, 146.83, 196.0, 246.94],  # G
        [82.41, 123.47, 164.81, 207.65],  # E
    ]
    bright = [
        [130.81, 196.0, 261.63, 329.63],  # C
        [98.0, 146.83, 196.0, 293.66],  # G
        [110.0, 164.81, 220.0, 261.63],  # Am
        [87.31, 130.81, 174.61, 220.0],  # F
    ]
    k = 0
    start = 0.0
    while start < dur:
        prog = bright if start >= twist - 0.01 else dark
        ch = prog[k % 4]
        seg = min(bar * 2 if start < twist else bar, dur - start)
        if start < twist and start + seg > twist:
            seg = twist - start
        cutoff = 1500 if start >= twist else 950
        l, r = chord_pad(ch, seg + 0.6, cutoff)
        i0 = int(start * SR)
        i1 = min(n, i0 + len(l))
        L[i0:i1] += l[: i1 - i0]
        R[i0:i1] += r[: i1 - i0]
        start += seg
        k += 1

    t = np.arange(n) / SR
    # sub drone with slow breathing
    drone_f = np.where(t < twist, 55.0, 65.41)
    drone = np.sin(2 * np.pi * np.cumsum(drone_f) / SR) * (0.55 + 0.15 * np.sin(2 * np.pi * 0.1 * t))
    L += 0.35 * drone
    R += 0.35 * drone

    # ticking clock: soft 8th-note clicks, accented on the beat
    tick_len = int(0.03 * SR)
    tick = bp(noise(tick_len), 3000, 9000) * np.exp(-np.arange(tick_len) / SR * 160)
    step = 0.3
    j = 0
    while j * step < dur:
        i0 = int(j * step * SR)
        amp = 0.16 if j % 2 == 0 else 0.07
        i1 = min(n, i0 + tick_len)
        side = 0.7 if j % 4 in (1, 2) else 1.0
        L[i0:i1] += amp * tick[: i1 - i0] * side
        R[i0:i1] += amp * tick[: i1 - i0] * (1.7 - side)
        j += 1

    # gentle arpeggio after the twist
    arp_notes = [523.25, 659.25, 783.99, 659.25]
    j = 0
    while twist + j * 0.3 < dur - 0.5:
        st = twist + 1.0 + j * 0.3
        if st >= dur - 0.5:
            break
        tt = t_(0.5)
        f = arp_notes[j % 4]
        note = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 7) * 0.12
        i0 = int(st * SR)
        i1 = min(n, i0 + len(note))
        L[i0:i1] += note[: i1 - i0] * (1.2 if j % 2 else 0.8)
        R[i0:i1] += note[: i1 - i0] * (0.8 if j % 2 else 1.2)
        j += 1

    x = stereo(L, R)
    return fade(norm(x, -3), 0.5, 1.5)


if __name__ == "__main__":
    sfx = os.path.join(OUT, "sfx")
    write_mp3(whirr(), os.path.join(sfx, "whirr.mp3"))
    write_mp3(stamp(), os.path.join(sfx, "stamp.mp3"))
    write_mp3(riser(), os.path.join(sfx, "riser.mp3"))
    write_mp3(scratch(), os.path.join(sfx, "scratch.mp3"))
    write_mp3(whoosh(), os.path.join(sfx, "whoosh.mp3"))
    write_mp3(bass(), os.path.join(sfx, "bass.mp3"))
    write_mp3(swell(), os.path.join(sfx, "swell.mp3"))
    write_mp3(music(), os.path.join(OUT, "music.mp3"))
