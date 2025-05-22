# Job Intelligence Scanner Backend

A FastAPI-based backend service that analyzes job postings to extract trending skills, certifications, and experience requirements using NLP and regex pattern matching.

## Features

- **Live Job Data**: Fetches real job postings via JSearch API (RapidAPI)
- **NLP Processing**: Uses spaCy for intelligent text analysis and entity extraction
- **Skills Extraction**: Identifies technical skills, programming languages, and tools
- **Certification Detection**: Recognizes professional certifications using regex patterns
- **Experience Analysis**: Extracts years of experience requirements
- **Frequency Analysis**: Ranks extracted data by frequency and provides percentage breakdowns
- **CORS Support**: Configured for frontend integration

## Tech Stack

- **Framework**: FastAPI (Python)
- **NLP**: spaCy with English language model
- **HTTP Client**: httpx for async API calls
- **Data Processing**: Python regex and Counter for pattern matching and aggregation
- **API Integration**: JSearch API via RapidAPI

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip package manager
- RapidAPI account and JSearch API key

### Setup

1. **Get your API key**:
   - Visit [JSearch API on RapidAPI](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch/)
   - Subscribe to the free plan
   - Copy your API key

2. **Set environment variable**:
   ```bash
   export RAPIDAPI_KEY=your_rapidapi_key_here
   ```
   
   Or create a `.env` file:
   ```
   RAPIDAPI_KEY=your_rapidapi_key_here
   ```

3. **Run the setup script**:
   ```bash
   cd backend
   python start.py
   ```

   This will:
   - Install all dependencies from `requirements.txt`
   - Download the spaCy English model
   - Check your environment configuration
   - Start the FastAPI server

### Manual Setup

If you prefer manual setup:

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Install spaCy English model
python -m spacy download en_core_web_sm

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

Once running, visit:
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### POST `/analyze-jobs`

Analyzes job postings and returns extracted insights.

**Request Body**:
```json
{
  "job_title": "Software Engineer",
  "location": "San Francisco, CA",
  "time_range": "1w"
}
```

**Parameters**:
- `job_title` (required): The job title to search for
- `location` (optional): Geographic location for job search
- `time_range` (optional): Time filter - "1d", "3d", "1w", "2w", "1m"

**Response**:
```json
{
  "success": true,
  "message": "Job analysis completed successfully",
  "jobs_analyzed": 25,
  "data": {
    "certifications": [
      {
        "name": "AWS Certified Solutions Architect",
        "count": 8,
        "percentage": 32.0
      }
    ],
    "technical_skills": [
      {
        "name": "Python",
        "count": 15,
        "percentage": 60.0
      }
    ],
    "experience_requirements": [
      {
        "name": "3+ years experience",
        "count": 12,
        "percentage": 48.0
      }
    ],
    "total_jobs_found": 25,
    "jobs_with_descriptions": 23,
    "search_criteria": {
      "job_title": "Software Engineer",
      "location": "San Francisco, CA",
      "time_range": "1w"
    }
  }
}
```

### GET `/health`

Returns detailed health status of the API.

**Response**:
```json
{
  "status": "healthy",
  "spacy_loaded": true,
  "rapidapi_configured": true,
  "version": "1.0.0"
}
```

## NLP Processing

### Skills Extraction

The system identifies technical skills using a two-pronged approach:

1. **Keyword Matching**: Searches for predefined technical skills including:
   - Programming languages (Python, Java, JavaScript, etc.)
   - Web technologies (React, Angular, Node.js, etc.)
   - Databases (MySQL, PostgreSQL, MongoDB, etc.)
   - Cloud platforms (AWS, Azure, GCP, etc.)
   - DevOps tools (Docker, Kubernetes, Jenkins, etc.)

2. **NLP Entity Recognition**: Uses spaCy to identify:
   - Technology-related named entities
   - Product and organization mentions
   - Technical terminology in context

### Certification Detection

Uses comprehensive regex patterns to identify:
- Cloud certifications (AWS, Azure, GCP)
- Security certifications (CISSP, CEH, Security+)
- Project management (PMP, Scrum Master)
- Database certifications (Oracle, Microsoft)
- Network certifications (CCNA, CCNP, CompTIA)

### Experience Extraction

Identifies experience requirements using patterns like:
- "3+ years of experience"
- "minimum 5 years"
- "at least 2 years"
- "5-7 years experience"

## Configuration

Environment variables:

```bash
# Required
RAPIDAPI_KEY=your_rapidapi_key_here

# Optional
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
```

## Error Handling

The API includes comprehensive error handling:
- Invalid API keys
- Network timeouts
- Rate limiting
- Invalid job search criteria
- spaCy model loading issues

## Development

### Project Structure

```
backend/
├── main.py              # FastAPI application and main logic
├── config.py            # Configuration and settings
├── start.py             # Setup and startup script
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

### Adding New Skills or Certifications

To add new technical skills, update the `TECH_SKILLS_KEYWORDS` list in `main.py`.

To add new certification patterns, update the `CERTIFICATION_PATTERNS` list with new regex patterns.

### Testing

Test the API manually using the Swagger UI at http://localhost:8000/docs or with curl:

```bash
curl -X POST "http://localhost:8000/analyze-jobs" \
     -H "Content-Type: application/json" \
     -d '{
       "job_title": "Data Scientist",
       "location": "New York",
       "time_range": "1w"
     }'
```

## Troubleshooting

### Common Issues

1. **spaCy model not found**:
   ```bash
   python -m spacy download en_core_web_sm
   ```

2. **RAPIDAPI_KEY not configured**:
   - Ensure the environment variable is set
   - Check that the key is valid and has access to JSearch API

3. **CORS errors**:
   - Verify frontend origin is in the `cors_origins` list
   - Check that the frontend is running on the expected port

4. **No jobs found**:
   - Try broader search terms
   - Check different time ranges
   - Verify the job title and location are valid

### Performance Notes

- The API processes up to 50 jobs per request (JSearch API limit)
- NLP processing time scales with job description length
- Consider caching for production deployments

## License

This backend is part of the Job Intelligence Scanner MVP project. 