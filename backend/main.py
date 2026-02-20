import os
import re
import sys
import json
import sqlite3
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional, Any, Literal
from pathlib import Path
from collections import Counter
import httpx
from fastapi import FastAPI, HTTPException, Request, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

from slowapi import Limiter, _rate_limit_exceeded_handler  # noqa: E402
from slowapi.util import get_remote_address  # noqa: E402
from slowapi.errors import RateLimitExceeded  # noqa: E402
from config import settings  # noqa: E402

# ── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(title="InteliJob API", version="1.0.0")

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.rate_limit_default],
    strategy=settings.rate_limit_strategy,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
    BASE_DIR = Path(sys._MEIPASS)
else:
    BASE_DIR = Path(__file__).parent.parent

FRONTEND_DIST = BASE_DIR / "dist"


# ── Pydantic Models ──────────────────────────────────────────────────────────
class JobSearchRequest(BaseModel):
    job_title: str
    location: Optional[str] = None
    time_range: Literal["1d", "3d", "7d", "14d", "30d"] = "1d"
    target_path: Optional[str] = None
    owned_certs: List[str] = Field(default_factory=list)


class JobAnalysisResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    jobs_analyzed: int = 0


# ── Config ───────────────────────────────────────────────────────────────────
JSEARCH_API_URL = settings.jsearch_api_url
RAPIDAPI_KEY = settings.rapidapi_key


def _require_admin_access(x_admin_key: Optional[str]) -> None:
    """Require ADMIN_API_KEY for sensitive endpoints."""
    expected = settings.admin_api_key
    if not expected:
        raise HTTPException(
            status_code=503,
            detail="Admin endpoints disabled: ADMIN_API_KEY not configured.",
        )
    if x_admin_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ── Role Families (multi-query expansion) ────────────────────────────────────
# When a user searches one title, we also query related titles to get broader coverage.
ROLE_FAMILIES: Dict[str, List[str]] = {
    "Cybersecurity Analyst": [
        "Cybersecurity Analyst",
        "Security Analyst",
        "Information Security Analyst",
        "Cyber Security Analyst",
    ],
    "Security Engineer": [
        "Security Engineer",
        "Cybersecurity Engineer",
        "Information Security Engineer",
    ],
    "SOC Analyst": [
        "SOC Analyst",
        "Security Operations Center Analyst",
        "Security Operations Analyst",
    ],
    "Penetration Tester": [
        "Penetration Tester",
        "Junior Penetration Tester",
        "Jr Penetration Tester",
        "Ethical Hacker",
        "Offensive Security",
    ],
    "Cloud Security Engineer": [
        "Cloud Security Engineer",
        "Cloud Security Architect",
        "Cloud Security",
        "Cloud Security Analyst",
    ],
    "GRC Analyst": [
        "GRC Analyst",
        "Governance Risk Compliance",
        "IT Risk Analyst",
        "IT Compliance Analyst",
    ],
    "Security Architect": [
        "Security Architect",
        "Cybersecurity Architect",
        "Information Security Architect",
    ],
    "Threat Analyst": [
        "Threat Analyst",
        "Threat Intelligence Analyst",
        "Cyber Threat Analyst",
    ],
}


def get_search_queries(job_title: str) -> List[str]:
    """Get expanded search queries for a given job title."""
    # Check if it matches a known role family (case-insensitive)
    title_lower = job_title.lower().strip()
    for family_key, queries in ROLE_FAMILIES.items():
        if title_lower == family_key.lower():
            return queries
    # Unknown title: just search as-is
    return [job_title]


TIME_RANGE_TO_DAYS: Dict[str, int] = {
    "1d": 1,
    "3d": 3,
    "7d": 7,
    "14d": 14,
    "30d": 30,
}


def _parse_posted_datetime(job: Dict[str, Any]) -> Optional[datetime]:
    """Parse a best-effort UTC datetime from job payload fields."""
    ts_value = job.get("job_posted_at_timestamp")
    if ts_value is not None:
        try:
            timestamp = float(ts_value)
            # Some providers return milliseconds; normalize to seconds.
            if abs(timestamp) > 1e11:
                timestamp = timestamp / 1000.0
            return datetime.fromtimestamp(timestamp, tz=timezone.utc)
        except (TypeError, ValueError, OSError):
            pass

    for key in ("job_posted_at_datetime_utc", "job_posted_at_datetime"):
        raw = job.get(key)
        if not raw:
            continue
        try:
            iso = str(raw).replace("Z", "+00:00")
            parsed = datetime.fromisoformat(iso)
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            continue

    return None


