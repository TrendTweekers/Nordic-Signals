"""
Drops jobs whose location is clearly non-Nordic. Runs after aggregators.py
in the pipeline, before diff/classify. Saves ~40% of classify cost and
keeps the digest geographically clean.

Strategy:
- explicit Nordic city/country match -> keep
- explicit non-Nordic city match -> drop
- missing/ambiguous location -> keep only if company.country is Nordic
"""
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parent
SNAPSHOT_DIR = ROOT / "data" / "snapshots"

NORDIC = re.compile(
    r"\b(sweden|sverige|stockholm|gothenburg|g[öo]teborg|malm[öo]|uppsala|lund|"
    r"link[öo]ping|ume[åa]|j[öo]nk[öo]ping|v[äa]ster[åa]s|"
    r"norway|norge|oslo|bergen|trondheim|stavanger|troms[øo]|"
    r"denmark|danmark|copenhagen|k[øo]benhavn|aarhus|odense|aalborg|"
    r"finland|suomi|helsinki|helsingfors|espoo|tampere|vantaa|oulu|turku|jyv[äa]skyl[äa]|"
    r"estonia|eesti|tallinn|tartu|p[äa]rnu|"
    r"nordic|nordics|scandinavi)\b",
    re.IGNORECASE,
)

NON_NORDIC = re.compile(
    r"\b(baku|berlin|m[üu]nchen|munich|paris|madrid|barcelona|amsterdam|rotterdam|"
    r"dublin|london|manchester|edinburgh|glasgow|leeds|bristol|"
    r"new york|nyc|san francisco|sf bay|seattle|austin|boston|los angeles|chicago|"
    r"san diego|"
    r"tokyo|osaka|seoul|singapore|hong kong|shanghai|beijing|shenzhen|taipei|"
    r"sydney|melbourne|toronto|vancouver|"
    r"dubai|abu dhabi|riyadh|tel aviv|jerusalem|istanbul|"
    r"bangalore|bengaluru|mumbai|delhi|hyderabad|chennai|"
    r"warsaw|warszawa|krak[óo]w|gdansk|prague|vienna|zurich|geneva|"
    r"milan|rome|lisbon|porto|athens|"
    r"mexico city|sao paulo|buenos aires|"
    r"cairo|lagos|nairobi|cape town|johannesburg)\b",
    re.IGNORECASE,
)

# Title-level signal that the role is global ops, not Nordic-specific.
# These keywords mean "country-X manager / regional-X / EMEA-wide" — almost
# never the kind of Nordic-only signal a VC/recruiter wants.
GLOBAL_OPS_TITLE = re.compile(
    r"\b(country|regional|emea|apac|nam|latam|"
    r"global|international|worldwide|"
    r"asia[- ]pacific|north america|south america|"
    r"middle east|africa|"
    r"benelux|dach|iberia)\b",
    re.IGNORECASE,
)


def is_nordic(job: dict) -> bool:
    loc = (job.get("location") or "").strip()
    title = (job.get("title") or "").strip()
    country = (job.get("country") or "").strip().upper()
    nordic_country = country in {"SE", "NO", "DK", "FI", "EE"}

    # 1. Non-Nordic city baked into title (e.g. "Director, EMEA — Hybrid London")
    if NON_NORDIC.search(title):
        return False

    # 2. Title is a clear global-ops role. These are pollutants even from
    # Nordic-HQ companies (Wolt, Spotify, Pipedrive operate in 30+ countries).
    # Allow only if the location field is an explicit Nordic city.
    if GLOBAL_OPS_TITLE.search(title):
        return bool(loc) and bool(NORDIC.search(loc))

    # 3. Now apply the location rules
    if not loc:
        # No location — trust company-country tag
        return nordic_country
    if NON_NORDIC.search(loc):
        return False
    if NORDIC.search(loc):
        return True
    # Ambiguous location with no exclusion match -> trust company-country tag
    return nordic_country


def main():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    snap_path = SNAPSHOT_DIR / f"{today}.json"
    if not snap_path.exists():
        raise SystemExit(f"No snapshot at {snap_path}")
    snap = json.loads(snap_path.read_text(encoding="utf-8"))
    before = len(snap["jobs"])
    kept = [j for j in snap["jobs"] if is_nordic(j)]
    dropped = before - len(kept)
    snap["jobs"] = kept
    snap["total_jobs"] = len(kept)
    snap["nordic_filter_applied_at"] = datetime.now(timezone.utc).isoformat()
    snap_path.write_text(json.dumps(snap, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Nordic filter: kept {len(kept)} / {before} (dropped {dropped} non-Nordic)", flush=True)


if __name__ == "__main__":
    main()
