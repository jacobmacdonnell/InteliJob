import os
import re
import json
import sqlite3
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from pathlib import Path
import httpx
from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config import settings

# ── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(title="InteliJob API", version="3.0.0")

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
print(f"Environment: {ENVIRONMENT}")

# ── Pydantic Models ──────────────────────────────────────────────────────────
class JobSearchRequest(BaseModel):
    job_title: str
    location: Optional[str] = None
    time_range: Optional[str] = "1d"

class JobAnalysisResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    jobs_analyzed: int = 0

# ── Config ───────────────────────────────────────────────────────────────────
JSEARCH_API_URL = settings.jsearch_api_url
RAPIDAPI_KEY = settings.rapidapi_key

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
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
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

def save_scan(job_title: str, location: Optional[str], time_range: str,
              total_jobs: int, jobs_with_desc: int, cert_items: List[Dict]):
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
        conn.commit()
    finally:
        conn.close()

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

async def fetch_jobs(job_title: str, location: str = None, date_posted: str = "today") -> List[Dict]:
    """Fetch job postings from JSearch API."""
    if not RAPIDAPI_KEY:
        raise HTTPException(status_code=500, detail="RAPIDAPI_KEY not configured.")

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }
    params = {
        "query": f"{job_title} in {location}" if location else job_title,
        "page": "1",
        "num_pages": "10",
        "date_posted": date_posted,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(JSEARCH_API_URL, headers=headers, params=params)
            response.raise_for_status()
            return response.json().get("data", [])
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="JSearch API timeout")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"JSearch API error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching jobs: {e}")


# ── Cert Extraction ──────────────────────────────────────────────────────────

def clean_text(text: str) -> str:
    """Clean HTML and normalize whitespace."""
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_certs(text: str, job_title: str, company: str = "Unknown", job_url: str = None) -> List[Dict]:
    """Extract certifications using dictionary lookup."""
    certs = []
    text_lower = text.lower()
    seen = set()

    for search_term, canonical, info in _cert_lookup:
        if canonical in seen:
            continue

        # Short abbreviations need word boundaries
        if len(search_term) <= 3:
            if re.search(r'\b' + re.escape(search_term) + r'\b', text_lower):
                seen.add(canonical)
                certs.append({
                    "name": canonical,
                    "full_name": info.get("full_name", canonical),
                    "org": info.get("org", ""),
                    "source_job": f"{job_title} at {company}",
                    "company": company,
                    "job_url": job_url,
                })
        else:
            if search_term in text_lower:
                seen.add(canonical)
                certs.append({
                    "name": canonical,
                    "full_name": info.get("full_name", canonical),
                    "org": info.get("org", ""),
                    "source_job": f"{job_title} at {company}",
                    "company": company,
                    "job_url": job_url,
                })

    return certs


# ── Ranking ──────────────────────────────────────────────────────────────────

def rank_certs(items: List[Dict], total_jobs: int, top_n: int = 15) -> List[Dict]:
    """Rank certs by % of jobs mentioning them. Preserves full_name/org."""
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
        groups[name]["jobs"].add(item["source_job"])
        groups[name]["sources"].append({
            "job": item["source_job"],
            "company": item["company"],
            "job_url": item.get("job_url"),
        })

    sorted_groups = sorted(groups.values(), key=lambda x: len(x["jobs"]), reverse=True)
    if top_n:
        sorted_groups = sorted_groups[:top_n]

    ranked = []
    for g in sorted_groups:
        # Deduplicate sources
        seen = set()
        unique_sources = []
        for s in g["sources"]:
            key = f"{s['job']}-{s['company']}"
            if key not in seen:
                unique_sources.append(s)
                seen.add(key)

        job_count = len(g["jobs"])
        ranked.append({
            "name": g["name"],
            "full_name": g["full_name"],
            "org": g["org"],
            "count": job_count,
            "percentage": round((job_count / total_jobs) * 100, 1) if total_jobs > 0 else 0,
            "sources": unique_sources[:5],
        })

    return ranked


# ── API Routes ───────────────────────────────────────────────────────────────

@app.get("/")
@limiter.exempt
async def root():
    return {"message": "InteliJob API", "version": "3.0.0"}


@app.post("/analyze-jobs", response_model=JobAnalysisResponse)
@limiter.limit(settings.rate_limit_default)
async def analyze_jobs(request: Request, payload: JobSearchRequest = Body(...)):
    """Analyze job postings for certification demand."""
    try:
        date_map = {"1d": "today", "3d": "3days", "7d": "week", "14d": "month", "30d": "month"}
        date_posted = date_map.get(payload.time_range, "today")

        jobs = await fetch_jobs(payload.job_title, payload.location, date_posted)

        if not jobs:
            return JobAnalysisResponse(success=False, message="No jobs found", jobs_analyzed=0)

        # Extract certs from all job descriptions
        all_certs = []
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

            all_certs.extend(extract_certs(cleaned, title, company, url))

        total = jobs_with_desc if jobs_with_desc > 0 else len(jobs)
        ranked = rank_certs(all_certs, total, 15)

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
                "search_criteria": {
                    "job_title": payload.job_title,
                    "location": payload.location,
                    "time_range": payload.time_range,
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


@app.get("/health")
@limiter.exempt
async def health_check():
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "rapidapi_configured": bool(RAPIDAPI_KEY),
        "certs_loaded": len(CERT_DICTIONARY),
        "version": "3.0.0",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
