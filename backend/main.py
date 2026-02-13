import os
import re
import json
from typing import List, Dict, Optional, Any
from pathlib import Path
import httpx
from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# slowapi imports
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Import settings from config.py
from config import settings

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="InteliJob API", version="2.0.0")

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, 
                  default_limits=[settings.rate_limit_default],
                  strategy=settings.rate_limit_strategy,
                  )
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
print(f"🔧 Environment: {ENVIRONMENT}")

# Pydantic models
class JobSearchRequest(BaseModel):
    job_title: str
    location: Optional[str] = None
    time_range: Optional[str] = "1d"

class JobAnalysisResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    jobs_analyzed: int = 0

# Configuration
JSEARCH_API_URL = settings.jsearch_api_url
RAPIDAPI_KEY = settings.rapidapi_key

# ── Cert Dictionary ──────────────────────────────────────────────────────────
# Load cert dictionary from JSON file
CERT_DICT_PATH = Path(__file__).parent / "certs.json"
CERT_DICTIONARY: Dict[str, Dict] = {}

try:
    with open(CERT_DICT_PATH, "r", encoding="utf-8") as f:
        CERT_DICTIONARY = json.load(f)
    print(f"✅ Loaded {len(CERT_DICTIONARY)} certifications from certs.json")
except FileNotFoundError:
    print("⚠️  certs.json not found — cert extraction will be limited")
except json.JSONDecodeError as e:
    print(f"⚠️  Error parsing certs.json: {e}")

# Build lookup structures for efficient matching
# We match both the abbreviation and the full name
_cert_lookup: List[tuple] = []  # (search_term_lower, canonical_name, info)
for abbrev, info in CERT_DICTIONARY.items():
    _cert_lookup.append((abbrev.lower(), abbrev, info))
    full = info.get("full_name", "")
    if full and full.lower() != abbrev.lower():
        _cert_lookup.append((full.lower(), abbrev, info))


# ── Technical Skills Keywords ────────────────────────────────────────────────
TECH_SKILLS_KEYWORDS = [
    # Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell',
    
    # Web Technologies
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel',
    'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'jquery', 'webpack', 'npm', 'yarn',
    
    # Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql server', 'sqlite',
    'dynamodb', 'cassandra', 'neo4j', 'influxdb',
    
    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions', 'terraform',
    'ansible', 'chef', 'puppet', 'vagrant', 'circleci', 'travis ci',
    
    # Security Tools (important for cybersecurity searches)
    'splunk', 'wireshark', 'nessus', 'metasploit', 'burp suite', 'nmap', 'snort', 'suricata',
    'crowdstrike', 'sentinel', 'qradar', 'qualys', 'tenable', 'rapid7',
    'kali linux', 'siem', 'soar', 'edr', 'xdr', 'ids', 'ips', 'waf', 'dlp',
    
    # Data & Analytics
    'tableau', 'power bi', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras',
    'spark', 'hadoop', 'kafka', 'airflow', 'jupyter',
    
    # Testing & Quality
    'selenium', 'cypress', 'junit', 'pytest', 'jest', 'mocha', 'postman', 'jmeter',
]

# ── Experience Patterns ──────────────────────────────────────────────────────
EXPERIENCE_PATTERNS = [
    r'(\d+)\s*(?:to|-)\s*(\d+)\s*\+?\s*years?',
    r'(?:minimum|min|at least|over|more than)\s*(\d+)\s*\+?\s*years?',
    r'(\d+)\+\s*years?',
    r'(\d+)\s*years?',
    r'entry\s*level',
    r'junior\s*level',
]

