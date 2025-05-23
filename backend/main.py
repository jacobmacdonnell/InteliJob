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

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
ENABLE_MOCK_DATA = os.getenv("ENABLE_MOCK_DATA", "true" if ENVIRONMENT == "development" else "false").lower() == "true"

print(f"🔧 Environment: {ENVIRONMENT}")
print(f"🧪 Mock data enabled: {ENABLE_MOCK_DATA}")

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

# Mock job data for DEVELOPMENT/TESTING ONLY
def get_mock_jobs(job_title: str, location: str = None) -> List[Dict]:
    """Return mock job data for DEVELOPMENT/TESTING purposes only"""
    if ENVIRONMENT == "production":
        raise HTTPException(
            status_code=500, 
            detail="Mock data is not available in production environment. Please configure RAPIDAPI_KEY."
        )
    
    job_title_lower = job_title.lower()
    
    # Customize mock data based on job title
    if "software" in job_title_lower or "developer" in job_title_lower or "engineer" in job_title_lower:
        return [
            {
                "job_title": "Senior Software Engineer",
                "company": "TechCorp Inc",
                "job_description": """
                We are seeking a Senior Software Engineer with 5+ years of experience in Python, React, and AWS. 
                The ideal candidate will have experience with Docker, Kubernetes, and microservices architecture.
                Required certifications: AWS Certified Solutions Architect, experience with PostgreSQL and Redis.
                Bachelor's degree required, 3-5 years of experience preferred. Knowledge of JavaScript, TypeScript, 
                Node.js, and CI/CD pipelines is essential. Experience with Agile development and Scrum methodology.
                """
            },
            {
                "job_title": "Full Stack Developer",
                "company": "StartupXYZ",
                "job_description": """
                Looking for a Full Stack Developer proficient in JavaScript, React, Node.js, and MongoDB. 
                Must have 2+ years of experience with modern web frameworks and RESTful APIs. 
                Experience with Git, Jenkins, and cloud platforms (AWS, Azure, GCP) preferred.
                Understanding of responsive design, HTML5, CSS3, and modern frontend build tools.
                Minimum 2 years experience, bachelor's degree in computer science or related field.
                """
            },
            {
                "job_title": "Python Developer",
                "company": "FinTech Solutions",
                "job_description": """
                Senior Python Developer needed for fintech startup. 5-7 years experience required.
                Strong background in Django, Flask, PostgreSQL, and Redis. Experience with Docker,
                Kubernetes, and AWS cloud services. Knowledge of machine learning libraries like
                TensorFlow, scikit-learn, pandas, and numpy. Certified AWS Developer preferred.
                Experience with financial systems and trading algorithms a plus. Masters degree preferred.
                """
            },
            {
                "job_title": "DevOps Engineer",
                "company": "CloudFirst Ltd",
                "job_description": """
                DevOps Engineer position requiring expertise in Terraform, Ansible, Docker, and Kubernetes.
                3+ years experience with CI/CD pipelines using Jenkins or GitLab CI. 
                AWS certification required (Solutions Architect or DevOps Engineer).
                Experience with monitoring tools like Prometheus, Grafana, and ELK stack.
                Bachelor's degree and 3-5 years of experience in infrastructure automation.
                """
            },
            {
                "job_title": "Frontend Developer",
                "company": "Digital Agency Pro",
                "job_description": """
                Front-end Developer role focusing on React, TypeScript, and modern JavaScript.
                2-4 years experience with responsive web design and cross-browser compatibility.
                Experience with state management (Redux, Context API), testing frameworks (Jest, Cypress),
                and build tools (Webpack, Vite). Knowledge of CSS preprocessors and UI libraries.
                Bachelor's degree and 2+ years of frontend development experience required.
                """
            },
            {
                "job_title": "Backend Engineer",
                "company": "ScaleUp Tech",
                "job_description": """
                Backend Engineer with expertise in Node.js, Express, and database design.
                4+ years experience with microservices, API development, and system architecture.
                Proficiency in PostgreSQL, MongoDB, Redis, and cloud platforms (AWS, GCP).
                Experience with containerization (Docker), orchestration (Kubernetes), and CI/CD.
                Strong understanding of security best practices and performance optimization.
                """
            },
            {
                "job_title": "Software Engineer II",
                "company": "Enterprise Corp",
                "job_description": """
                Mid-level Software Engineer position requiring 3+ years experience in Java, Spring Boot.
                Experience with microservices architecture, REST APIs, and database management.
                Knowledge of AWS services, Docker, and Kubernetes for cloud deployment.
                Familiarity with Agile methodologies and modern development practices.
                Bachelor's degree in Computer Science and 3-5 years relevant experience.
                """
            },
            {
                "job_title": "Mobile Developer",
                "company": "AppStudio Inc",
                "job_description": """
                React Native Developer with 2+ years experience building cross-platform applications.
                Proficiency in JavaScript, TypeScript, and mobile app development best practices.
                Experience with native iOS/Android development, app store deployment processes.
                Knowledge of state management, testing frameworks, and performance optimization.
                Bachelor's degree and 2-4 years of mobile development experience required.
                """
            }
        ]
    elif "data" in job_title_lower or "analyst" in job_title_lower:
        return [
            {
                "job_description": """
                Data Scientist position requiring 3+ years experience with Python, R, and SQL.
                Strong background in machine learning, statistical analysis, and data visualization.
                Experience with Tableau, Power BI, pandas, numpy, scikit-learn, and TensorFlow.
                AWS or Google Cloud certification preferred. Master's degree in statistics,
                mathematics, or related quantitative field. 3-5 years of experience required.
                """
            },
            {
                "job_description": """
                Business Intelligence Analyst with expertise in SQL, Tableau, and data warehousing.
                2+ years experience with ETL processes and database design. Knowledge of Python
                for data analysis and automation. Experience with cloud platforms and big data
                technologies like Spark and Hadoop. Bachelor's degree and 2-4 years experience.
                """
            },
            {
                "job_description": """
                Senior Data Engineer needed for building scalable data pipelines. 4+ years experience
                with Python, Spark, Kafka, and Airflow. Strong SQL skills and experience with
                cloud data platforms (AWS, GCP, Azure). Knowledge of data modeling and warehousing
                concepts. Experience with real-time data processing and distributed systems.
                Bachelor's degree in computer science and 4-6 years relevant experience.
                """
            }
        ]
    elif "cyber" in job_title_lower or "security" in job_title_lower:
        return [
            {
                "job_description": """
                Cybersecurity Analyst position requiring 3+ years experience in information security.
                CISSP, CISM, or Security+ certification required. Experience with SIEM tools,
                vulnerability assessment, and incident response. Knowledge of network security,
                firewalls, and intrusion detection systems. Understanding of compliance frameworks
                like SOC2, ISO 27001. Bachelor's degree and 3-5 years security experience required.
                """
            },
            {
                "job_description": """
                Senior Security Engineer with expertise in cloud security (AWS, Azure, GCP).
                5+ years experience with security architecture and risk assessment. 
                Certified Ethical Hacker (CEH) or equivalent certification preferred.
                Experience with security tools like Nessus, Wireshark, and penetration testing.
                Strong background in cryptography and secure coding practices. Masters preferred.
                """
            },
            {
                "job_description": """
                Information Security Specialist focusing on threat analysis and incident response.
                2-4 years experience with security monitoring and forensics. GCIH or GCFA
                certification preferred. Experience with threat intelligence platforms and
                malware analysis. Knowledge of scripting languages (Python, PowerShell) for
                automation. Bachelor's degree in cybersecurity or related field required.
                """
            }
        ]
    else:
        # Generic mock data for other job titles
        return [
            {
                "job_description": """
                Professional position requiring 2-5 years of relevant experience. Bachelor's degree
                preferred. Strong communication skills and ability to work in team environment.
                Experience with project management tools and methodologies. Knowledge of industry
                best practices and current technologies. Certification in relevant field preferred.
                """
            },
            {
                "job_description": """
                Entry to mid-level position seeking candidates with 1-3 years experience.
                Technical skills in relevant software and tools required. Strong analytical
                and problem-solving abilities. Experience with data analysis and reporting.
                Bachelor's degree in related field. Professional certifications a plus.
                """
            }
        ]

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
    """Fetch job postings from JSearch API or return mock data in development"""
    
    # Check if we have API key
    if not RAPIDAPI_KEY:
        if ENVIRONMENT == "production":
            raise HTTPException(
                status_code=500, 
                detail="RapidAPI key is required in production environment. Please configure RAPIDAPI_KEY environment variable."
            )
        elif ENABLE_MOCK_DATA:
            print("🧪 Using mock data for development/testing - RAPIDAPI_KEY not configured")
            return get_mock_jobs(job_title, location)
        else:
            raise HTTPException(
                status_code=500, 
                detail="RAPIDAPI_KEY not configured and mock data is disabled. Please set RAPIDAPI_KEY or enable mock data with ENABLE_MOCK_DATA=true"
            )
    
    # Use real API
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    
    params = {
        "query": job_title,
        "page": "1",
        "num_pages": "2",  # Increased from 1 to 2 for more jobs (usually 20-30 total)
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

def extract_certifications_with_sources(text: str, job_title: str, company: str = "Unknown", job_url: str = None) -> List[Dict]:
    """Extract certifications with job source information"""
    certifications = []
    text_lower = text.lower()
    
    for pattern in CERTIFICATION_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            cert = match.group().strip()
            if cert and len(cert) > 2:
                certifications.append({
                    "name": cert,
                    "source_job": f"{job_title} at {company}",
                    "company": company,
                    "job_url": job_url
                })
    
    return certifications

def extract_technical_skills_with_sources(text: str, job_title: str, company: str = "Unknown", job_url: str = None) -> List[Dict]:
    """Extract technical skills with job source information"""
    skills = []
    text_lower = text.lower()
    
    # Keyword-based extraction
    for skill in TECH_SKILLS_KEYWORDS:
        skill_pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(skill_pattern, text_lower):
            skills.append({
                "name": skill.title(),
                "source_job": f"{job_title} at {company}",
                "company": company,
                "job_url": job_url
            })
    
    # NLP-based extraction if spaCy is available
    if nlp:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PRODUCT", "LANGUAGE"] and len(ent.text) > 2:
                # Filter for tech-related entities
                ent_lower = ent.text.lower()
                if any(tech_word in ent_lower for tech_word in ['tech', 'soft', 'program', 'develop', 'data', 'web', 'mobile', 'cloud']):
                    skills.append({
                        "name": ent.text.title(),
                        "source_job": f"{job_title} at {company}",
                        "company": company,
                        "job_url": job_url
                    })
    
    return skills

def extract_experience_with_sources(text: str, job_title: str, company: str = "Unknown", job_url: str = None) -> List[Dict]:
    """Extract years of experience with job source information"""
    experience_requirements = []
    
    for pattern in EXPERIENCE_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            exp_text = match.group().strip()
            if exp_text:
                experience_requirements.append({
                    "name": exp_text,
                    "source_job": f"{job_title} at {company}",
                    "company": company,
                    "job_url": job_url
                })
    
    return experience_requirements

def aggregate_and_rank_with_sources(items: List[Dict], top_n: int = 10) -> List[Dict[str, Any]]:
    """Aggregate items by frequency and return top N with source job information"""
    if not items:
        return []
    
    # Group by item name
    item_groups = {}
    for item in items:
        name = item["name"]
        if name not in item_groups:
            item_groups[name] = {
                "name": name,
                "count": 0,
                "sources": []
            }
        item_groups[name]["count"] += 1
        item_groups[name]["sources"].append({
            "job": item["source_job"],
            "company": item["company"],
            "job_url": item.get("job_url")
        })
    
    # Sort by count and get top N
    sorted_items = sorted(item_groups.values(), key=lambda x: x["count"], reverse=True)[:top_n]
    
    # Calculate percentages and format
    total_items = len(items)
    ranked_items = []
    
    for item in sorted_items:
        # Remove duplicate sources
        unique_sources = []
        seen_sources = set()
        for source in item["sources"]:
            source_key = f"{source['job']}-{source['company']}"
            if source_key not in seen_sources:
                unique_sources.append(source)
                seen_sources.add(source_key)
        
        ranked_items.append({
            "name": item["name"],
            "count": item["count"],
            "percentage": round((item["count"] / total_items) * 100, 1),
            "sources": unique_sources[:5]  # Limit to 5 sources for UI performance
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
            
            # Get actual job details for source tracking
            actual_job_title = job.get("job_title", "Job Posting")
            company_name = job.get("company", job.get("employer_name", "Company"))
            
            # Extract certifications, skills, and experience
            certifications = extract_certifications_with_sources(cleaned_description, actual_job_title, company_name, job.get("job_url"))
            skills = extract_technical_skills_with_sources(cleaned_description, actual_job_title, company_name, job.get("job_url"))
            experience = extract_experience_with_sources(cleaned_description, actual_job_title, company_name, job.get("job_url"))
            
            all_certifications.extend(certifications)
            all_skills.extend(skills)
            all_experience.extend(experience)
        
        # Aggregate and rank results
        top_certifications = aggregate_and_rank_with_sources(all_certifications, 10)
        top_skills = aggregate_and_rank_with_sources(all_skills, 15)
        top_experience = aggregate_and_rank_with_sources(all_experience, 8)
        
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
    """Detailed health check with environment information"""
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "mock_data_enabled": ENABLE_MOCK_DATA,
        "spacy_loaded": nlp is not None,
        "rapidapi_configured": bool(RAPIDAPI_KEY),
        "data_source": "live_api" if RAPIDAPI_KEY else ("mock_data" if ENABLE_MOCK_DATA else "none"),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
