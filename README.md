# InteliJob 🔍

**Find out which certifications employers actually want.**

InteliJob is a job market research tool that scans live job postings and ranks certifications, skills, and requirements by employer demand. It is designed to help cybersecurity professionals make data-informed decisions about what to study next.

---

## Project Status

InteliJob is stable for personal and community use and is now being prepared for broader open-source collaboration.

If you fork this project, you can customize:
- Job title expansion logic
- Skill/cert extraction patterns
- Reporting output and weighting
- Retention and scan history policies

---

## What this project is (and is not)

- **Is:** a practical personal/community tool for cybersecurity job-market signal gathering.
- **Is not:** a guaranteed source of hiring truth or career advice.
- Results depend on data quality from external job APIs and the extraction rules in this repo.

---

## ✨ Features

- Multi-title search expansion for common cybersecurity role families
- Certification extraction and ranking from job descriptions
- Time-range filtering and trend/history views
- All-in-one dashboard view (scan + stats in one flow)
- Protected admin endpoints for scan history and statistics
- Local SQLite persistence with optional retention controls

---

## 🧰 Tech Stack

- **Frontend:** React 18, TypeScript, Chakra UI, Vite
- **Backend:** FastAPI, SQLite, regex-based extraction (+ optional spaCy)
- **Data source:** RapidAPI JSearch API

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+

### 1) Install dependencies

```bash
npm install
cd backend && pip install -r requirements.txt
```

### 2) Configure environment variables

```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
```

Set your `RAPIDAPI_KEY` in `backend/.env`.

### 3) Run locally (simple)

```bash
npm start
```

This starts both backend and frontend together.

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Stop everything with `Ctrl+C`

### 3b) Run separately (optional)

**Backend only:**
```bash
npm run start:backend
```

**Frontend only:**
```bash
npm run start:frontend
```

### 4) Run checks

```bash
npm run check:fullstack
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

- `RAPIDAPI_KEY` (required for live data)
- `ADMIN_API_KEY` (required to enable `/history` and `/stats`)
- `SCAN_RETENTION_DAYS` (optional, `0` disables age pruning)
- `MAX_SCAN_ROWS` (optional, `0` disables row-cap pruning)
- `HOST` (default `127.0.0.1`)
- `PORT` (default `8000`)
- `CORS_ORIGINS` (comma-separated allowed origins)

### Frontend (`.env.local`)

- `VITE_API_BASE_URL` (default local backend URL)
- `VITE_ADMIN_API_KEY` (optional)

> `VITE_*` values are bundled into client-side JavaScript and are visible to users. Do not place sensitive secrets there.

---

## 🔐 Security Notes for Public/Open-Source Use

- Never commit `.env` files or API keys
- Local scan DB (`backend/data/scans.db`) is intentionally git-ignored
- Use `ADMIN_API_KEY` for protected endpoints
- For responsible disclosure, see [SECURITY.md](SECURITY.md)

---

## Casual Open-Source Readiness

For a **casual open-source launch**, this repo is in good shape now:
- setup docs and env templates are present
- CI runs checks on pull requests
- security and conduct docs are included

Before public sharing, do this final 10-minute pass:
1. Create your first GitHub release/tag.
2. Pin 1–3 example use cases in the README or as issues.
3. Add one screenshot/GIF so people understand the tool quickly.

---

## 🗺️ Open-Source Readiness Checklist

Before announcing a public release:

- Confirm CI is passing on `main`
- Verify `README.md` setup steps work from a clean clone
- Confirm `SECURITY.md` reporting channel is valid
- Remove any temporary personal/test credentials from local copies
- Create an initial release/tag with a short changelog

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 License

MIT — see [LICENSE](LICENSE)
