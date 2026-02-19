# InteliJob 🔍

**Find out which certifications employers actually want.**

InteliJob is a job market research tool that scans live job postings and ranks certifications, skills, and requirements by employer demand. It is designed to help cybersecurity professionals make data-informed decisions about what to study next.

---

## ✨ Features

- Multi-title search expansion for common cybersecurity role families
- Certification extraction and ranking from job descriptions
- Time-range filtering and trend/history views
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

### 3) Run locally

**Backend:**
```bash
cd backend
python start.py
```

**Frontend:**
```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

### 4) Run full checks

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

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 License

MIT — see [LICENSE](LICENSE)
