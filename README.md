# InteliJob 🔍

**Find out which cybersecurity certifications employers actually want.**

InteliJob scans live job postings and ranks certifications by real employer demand. Paste in a job title, and it tells you which certs show up the most — so you can study smarter, not harder.

---

## 🚀 Quick Start

**Just download and run — no install required.**

1. Grab `InteliJob.exe` from the [Releases](https://github.com/JacobMacdonnell/InteliJob/releases) page
2. Create a `.env` file in the same folder as the `.exe` containing your free [RapidAPI JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) key:
   ```env
   RAPIDAPI_KEY=your_key_here
   ```
3. Double-click `InteliJob.exe`
4. Your browser will open automatically to `http://localhost:8000`

---

## ✨ What It Does

- Searches multiple variations of a job title (e.g. "SOC Analyst" also checks "Security Analyst", "Cyber Analyst", etc.)
- Extracts cert mentions from job descriptions using pattern matching
- Ranks certs by how often they appear across postings
- Shows trends over time with scan history
- Runs entirely on your machine — your data stays local (SQLite)

---

## 🛠️ Build It Yourself

### Prerequisites
- Node.js 18+
- Python 3.9+

### Steps

```bash
git clone https://github.com/JacobMacdonnell/InteliJob.git
cd InteliJob

# Install dependencies
npm install
cd backend && pip install -r requirements.txt && cd ..

# Set up your API key
cp backend/.env.example backend/.env
# Edit backend/.env and add your RAPIDAPI_KEY

# Build the standalone executable
python tools/build_app.py
```

Your `.exe` will be in the `dist/` folder.

### Local Dev

```bash
npm run dev:frontend   # React dev server on :5173
npm run dev:backend    # FastAPI dev server on :8000
```

---

## 📁 Structure

```
frontend/       → React + TypeScript UI (Chakra UI)
backend/        → FastAPI API + SQLite storage
tools/          → Build script + lint config (dev-only)
```

---

## ⚙️ Config

All config lives in `.env` (copy from `backend/.env.example` when building from source). Place this file directly next to `InteliJob.exe` if running the standalone release.

| Variable | Required | Description |
|----------|----------|-------------|
| `RAPIDAPI_KEY` | **Yes** | Your [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) key |

---

## 📄 License

MIT — see [LICENSE](LICENSE)