# ── Education Patterns ───────────────────────────────────────────────────────
EDUCATION_PATTERNS = [
    r"\b(?:Bachelor's|Bachelor|BS|BA|B\.S\.|B\.A\.)\s*(?:degree|in|of)?\s*(?:[A-Za-z\s]+)?\s*(?:required|preferred|or equivalent)?\b",
    r"\b(?:Master's|Master|MS|MA|M\.S\.|M\.A\.)\s*(?:degree|in|of)?\s*(?:[A-Za-z\s]+)?\s*(?:required|preferred|or equivalent)?\b",
    r"\b(?:PhD|Ph\.D\.|Doctorate|Doctoral)\s*(?:degree|in|of)?\s*(?:[A-Za-z\s]+)?\s*(?:required|preferred|or equivalent)?\b",
    r"\b(?:Associate's|Associate|AA|AS|A\.A\.|A\.S\.)\s*(?:degree|in|of)?\s*(?:[A-Za-z\s]+)?\s*(?:required|preferred|or equivalent)?\b",
    r"\b(?:degree|diploma|certificate)\s*(?:in|of)?\s*(?:[A-Za-z\s]+)?\s*(?:required|preferred|or equivalent)?\b",
]


# ── Job Fetching ─────────────────────────────────────────────────────────────

