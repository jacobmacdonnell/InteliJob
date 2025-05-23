import os
import re
import asyncio
from typing import List, Dict, Optional, Any
from collections import Counter
import httpx
from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# slowapi imports
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Import settings from config.py
from config import settings

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="InteliJob API", version="1.0.0")

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, 
                  default_limits=[settings.rate_limit_default],
                  strategy=settings.rate_limit_strategy,
                  # storage_uri="memory://" # Default, suitable for single process. For multi-process (Gunicorn workers), Redis or Memcached is needed.
                  )
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add SlowAPIMiddleware - this must be added BEFORE the routes are defined if you want to use decorators on routes
# However, for global limits or if you apply limits directly in path operations, its position is less critical.
# For now, we will apply it to specific routes using decorators.

# CORS Middleware
# print(f"DEBUG: CORS Origins loaded by FastAPI app: {settings.cors_origins}") # DEBUG line removed
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins, # Use the loaded setting
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy model (English) - optional
nlp = None
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    print("✅ spaCy model loaded successfully")
except ImportError:
    print("⚠️  spaCy not installed. NLP features will be limited to keyword matching.")
except IOError:
    print("⚠️  spaCy English model not found. Please install it with: python -m spacy download en_core_web_sm")
    print("   NLP features will be limited to keyword matching.")

# Pydantic models
class JobSearchRequest(BaseModel):
    job_title: str
    location: Optional[str] = None
    time_range: Optional[str] = "1d"  # 1d, 3d, 1w, 2w, 1m

class JobAnalysisResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    jobs_analyzed: int = 0

# Configuration - Use settings from config.py
JSEARCH_API_URL = settings.jsearch_api_url
RAPIDAPI_KEY = settings.rapidapi_key # Ensures consistency with config
# Note: RAPIDAPI_KEY is also checked by settings.is_rapidapi_configured()

# Predefined certification patterns (case-insensitive)
CERTIFICATION_PATTERNS = [
    # Cloud Certifications
    r'\b(?:AWS|Amazon Web Services)\s*(?:Certified|Certificate)?\s*(?:Solutions?\s*Architect|Developer|SysOps|DevOps|Cloud\s*Practitioner|Security|Machine\s*Learning|Data\s*Analytics)\b',
    r'\b(?:Azure|Microsoft\s*Azure)\s*(?:Certified|Certificate)?\s*(?:Solutions?\s*Architect|Developer|Administrator|DevOps|Security|AI|Data)\b',
    r'\bGoogle\s*Cloud\s*(?:Certified|Certificate)?\s*(?:Professional|Associate)?\s*(?:Cloud\s*Architect|Data\s*Engineer|Cloud\s*Developer|DevOps|Security)\b',
    r'\bGCP\s*(?:Certified|Certificate)?\s*(?:Professional|Associate)?\s*(?:Cloud\s*Architect|Data\s*Engineer|Cloud\s*Developer|DevOps|Security)\b',
    
    # Programming & Development
    r'\bCertified\s*(?:Java|Python|JavaScript|C\#|C\+\+)\s*(?:Developer|Programmer)\b',
    r'\bOracle\s*Certified\s*(?:Professional|Associate)\s*Java\s*(?:Developer|Programmer)\b',
    r'\bMicrosoft\s*Certified\s*(?:Professional|Solutions|Technology\s*Specialist)\b',
    
    # Security Certifications
    r'\b(?:CISSP|CISM|CISA|CEH|Security\+|CySA\+|GSEC|CISSP)\b',
    r'\bCertified\s*(?:Information|Ethical)\s*(?:Security|Hacker)\s*(?:Professional|Manager|Auditor|Analyst)\b',
    
    # Database Certifications
    r'\b(?:Oracle|Microsoft|MySQL|PostgreSQL|MongoDB)\s*(?:Certified|Certificate)?\s*(?:Database|DBA|Administrator|Developer)\b',
    
    # Project Management
    r'\b(?:PMP|PRINCE2|Agile|Scrum\s*Master|Certified\s*Scrum\s*Master|CSM|PMI|CAPM)\b',
    
    # Network & Infrastructure
    r'\b(?:CCNA|CCNP|CCIE|CompTIA|Network\+|A\+|Linux\+|Server\+)\b',
    r'\bCisco\s*Certified\s*(?:Network|Design|Security|Voice)\s*(?:Associate|Professional|Expert)\b',
    
    # Data & Analytics
    r'\bTableau\s*(?:Certified|Certificate)?\s*(?:Desktop|Server|Data\s*Analyst)\b',
    r'\bSAS\s*(?:Certified|Certificate)?\s*(?:Base|Advanced|Statistical|Business\s*Analyst)\b',
    r'\bCertified\s*(?:Data\s*Scientist|Analytics\s*Professional|Business\s*Intelligence|Data\s*Analyst)\b',
]

# Technical skills patterns (will be enhanced by spaCy NLP)
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
    
    # Data & Analytics
    'tableau', 'power bi', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras',
    'spark', 'hadoop', 'kafka', 'airflow', 'jupyter', 'r studio',
    
    # Mobile Development
    'ios', 'android', 'react native', 'flutter', 'xamarin', 'cordova', 'ionic',
    
    # Testing & Quality
    'selenium', 'cypress', 'junit', 'pytest', 'jest', 'mocha', 'postman', 'jmeter',
]

