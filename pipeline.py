"""
Orchestrates the daily run: scrape -> diff -> classify.
notify.py runs separately (Mondays only) from the GitHub Actions workflow.
"""
import asyncio
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent


def run(cmd):
    print(f"\n>>> {' '.join(cmd)}", flush=True)
    r = subprocess.run(cmd, cwd=ROOT)
    if r.returncode != 0:
        sys.exit(r.returncode)


def main():
    run([sys.executable, "scrape.py"])
    run([sys.executable, "diff.py"])
    run([sys.executable, "classify.py"])


if __name__ == "__main__":
    main()
