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

**Full-stack checks:**
```bash
npm run check:fullstack
```

**Environment Variables:**
- `RAPIDAPI_KEY` — Required for live job data (get one at [RapidAPI JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch))
- `VITE_API_BASE_URL` — Frontend API endpoint (default: `http://localhost:8000`)
- `ADMIN_API_KEY` — Required for backend `/history` and `/stats` access
- `VITE_ADMIN_API_KEY` — Optional frontend header value for calling protected `/history` and `/stats`
- `SCAN_RETENTION_DAYS` — Optional backend retention window in days (default: `0` = keep all by age)
- `MAX_SCAN_ROWS` — Optional backend cap on persisted scans (default: `0` = no row cap)
- `HOST` — Backend bind host (default: `127.0.0.1` for local-only safety; set `0.0.0.0` only if you need LAN/container access)
- `CORS_ORIGINS` — Optional comma-separated allowed frontend origins for backend CORS (default: `http://localhost:5173,http://localhost:3000`)

**`.env` file locations (local setup):**
- Put backend-only variables in `backend/.env` (`RAPIDAPI_KEY`, `ADMIN_API_KEY`, `SCAN_RETENTION_DAYS`, `MAX_SCAN_ROWS`).
- Put frontend variables in root `.env.local` (`VITE_API_BASE_URL`, optional `VITE_ADMIN_API_KEY`).

**Admin key note:**
- If the frontend directly calls `/history` and `/stats`, `VITE_ADMIN_API_KEY` must match backend `ADMIN_API_KEY`.
- Using different values will return `401 Unauthorized` for those frontend requests.
- `VITE_*` values are visible in the browser bundle, so this is suitable for local/personal use only.

**Trend-history tuning:**
- By default, retention is disabled so all scan history is kept locally.
- If you want storage guardrails later, set `SCAN_RETENTION_DAYS` and/or `MAX_SCAN_ROWS` to non-zero values (for example `730` and `50000`).

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