# Experience patterns
EXPERIENCE_PATTERNS = [
    r'(\d+)[\+\-\s]*(?:to\s+)?(\d+)?\+?\s*(?:years?)\s*(?:of\s*)?(?:experience|exp)',
    r'(\d+)[\+\-\s]*(?:years?)\s*(?:of\s*)?(?:experience|exp)',
    r'minimum\s*(?:of\s*)?(\d+)[\+\-\s]*(?:years?)',
    r'at\s*least\s*(\d+)[\+\-\s]*(?:years?)',
    r'(\d+)[\+\-\s]*(?:years?)\s*(?:in|with|of)',
    r'(\d+)[\+\-\s]*(?:yrs?)\s*(?:experience|exp)',
]

async def fetch_jobs_from_jsearch(job_title: str, location: str = None, date_posted: str = "today") -> List[Dict]:
    """Fetch job postings from JSearch API"""
    if not RAPIDAPI_KEY:
        raise HTTPException(status_code=500, detail="RAPIDAPI_KEY not configured")
    
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    
    params = {
        "query": job_title,
        "page": "1",
        "num_pages": "1",
        "date_posted": date_posted,
    }
    
    if location:
        params["query"] = f"{job_title} in {location}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
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

def clean_job_description(description: str) -> str:
    """Clean and normalize job description text"""
    if not description:
        return ""
    
    # Remove HTML tags
    description = re.sub(r'<[^>]+>', ' ', description)
    
    # Remove extra whitespace
    description = re.sub(r'\s+', ' ', description)
    
    # Remove special characters except periods, commas, and hyphens
    description = re.sub(r'[^\w\s\.\,\-\+\#]', ' ', description)
    
    return description.strip()

def extract_certifications(text: str) -> List[str]:
    """Extract certifications using regex patterns"""
    certifications = []
    text_lower = text.lower()
    
    for pattern in CERTIFICATION_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            cert = match.group().strip()
            if cert and len(cert) > 2:
                certifications.append(cert)
    
    return list(set(certifications))

def extract_technical_skills(text: str) -> List[str]:
    """Extract technical skills using both NLP and keyword matching"""
    skills = []
    text_lower = text.lower()
    
    # Keyword-based extraction
    for skill in TECH_SKILLS_KEYWORDS:
        skill_pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(skill_pattern, text_lower):
            skills.append(skill.title())
    
    # NLP-based extraction if spaCy is available
    if nlp:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PRODUCT", "LANGUAGE"] and len(ent.text) > 2:
                # Filter for tech-related entities
                ent_lower = ent.text.lower()
                if any(tech_word in ent_lower for tech_word in ['tech', 'soft', 'program', 'develop', 'data', 'web', 'mobile', 'cloud']):
                    skills.append(ent.text.title())
    
    return list(set(skills))

def extract_experience_years(text: str) -> List[str]:
    """Extract years of experience using regex patterns"""
    experience_requirements = []
    
    for pattern in EXPERIENCE_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            exp_text = match.group().strip()
            if exp_text:
                experience_requirements.append(exp_text)
    
    return list(set(experience_requirements))

def aggregate_and_rank(items: List[str], top_n: int = 10) -> List[Dict[str, Any]]:
    """Aggregate items by frequency and return top N"""
    if not items:
        return []
    
    counter = Counter(items)
    ranked_items = []
    
    for item, count in counter.most_common(top_n):
        ranked_items.append({
            "name": item,
            "count": count,
            "percentage": round((count / len(items)) * 100, 1)
        })
    
    return ranked_items

@app.get("/")
@limiter.exempt
async def root():
    """Health check endpoint"""
    return {"message": "InteliJob API", "status": "running"}

@app.post("/analyze-jobs", response_model=JobAnalysisResponse)
@limiter.limit(settings.rate_limit_default)
async def analyze_jobs(request: Request, payload: JobSearchRequest = Body(...)):
    """Main endpoint to analyze job postings"""
    try:
        # Map time range to JSearch API format
        date_posted_map = {
            "1d": "today",
            "3d": "3days",
            "1w": "week",
            "2w": "month",  # JSearch doesn't have 2 weeks, using month
            "1m": "month"
        }
        
        date_posted = date_posted_map.get(payload.time_range, "today")
        
        # Fetch jobs from JSearch API
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
        
        for job in jobs:
            description = job.get("job_description", "")
            if not description:
                continue
                
            cleaned_description = clean_job_description(description)
            
            # Extract certifications, skills, and experience
            certifications = extract_certifications(cleaned_description)
            skills = extract_technical_skills(cleaned_description)
            experience = extract_experience_years(cleaned_description)
            
            all_certifications.extend(certifications)
            all_skills.extend(skills)
            all_experience.extend(experience)
        
        # Aggregate and rank results
        top_certifications = aggregate_and_rank(all_certifications, 10)
        top_skills = aggregate_and_rank(all_skills, 15)
        top_experience = aggregate_and_rank(all_experience, 8)
        
        analysis_data = {
            "certifications": top_certifications,
            "technical_skills": top_skills,
            "experience_requirements": top_experience,
            "total_jobs_found": len(jobs),
            "jobs_with_descriptions": len([j for j in jobs if j.get("job_description")]),
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
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.get("/health")
@limiter.exempt
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "spacy_loaded": nlp is not None,
        "rapidapi_configured": bool(RAPIDAPI_KEY),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
