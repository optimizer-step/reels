"""Sounds for reel 002 (attention-bank). Run: python3 scripts/audio/attention_bank.py"""
from sfxlib import DMINOR, FMAJOR, beam, flight, glitch, impact, music_bed, pop, reel_dir, riser, save, sub_drop, swell, typing, whoosh

out = reel_dir("attention-bank")
sfx = out / "sfx"
save(glitch(0.35, seed=2), sfx / "glitch.mp3")
save(pop(880), sfx / "pop.mp3")
save(pop(1175), sfx / "pop2.mp3")
save(flight(1.7), sfx / "flight.mp3")
save(whoosh(0.8), sfx / "whoosh.mp3")
save(typing(6, rate=14, seed=1), sfx / "ticks.mp3")
save(glitch(0.7, seed=9), sfx / "decode.mp3")
save(beam(1.1), sfx / "beam.mp3")
save(riser(1.6), sfx / "riser.mp3")
save(impact(), sfx / "impact.mp3")
save(sub_drop(), sfx / "subdrop.mp3")
save(typing(22, rate=15, seed=7), sfx / "cells.mp3")
save(typing(12, rate=20, seed=3), sfx / "typing.mp3")
save(typing(31, rate=31, seed=5), sfx / "typing2.mp3")
save(swell(3.0), sfx / "swell.mp3")
save(music_bed(47.5, bpm=110, sections=[(0, DMINOR), (38.3, FMAJOR)]), out / "music.mp3")