def _dedup_job_key(job: Dict[str, Any]) -> str:
    """Build a stable dedup key without collapsing distinct postings."""
    job_id = job.get("job_id")
    if job_id:
        return str(job_id)

    url = job.get("job_apply_link") or job.get("job_url")
    if url:
        return f"url:{url}"

    employer = job.get("employer_name") or job.get("company_name") or ""
    title = job.get("job_title") or ""
    city = job.get("job_city") or ""
    state = job.get("job_state") or ""
    posted = (
        job.get("job_posted_at_datetime_utc")
        or job.get("job_posted_at_datetime")
        or job.get("job_posted_at_timestamp")
        or ""
    )
    return f"meta:{employer}|{title}|{city}|{state}|{posted}"


def filter_jobs_by_time_range(
    jobs: List[Dict], time_range: Optional[str]
) -> List[Dict]:
    """Apply exact local time-range filtering for ranges not natively supported by JSearch."""
    if time_range not in TIME_RANGE_TO_DAYS:
        return jobs

    cutoff = datetime.now(timezone.utc) - timedelta(days=TIME_RANGE_TO_DAYS[time_range])
    filtered = []
    for job in jobs:
        posted_at = _parse_posted_datetime(job)
        # Keep unknown timestamps rather than incorrectly dropping potentially valid jobs.
        if posted_at is None or posted_at >= cutoff:
            filtered.append(job)
    return filtered


# ── Cert Dictionary ──────────────────────────────────────────────────────────
CERT_DICT_PATH = Path(__file__).parent / "certs.json"
CERT_DICTIONARY: Dict[str, Dict] = {}

try:
    with open(CERT_DICT_PATH, "r", encoding="utf-8") as f:
        CERT_DICTIONARY = json.load(f)
    print(f"Loaded {len(CERT_DICTIONARY)} certifications")
except (FileNotFoundError, json.JSONDecodeError) as e:
    print(f"Warning: certs.json issue: {e}")

# Build lookup: (search_term_lower, canonical_abbrev, info_dict)
_cert_lookup: List[tuple] = []
for abbrev, info in CERT_DICTIONARY.items():
    _cert_lookup.append((abbrev.lower(), abbrev, info))
    full = info.get("full_name", "")
    if full and full.lower() != abbrev.lower():
        _cert_lookup.append((full.lower(), abbrev, info))


# ── SQLite Persistence ───────────────────────────────────────────────────────
# In a PyInstaller standalone bundle, we cannot store the DB in the installation folder or _MEIPASS
# as it would be wiped out or unwriteable. We use a dedicated folder in the user's home directory.
DATA_DIR = Path.home() / ".intelijob" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "scans.db"