async def fetch_jobs_from_jsearch(job_title: str, location: str = None, date_posted: str = "today") -> List[Dict]:
    """Fetch job postings from JSearch API."""
    
    if not RAPIDAPI_KEY:
        raise HTTPException(
            status_code=500, 
            detail="RAPIDAPI_KEY not configured. Please set the RAPIDAPI_KEY environment variable."
        )
    
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    
    params = {
        "query": job_title,
        "page": "1",
        "num_pages": "10",  # ~100 jobs for meaningful cert rankings
        "date_posted": date_posted,
    }
    
    if location:
        params["query"] = f"{job_title} in {location}"
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(JSEARCH_API_URL, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timeout - JSearch API took too long to respond")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"JSearch API error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching jobs: {str(e)}")


# ── Text Cleaning ────────────────────────────────────────────────────────────

def clean_job_description(description: str) -> str:
    """Clean and normalize job description text."""
    if not description:
        return ""
    description = re.sub(r'<[^>]+>', ' ', description)  # Remove HTML tags
    description = re.sub(r'\s+', ' ', description)  # Normalize whitespace
    description = re.sub(r'[^\w\s\.\,\-\+\#]', ' ', description)  # Remove special chars
    return description.strip()


# ── Extraction Functions ─────────────────────────────────────────────────────

def extract_certifications_with_sources(text: str, job_title: str, company: str = "Unknown", job_url: str = None) -> List[Dict]:
    """Extract certifications using dictionary lookup — no regex fragility."""
    certifications = []
    text_lower = text.lower()
    seen = set()  # Avoid duplicate certs from same job description
    
    for search_term, canonical_name, info in _cert_lookup:
        if canonical_name in seen:
            continue
        
        # For short abbreviations (≤3 chars like "A+", "R"), require word boundaries
        if len(search_term) <= 3:
            pattern = r'\b' + re.escape(search_term) + r'\b'
            if re.search(pattern, text_lower):
                seen.add(canonical_name)
                certifications.append({
                    "name": canonical_name,
                    "full_name": info.get("full_name", canonical_name),
                    "org": info.get("org", ""),
                    "source_job": f"{job_title} at {company}",
                    "company": company,
                    "job_url": job_url
                })
        else:
            if search_term in text_lower:
                seen.add(canonical_name)
                certifications.append({
                    "name": canonical_name,
                    "full_name": info.get("full_name", canonical_name),
                    "org": info.get("org", ""),
                    "source_job": f"{job_title} at {company}",
                    "company": company,
                    "job_url": job_url
                })
    
    return certifications


def extract_technical_skills_with_sources(text: str, job_title: str, company: str = "Unknown", job_url: str = None) -> List[Dict]:
    """Extract technical skills using keyword matching."""
    skills = []
    text_lower = text.lower()
    
    for skill in TECH_SKILLS_KEYWORDS:
        skill_pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(skill_pattern, text_lower):
            skills.append({
                "name": skill.title(),
                "source_job": f"{job_title} at {company}",
                "company": company,
                "job_url": job_url
            })
    
    return skills


def normalize_experience_text(text: str) -> Optional[str]:
    """Normalize experience strings to consistent format."""
    text = text.lower().strip()

    match = re.fullmatch(r'(\d+)\s*(?:to|-)\s*(\d+)\s*\+?\s*years?', text)
    if match:
        num1, num2 = int(match.group(1)), int(match.group(2))
        return f"{min(num1, num2)}-{max(num1, num2)} Years"

    match = re.fullmatch(r'(?:minimum|min|at least|over|more than)\s*(\d+)\s*\+?\s*years?', text)
    if match:
        return f"{match.group(1)}+ Years"
    match = re.fullmatch(r'(\d+)\+\s*years?', text)
    if match:
        return f"{match.group(1)}+ Years"

    match = re.fullmatch(r'(\d+)\s*years?', text)
    if match:
        return f"{match.group(1)} Years"

    if 'entry level' in text or 'entry-level' in text:
        return "Entry Level"
    if 'junior level' in text:
         return "Junior Level"

    numbers = re.findall(r'\d+', text)
    if len(numbers) == 1:
        return f"{numbers[0]} Years"
    elif len(numbers) == 2:
        return f"{min(int(numbers[0]), int(numbers[1]))}-{max(int(numbers[0]), int(numbers[1]))} Years"

    if 'year' in text or 'exp' in text or 'yr' in text:
        return text.capitalize()
    return None


def extract_experience_with_sources(text: str, job_title: str, company: str = "Unknown", job_url: str = None) -> List[Dict]:
    """Extract experience requirements from text."""
    experience_requirements = []
    processed_texts = set()

    for pattern in EXPERIENCE_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            raw_exp_text = match.group(0).strip()
            if raw_exp_text in processed_texts:
                continue
            processed_texts.add(raw_exp_text)

            normalized_name = normalize_experience_text(raw_exp_text)

            if normalized_name:
                experience_requirements.append({
                    "name": normalized_name,
                    "source_job": f"{job_title} at {company}",
                    "company": company,
                    "job_url": job_url
                })
    return experience_requirements


def extract_education_with_sources(text: str, job_title: str, company: str = "Unknown", job_url: str = None) -> List[Dict]:
    """Extract education requirements from text."""
    education_requirements = []
    processed_texts = set()
    
    for pattern in EDUCATION_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            edu_text = match.group().strip()
            if edu_text in processed_texts:
                continue
            processed_texts.add(edu_text)
            
            edu_text = re.sub(r'\s+', ' ', edu_text).strip()
            
            if edu_text and len(edu_text) > 2:
                education_requirements.append({
                    "name": edu_text,
                    "source_job": f"{job_title} at {company}",
                    "company": company,
                    "job_url": job_url
                })
    
    return education_requirements


# ── Aggregation & Ranking ────────────────────────────────────────────────────

def aggregate_and_rank_with_sources(items: List[Dict], total_jobs: int, top_n: int = 10) -> List[Dict[str, Any]]:
    """
    Aggregate items and rank by how many jobs mention them.
    percentage = (jobs_mentioning / total_jobs) * 100
    """
    if not items:
        return []
    
    # Group by item name, tracking unique jobs
    item_groups: Dict[str, Dict] = {}
    for item in items:
        name = item["name"]
        if name not in item_groups:
            item_groups[name] = {
                "name": name,
                "jobs": set(),  # Track unique job sources
                "sources": [],
            }
        # Use source_job as unique identifier for deduplication
        item_groups[name]["jobs"].add(item["source_job"])
        item_groups[name]["sources"].append({
            "job": item["source_job"],
            "company": item["company"],
            "job_url": item.get("job_url")
        })
    
    # Sort by number of unique jobs mentioning this item
    sorted_items = sorted(item_groups.values(), key=lambda x: len(x["jobs"]), reverse=True)
    
    if top_n and top_n > 0:
        sorted_items = sorted_items[:top_n]
    
    ranked_items = []
    for item in sorted_items:
        # Deduplicate sources
        unique_sources = []
        seen_sources = set()
        for source in item["sources"]:
            source_key = f"{source['job']}-{source['company']}"
            if source_key not in seen_sources:
                unique_sources.append(source)
                seen_sources.add(source_key)
        
        job_count = len(item["jobs"])
        ranked_items.append({
            "name": item["name"],
            "count": job_count,
            "percentage": round((job_count / total_jobs) * 100, 1) if total_jobs > 0 else 0,
            "sources": unique_sources[:5]  # Limit to 5 sources for UI performance
        })
    
    return ranked_items


# ── API Routes ───────────────────────────────────────────────────────────────

@app.get("/")
@limiter.exempt
async def root():
    """Root endpoint."""
    return {"message": "InteliJob API", "status": "running", "version": "2.0.0"}


@app.post("/analyze-jobs", response_model=JobAnalysisResponse)
@limiter.limit(settings.rate_limit_default)
async def analyze_jobs(request: Request, payload: JobSearchRequest = Body(...)):
    """Main endpoint to analyze job postings."""
    try:
        # Map time range to JSearch API format
        date_posted_map = {
            "1d": "today",
            "3d": "3days",
            "7d": "week",
            "14d": "month",
            "30d": "month"
        }
        
        date_posted = date_posted_map.get(payload.time_range, "today")
        
        # Fetch jobs
        jobs = await fetch_jobs_from_jsearch(
            job_title=payload.job_title,
            location=payload.location,
            date_posted=date_posted
        )
        
        if not jobs:
            return JobAnalysisResponse(
                success=False,
                message="No jobs found for the given criteria",
                jobs_analyzed=0
            )
        
        # Extract data from all job descriptions
        all_certifications = []
        all_skills = []
        all_experience = []
        all_education = []
        
        jobs_with_descriptions = 0
        for job in jobs:
            description = job.get("job_description", "")
            if not description:
                continue
            jobs_with_descriptions += 1
                
            cleaned_description = clean_job_description(description)
            
            actual_job_title = job.get("job_title", "Job Posting")
            company_name = job.get("company_name", job.get("employer_name", "Unknown Company"))
            job_posting_url = job.get("job_apply_link", job.get("job_url"))

            all_certifications.extend(extract_certifications_with_sources(cleaned_description, actual_job_title, company_name, job_posting_url))
            all_skills.extend(extract_technical_skills_with_sources(cleaned_description, actual_job_title, company_name, job_posting_url))
            all_experience.extend(extract_experience_with_sources(cleaned_description, actual_job_title, company_name, job_posting_url))
            all_education.extend(extract_education_with_sources(cleaned_description, actual_job_title, company_name, job_posting_url))
        
        # Aggregate and rank — now using "% of jobs" metric
        total = jobs_with_descriptions if jobs_with_descriptions > 0 else len(jobs)
        top_certifications = aggregate_and_rank_with_sources(all_certifications, total, 15)
        top_skills = aggregate_and_rank_with_sources(all_skills, total, 15)
        top_experience = aggregate_and_rank_with_sources(all_experience, total, 8)
        top_education = aggregate_and_rank_with_sources(all_education, total, 5)
        
        analysis_data = {
            "certifications": { "title": "Top Certifications", "items": top_certifications},
            "skills": { "title": "Top Skills", "items": top_skills},
            "experience": { "title": "Experience Requirements", "items": top_experience},
            "education": { "title": "Education Requirements", "items": top_education},
            "total_jobs_found": len(jobs),
            "jobs_with_descriptions": jobs_with_descriptions,
            "search_criteria": {
                "job_title": payload.job_title,
                "location": payload.location,
                "time_range": payload.time_range
            }
        }
        
        return JobAnalysisResponse(
            success=True,
            message="Job analysis completed successfully",
            data=analysis_data,
            jobs_analyzed=len(jobs)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unhandled error during analysis: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An unexpected error occurred during analysis. Please try again later.")


@app.get("/health")
@limiter.exempt
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "rapidapi_configured": bool(RAPIDAPI_KEY),
        "certs_loaded": len(CERT_DICTIONARY),
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
