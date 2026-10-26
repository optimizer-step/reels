"""Startup benchmark for reel 004: the same CLI with normal vs lazy imports (Python 3.15+).

    pip install pandas matplotlib requests
    python bench.py            # uses the current interpreter

Runs `report --help` 61 times per version, alternating the two so machine noise hits both
equally (median, first run dropped), counts the modules loaded with -X importtime, and reads
peak memory (max RSS) of one run.
"""
import resource
import statistics
import subprocess
import sys
import time

PY = sys.executable


def timed(scripts, n=61):
    ts = {s: [] for s in scripts}
    for _ in range(n):
        for s in scripts:
            t = time.perf_counter()
            subprocess.run([PY, s, "--help"], stdout=subprocess.DEVNULL, check=True)
            ts[s].append(time.perf_counter() - t)
    return {s: statistics.median(v[1:]) for s, v in ts.items()}


def modules(script):
    err = subprocess.run([PY, "-X", "importtime", script, "--help"], capture_output=True, text=True).stderr
    return sum(1 for line in err.splitlines() if line.startswith("import time:") and "self [us]" not in line)


def peak_mb(script):
    code = "import subprocess,resource,sys; subprocess.run([sys.argv[1], sys.argv[2], '--help'], stdout=subprocess.DEVNULL); print(resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss)"
    return int(subprocess.run([PY, "-c", code, PY, script], capture_output=True, text=True).stdout) / 1024


if __name__ == "__main__":
    print(sys.version.split()[0])
    scripts = ("eager_app.py", "lazy_app.py")
    med = timed(scripts)
    for s in scripts:
        print(f"{s:14s} {med[s] * 1000:7.1f} ms   {modules(s):4d} modules   {peak_mb(s):6.1f} MB")
    print(f"speed-up: {med[scripts[0]] / med[scripts[1]]:.1f}x")