def _get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            job_title TEXT NOT NULL,
            location TEXT,
            time_range TEXT,
            total_jobs INTEGER,
            jobs_with_descriptions INTEGER,
            cert_data TEXT NOT NULL
        )
    """)
    conn.commit()
    return conn


def save_scan(
    job_title: str,
    location: Optional[str],
    time_range: str,
    total_jobs: int,
    jobs_with_desc: int,
    cert_items: List[Dict],
):
    """Save a scan result to SQLite."""
    conn = _get_db()
    try:
        conn.execute(
            "INSERT INTO scans (timestamp, job_title, location, time_range, total_jobs, jobs_with_descriptions, cert_data) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                datetime.now(timezone.utc).isoformat(),
                job_title,
                location,
                time_range,
                total_jobs,
                jobs_with_desc,
                json.dumps(cert_items),
            ),
        )
        _apply_scan_retention(conn)
        conn.commit()
    finally:
        conn.close()


def _apply_scan_retention(conn: sqlite3.Connection) -> None:
    """Prune old scan rows by age and by max-row limit."""
    if settings.scan_retention_days > 0:
        cutoff = (
            datetime.now(timezone.utc) - timedelta(days=settings.scan_retention_days)
        ).isoformat()
        conn.execute("DELETE FROM scans WHERE timestamp < ?", (cutoff,))

    if settings.max_scan_rows > 0:
        conn.execute(
            "DELETE FROM scans WHERE id NOT IN (SELECT id FROM scans ORDER BY timestamp DESC LIMIT ?)",
            (settings.max_scan_rows,),
        )


def get_scan_history(limit: int = 50) -> List[Dict]:
    """Get recent scan history."""
    conn = _get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM scans ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()
        return [
            {
                "id": row["id"],
                "timestamp": row["timestamp"],
                "job_title": row["job_title"],
                "location": row["location"],
                "time_range": row["time_range"],
                "total_jobs": row["total_jobs"],
                "jobs_with_descriptions": row["jobs_with_descriptions"],
                "cert_data": json.loads(row["cert_data"]),
            }
            for row in rows
        ]
    finally:
        conn.close()


# ── Job Fetching ─────────────────────────────────────────────────────────────


async def fetch_jobs_single(
    client: httpx.AsyncClient,
    query: str,
    location: str = None,
    date_posted: str = "today",
) -> List[Dict]:
    """Fetch job postings for a single query."""
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }
    params = {
        "query": f"{query} in {location}" if location else query,
        "page": "1",
        "num_pages": "10",
        "date_posted": date_posted,
    }
    try:
        response = await client.get(JSEARCH_API_URL, headers=headers, params=params)
        response.raise_for_status()
        return response.json().get("data", [])
    except Exception as e:
        print(f"Query '{query}' failed: {e}")
        return []


async def fetch_jobs_expanded(
    job_title: str, location: str = None, date_posted: str = "today"
) -> tuple[List[Dict], List[str]]:
    """Fetch jobs using expanded queries, dedup, and return (jobs, queries_used)."""
    if not RAPIDAPI_KEY:
        raise HTTPException(status_code=500, detail="RAPIDAPI_KEY not configured.")

    queries = get_search_queries(job_title)

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Run all queries in parallel
            tasks = [
                fetch_jobs_single(client, q, location, date_posted) for q in queries
            ]
            results = await asyncio.gather(*tasks)

        # Merge and deduplicate by stable identity while preserving distinct postings.
        seen_ids = set()
        all_jobs = []
        for batch in results:
            for job in batch:
                key = _dedup_job_key(job)
                if key not in seen_ids:
                    seen_ids.add(key)
                    all_jobs.append(job)

        return all_jobs, queries

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching jobs: {e}")


# ── Cert Extraction ──────────────────────────────────────────────────────────


def clean_text(text: str) -> str:
    """Clean HTML and normalize whitespace."""
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_certs(
    text: str,
    job_title: str,
    company: str = "Unknown",
    job_url: str = None,
    job_key: Optional[str] = None,
) -> List[Dict]:
    """Extract certifications using dictionary lookup."""
    certs = []
    text_lower = text.lower()
    seen = set()

    for search_term, canonical, info in _cert_lookup:
        if canonical in seen:
            continue

        escaped = re.escape(search_term).replace(r"\ ", r"\s+")
        pattern = rf"(?<![a-z0-9]){escaped}(?![a-z0-9])"
        if re.search(pattern, text_lower):
            seen.add(canonical)
            certs.append(
                {
                    "name": canonical,
                    "full_name": info.get("full_name", canonical),
                    "org": info.get("org", ""),
                    "source_job": f"{job_title} at {company}",
                    "company": company,
                    "job_url": job_url,
                    "job_key": job_key or job_url or f"{job_title} at {company}",
                }
            )

    return certs


# ── Ranking ──────────────────────────────────────────────────────────────────


def rank_certs(items: List[Dict], total_jobs: int, top_n: int = 15) -> List[Dict]:
    """Rank certs by % of jobs mentioning them."""
    if not items:
        return []

    groups: Dict[str, Dict] = {}
    for item in items:
        name = item["name"]
        if name not in groups:
            groups[name] = {
                "name": name,
                "full_name": item.get("full_name", name),
                "org": item.get("org", ""),
                "jobs": set(),
                "sources": [],
            }
        groups[name]["jobs"].add(item.get("job_key", item["source_job"]))
        groups[name]["sources"].append(
            {
                "job": item["source_job"],
                "company": item["company"],
                "job_url": item.get("job_url"),
            }
        )

    sorted_groups = sorted(groups.values(), key=lambda x: len(x["jobs"]), reverse=True)
    if top_n:
        sorted_groups = sorted_groups[:top_n]

    ranked = []
    for g in sorted_groups:
        seen = set()
        unique_sources = []
        for s in g["sources"]:
            key = s.get("job_url") or f"{s['job']}-{s['company']}"
            if key not in seen:
                unique_sources.append(s)
                seen.add(key)

        job_count = len(g["jobs"])
        ranked.append(
            {
                "name": g["name"],
                "full_name": g["full_name"],
                "org": g["org"],
                "count": job_count,
                "percentage": round((job_count / total_jobs) * 100, 1)
                if total_jobs > 0
                else 0,
                "sources": unique_sources[:5],
            }
        )

    return ranked


# ── Insights ─────────────────────────────────────────────────────────────────


def compute_title_distribution(jobs: List[Dict]) -> List[Dict]:
    """Count job title variations in results (case/spacing normalized)."""
    titles = Counter()
    canonical_display: Dict[str, str] = {}

    for job in jobs:
        raw = str(job.get("job_title") or "Unknown")
        cleaned = raw.strip() or "Unknown"
        norm = re.sub(r"\s+", " ", cleaned).lower()

        if norm not in canonical_display:
            canonical_display[norm] = re.sub(r"\s+", " ", cleaned)
        titles[norm] += 1

    total = sum(titles.values())
    dist = []
    for norm, count in titles.most_common(8):
        dist.append(
            {
                "title": canonical_display.get(norm, norm),
                "count": count,
                "percentage": round((count / total) * 100, 1) if total > 0 else 0,
            }
        )
    return dist


def compute_cert_pairs(
    all_certs_per_job: List[List[str]], total_jobs: int
) -> List[Dict]:
    """Find the most common cert pairs across jobs."""
    pair_counter = Counter()
    for job_certs in all_certs_per_job:
        unique = sorted(set(job_certs))
        for i in range(len(unique)):
            for j in range(i + 1, len(unique)):
                pair_counter[(unique[i], unique[j])] += 1

    pairs = []
    for (a, b), count in pair_counter.most_common(5):
        if count >= 2:  # Only show pairs that appear in 2+ jobs
            pairs.append(
                {
                    "certs": [a, b],
                    "count": count,
                    "percentage": round((count / total_jobs) * 100, 1)
                    if total_jobs > 0
                    else 0,
                }
            )
    return pairs


# ── API Routes ───────────────────────────────────────────────────────────────



@app.post("/analyze-jobs", response_model=JobAnalysisResponse)
@limiter.limit(settings.rate_limit_default)
async def analyze_jobs(request: Request, payload: JobSearchRequest = Body(...)):
    """Analyze job postings for certification demand."""
    try:
        # JSearch supports: today, 3days, week, month, all
        date_map = {
            "1d": "today",
            "3d": "3days",
            "7d": "week",
            "14d": "month",
            "30d": "month",
        }
        date_posted = date_map.get(payload.time_range, "today")

        # Multi-query expansion
        jobs, queries_used = await fetch_jobs_expanded(
            payload.job_title, payload.location, date_posted
        )
        jobs = filter_jobs_by_time_range(jobs, payload.time_range)

        if not jobs:
            return JobAnalysisResponse(
                success=False, message="No jobs found", jobs_analyzed=0
            )

        # Extract certs from all job descriptions
        all_certs = []
        certs_per_job: List[List[str]] = []  # For pair analysis
        jobs_with_desc = 0

        for job in jobs:
            desc = job.get("job_description", "")
            if not desc:
                continue
            jobs_with_desc += 1

            cleaned = clean_text(desc)
            title = job.get("job_title", "Job Posting")
            company = job.get("company_name", job.get("employer_name", "Unknown"))
            url = job.get("job_apply_link", job.get("job_url"))
            job_key = str(job.get("job_id") or url or f"{title}-{company}")

            job_certs = extract_certs(cleaned, title, company, url, job_key=job_key)
            all_certs.extend(job_certs)
            certs_per_job.append([c["name"] for c in job_certs])

        total = jobs_with_desc if jobs_with_desc > 0 else len(jobs)
        ranked = rank_certs(all_certs, total, 15)

        # Compute insights
        title_dist = compute_title_distribution(jobs)
        cert_pairs = compute_cert_pairs(certs_per_job, total)

        # Save to SQLite
        save_scan(
            job_title=payload.job_title,
            location=payload.location,
            time_range=payload.time_range,
            total_jobs=len(jobs),
            jobs_with_desc=jobs_with_desc,
            cert_items=ranked,
        )

        return JobAnalysisResponse(
            success=True,
            message="Analysis complete",
            data={
                "certifications": {"title": "Certification Demand", "items": ranked},
                "total_jobs_found": len(jobs),
                "jobs_with_descriptions": jobs_with_desc,
                "queries_used": queries_used,
                "title_distribution": title_dist,
                "cert_pairs": cert_pairs,
                "search_criteria": {
                    "job_title": payload.job_title,
                    "location": payload.location,
                    "time_range": payload.time_range,
                    "target_path": payload.target_path,
                    "owned_certs": payload.owned_certs,
                },
            },
            jobs_analyzed=len(jobs),
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected error during analysis.")


@app.get("/history")
@limiter.exempt
async def scan_history(limit: int = 50):
    """Return saved scan history for trend tracking."""
    try:
        history = get_scan_history(limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading history: {e}")


@app.get("/stats")
@limiter.exempt
async def aggregate_stats():
    """Aggregate all scan data into all-time stats and trends."""
    try:
        conn = _get_db()
        rows = conn.execute("SELECT * FROM scans ORDER BY timestamp ASC").fetchall()
        conn.close()

        if not rows:
            return {"stats": None}

        total_scans = len(rows)
        total_jobs = sum(row["total_jobs"] for row in rows)
        total_jobs_desc = sum(row["jobs_with_descriptions"] for row in rows)

        # Aggregate cert counts across ALL scans
        cert_totals: Dict[str, Dict] = {}
        # Track per-scan trends for each cert
        trend_data: List[Dict] = []

        for row in rows:
            certs = json.loads(row["cert_data"])
            scan_jobs = row["jobs_with_descriptions"] or row["total_jobs"]
            ts = row["timestamp"][:10]  # date only
            scan_entry = {"date": ts, "job_title": row["job_title"], "jobs": scan_jobs}

            for cert in certs:
                name = cert["name"]
                if name not in cert_totals:
                    cert_totals[name] = {
                        "name": name,
                        "full_name": cert.get("full_name", name),
                        "org": cert.get("org", ""),
                        "total_mentions": 0,
                        "scans_appeared": 0,
                        "percentages": [],
                    }
                cert_totals[name]["total_mentions"] += cert.get("count", 0)
                cert_totals[name]["scans_appeared"] += 1
                cert_totals[name]["percentages"].append(cert.get("percentage", 0))
                scan_entry[name] = cert.get("percentage", 0)

            trend_data.append(scan_entry)

        # Build all-time rankings
        all_time = []
        for ct in cert_totals.values():
            avg_pct = (
                round(sum(ct["percentages"]) / len(ct["percentages"]), 1)
                if ct["percentages"]
                else 0
            )
            all_time.append(
                {
                    "name": ct["name"],
                    "full_name": ct["full_name"],
                    "org": ct["org"],
                    "total_mentions": ct["total_mentions"],
                    "scans_appeared": ct["scans_appeared"],
                    "avg_percentage": avg_pct,
                    "latest_percentage": ct["percentages"][-1]
                    if ct["percentages"]
                    else 0,
                }
            )
        all_time.sort(key=lambda x: x["avg_percentage"], reverse=True)

        # Top certs for trend tracking (the top 8 by avg %)
        top_cert_names = [c["name"] for c in all_time[:8]]

        return {
            "stats": {
                "total_scans": total_scans,
                "total_jobs_scanned": total_jobs,
                "total_jobs_with_descriptions": total_jobs_desc,
                "first_scan": rows[0]["timestamp"],
                "latest_scan": rows[-1]["timestamp"],
                "all_time_certs": all_time[:15],
                "trend_data": trend_data,
                "top_cert_names": top_cert_names,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing stats: {e}")


@app.get("/health")
@limiter.exempt
async def health_check():
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "rapidapi_configured": bool(RAPIDAPI_KEY),
        "certs_loaded": len(CERT_DICTIONARY),
        "role_families": len(ROLE_FAMILIES),
        "version": "1.0.0",
    }


# ── Serve Frontend ───────────────────────────────────────────────────────────
if FRONTEND_DIST.exists() and FRONTEND_DIST.is_dir():
    # Mount the assets directory explicitly
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    @limiter.exempt
    async def serve_frontend(full_path: str):
        # Prevent directory traversal
        if ".." in full_path:
            raise HTTPException(status_code=400, detail="Invalid path")

        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        # Fallback to index.html for SPA routing
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    print(f"Warning: Frontend dist folder not found at {FRONTEND_DIST}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
