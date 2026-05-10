"""
Compares today's snapshot to the most recent prior snapshot.
Outputs data/diffs/YYYY-MM-DD.json with added/removed jobs.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parent
SNAPSHOT_DIR = ROOT / "data" / "snapshots"
DIFF_DIR = ROOT / "data" / "diffs"
DIFF_DIR.mkdir(parents=True, exist_ok=True)


def job_key(job):
    return f"{job['company']}::{job['url']}"


def load_snapshots():
    files = sorted(SNAPSHOT_DIR.glob("*.json"))
    if not files:
        raise SystemExit("No snapshots found. Run scrape.py first.")
    return files


def main():
    files = load_snapshots()
    today_file = files[-1]
    prev_file = files[-2] if len(files) > 1 else None

    today = json.loads(today_file.read_text(encoding="utf-8"))
    prev = json.loads(prev_file.read_text(encoding="utf-8")) if prev_file else {"jobs": []}

    today_map = {job_key(j): j for j in today["jobs"]}
    prev_map = {job_key(j): j for j in prev["jobs"]}

    added = [j for k, j in today_map.items() if k not in prev_map]
    removed = [j for k, j in prev_map.items() if k not in today_map]

    diff = {
        "date": today["date"],
        "compared_to": prev["date"] if prev_file else None,
        "added_count": len(added),
        "removed_count": len(removed),
        "added": added,
        "removed": removed,
    }
    out = DIFF_DIR / f"{today['date']}.json"
    out.write_text(json.dumps(diff, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Diff: +{len(added)} new, -{len(removed)} removed -> {out}", flush=True)


if __name__ == "__main__":
    main()
