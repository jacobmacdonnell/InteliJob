# InteliJob 🔍

**Find out which certifications employers actually want.**

A personal job market research tool that scans live job postings and ranks certifications, skills, and requirements by how often they appear — so you know exactly what to pursue for your career.

---

## ✨ What It Does

1. **Search** — Enter a job title (e.g., "Cybersecurity Analyst") and optional location
2. **Analyze** — Scans ~100 live job postings via the JSearch API
3. **Rank** — Extracts and ranks certifications, skills, and education by demand, with links back to source job posts

---

## 🚀 Quick Start

### Local Development

**Prerequisites:**
- Node.js 16+ and npm
- Python 3.9+

**Frontend:**
```bash
npm install
npm run dev
# Visit http://localhost:5173
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python start.py
# API at http://localhost:8000
```

**Environment Variables:**
- `RAPIDAPI_KEY` — Required for live job data (get one at [RapidAPI JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch))
- `VITE_API_BASE_URL` — Frontend API endpoint (default: `http://localhost:8000`)

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Chakra UI + Vite
- **Backend:** FastAPI + regex-based extraction + spaCy (optional NLP)
- **Data Source:** JSearch API (RapidAPI)
- **Deployment:** Netlify (frontend) + Render (backend)

---

## 📊 Example Searches

- "Cybersecurity Analyst" — see which security certs are most in demand
- "SOC Analyst" — compare cert requirements vs cybersecurity analyst
- "Cloud Security Engineer" — find cloud-specific cert demand
- "Security Engineer" in "Remote" — remote-specific requirements

---

## 📄 License

MIT License
