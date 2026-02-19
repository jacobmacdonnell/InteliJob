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

**InteliJob is now packaged as a standalone standalone executable!**

You no longer need to install Python, Node.js, or run any servers yourself.

1. Download the latest `InteliJob.exe` from the Releases page (or build it yourself)
2. Double-click `InteliJob.exe`
3. A terminal window will open to run the local server, and your default web browser will automatically open to `http://localhost:8000`.

*Note: You still need a RapidAPI key to run live scans. Keep your key handy to enter it in the app settings.*

---

## 🛠️ Developer Setup & Building

If you want to contribute or build the executable yourself:

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+

### 1) Install dependencies

```bash
npm install
cd backend && pip install -r requirements.txt
cd ..
```

### 2) Configure environment

```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
```

Set your `RAPIDAPI_KEY` in `backend/.env`.

### 3) Build the Standalone Executable

We provide a script that compiles the React frontend and packages the FastAPI backend into a single executable using PyInstaller:

```bash
python build_app.py
```

Once finished, your executable will be located in the `dist/` folder.

### 4) Local Development

To run the frontend and backend separately for active development:

**Backend:**
```bash
npm run dev:backend
```

**Frontend:**
```bash
npm run dev:frontend
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


## 🗺️ Open-Source Readiness Checklist

Before announcing a public release:

- Confirm CI is passing on `main`
- Verify `README.md` setup steps work from a clean clone
- Confirm `SECURITY.md` reporting channel is valid
- Remove any temporary personal/test credentials from local copies
- Create an initial release/tag with a short changelog

---

## 📁 Repository Structure

- `frontend/` — React + TypeScript app (components, context, services)
- `backend/` — FastAPI API, config, requirements, tests
- `build_app.py` — Script to compile the standalone PyInstaller executable
- `.github/workflows/` — CI checks

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 License

MIT — see [LICENSE](LICENSE)
