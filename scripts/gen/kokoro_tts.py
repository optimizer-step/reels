"""Offline voiceover with Kokoro-82M (Apache-2.0): a scratch or final English VO with no API key.

    pip install --break-system-packages kokoro-onnx soundfile pocketsphinx
    python3 scripts/gen/kokoro_tts.py <slug> [--voice af_heart] [--speed 1.05] [--force]

Reads src/reels/<slug>/vo.json (text, optional per-line `say` for pronunciation, `hold`), writes
public/reels/<slug>/vo/line-NN.mp3 + .json with word timings from forced alignment (align.py), then
places the lines on the reel's beats with vo-assemble.mjs (vo.mp3, vo-lines.json, words.json).
Model files (~350 MB) download once from the kokoro-onnx GitHub release into .cache/kokoro.
The HeyGen voice (scripts/gen/heygen.mjs tts) replaces this whenever it is run.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).parent))
from align import align_words  # noqa: E402

CACHE = ROOT / ".cache" / "kokoro"
RELEASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
FILES = ["kokoro-v1.0.onnx", "voices-v1.0.bin"]

# broadcast-style chain: rumble cut, a little warmth and presence, gentle de-ess, level the dynamics
VOICE_CHAIN = ",".join(
    [
        "highpass=f=75",
        "equalizer=f=180:t=q:w=1.1:g=1.5",
        "equalizer=f=3800:t=q:w=1.4:g=2.5",
        "equalizer=f=7200:t=q:w=2:g=-2",
        "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2",
        "aresample=48000",
    ]
)


def ensure_models() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    for f in FILES:
        p = CACHE / f
        if not p.exists():
            print(f"downloading {f} ...")
            subprocess.run(["curl", "-sSL", "--fail", "-o", str(p), f"{RELEASE}/{f}"], check=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--voice", default=None)
    ap.add_argument("--speed", type=float, default=None)
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()

    src = ROOT / "src" / "reels" / a.slug
    pub = ROOT / "public" / "reels" / a.slug
    vo = json.loads((src / "vo.json").read_text())
    voice = a.voice or vo.get("kokoro_voice", "af_heart")
    speed = a.speed or vo.get("kokoro_speed", vo.get("speed", 1.0))

    ensure_models()
    import soundfile as sf
    from kokoro_onnx import Kokoro

    tts = Kokoro(str(CACHE / FILES[0]), str(CACHE / FILES[1]))
    out_dir = pub / "vo"
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, line in enumerate(vo["lines"], start=1):
        wav = out_dir / f"line-{i:02d}.mp3"
        meta = out_dir / f"line-{i:02d}.json"
        sig = {"tool": "kokoro", "voice": voice, "speed": speed, "text": line["text"], "say": line.get("say")}
        if wav.exists() and meta.exists() and not a.force and json.loads(meta.read_text()).get("sig") == sig:
            print(f"= line {i}: exists")
            continue
        say = line.get("say", line["text"])
        print(f"> line {i}: {say}")
        audio, sr = tts.create(say, voice=voice, speed=line.get("speed", speed), lang="en-us")
        raw = out_dir / f"line-{i:02d}.raw.wav"
        sf.write(raw, audio, sr)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", VOICE_CHAIN, "-b:a", "192k", str(wav)], check=True)
        raw.unlink()
        words = align_words(str(wav), say)
        if not words:
            print(f"  (alignment failed for line {i}; words will be estimated)")
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
        meta.write_text(json.dumps({"file": wav.name, "text": say, "duration": round(dur, 3), "words": words, "sig": sig}, indent=1))

    subprocess.run(["node", str(ROOT / "scripts" / "gen" / "vo-assemble.mjs"), a.slug, "--lines"], check=True)
    # same manifest format as scripts/gen/lib.mjs recordManifest; one VO entry at a time
    from datetime import datetime, timezone

    manifest = pub / "generated.json"
    entries = json.loads(manifest.read_text()) if manifest.exists() else []
    entries = [e for e in entries if e.get("name") != "vo"]
    entries.append({"tool": "kokoro-tts", "name": "vo", "voice": voice, "speed": speed, "lines": len(vo["lines"]), "generated_at": datetime.now(timezone.utc).isoformat()})
    manifest.write_text(json.dumps(entries, indent=2) + "\n")


if __name__ == "__main__":
    main()
