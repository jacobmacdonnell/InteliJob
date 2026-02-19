# InteliJob 🔍

**Find out which cybersecurity certifications employers actually want.**

InteliJob scans live job postings and ranks certifications by real employer demand. Paste in a job title, and it tells you which certs show up the most — so you can study smarter, not harder.

---

## 🚀 Quick Start

**Just download and run — no install required.**

1. Grab `InteliJob.exe` from the [Releases](https://github.com/JacobMacdonnell/InteliJob/releases) page
2. Double-click it
3. Your browser opens automatically to `http://localhost:8000`

> You'll need a free [RapidAPI](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) key to run live scans. Enter it in the app when prompted.

---

## ✨ What It Does

- Searches multiple variations of a job title (e.g. "SOC Analyst" also checks "Security Analyst", "Cyber Analyst", etc.)
- Extracts cert mentions from job descriptions using pattern matching
- Ranks certs by how often they appear across postings
- Shows trends over time with scan history
- Runs entirely on your machine — your data stays local (SQLite)

---

## 🛠️ Build It Yourself

If you want to build the `.exe` from source:

### Prerequisites
- Node.js 18+
- Python 3.9+

### Steps

```bash
# Clone the repo
git clone https://github.com/JacobMacdonnell/InteliJob.git
cd InteliJob

# Install dependencies
npm install
cd backend && pip install -r requirements.txt && cd ..

# Set up your API key
cp backend/.env.example backend/.env
# Edit backend/.env and add your RAPIDAPI_KEY

# Build the standalone executable
python build_app.py
```

Your executable will be in the `dist/` folder.

### Local Development

```bash
npm run dev:frontend   # React dev server
npm run dev:backend    # FastAPI dev server
```

---

## 📁 Project Structure

```
frontend/       → React + TypeScript UI (Chakra UI)
backend/        → FastAPI API + SQLite storage
build_app.py    → Builds the standalone .exe with PyInstaller
```

---

## ⚙️ Environment Variables

All config lives in `backend/.env`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RAPIDAPI_KEY` | **Yes** | — | Your JSearch API key |
| `ADMIN_API_KEY` | No | — | Protects `/history` and `/stats` endpoints |
| `PORT` | No | `8000` | Server port |
| `SCAN_RETENTION_DAYS` | No | `0` (off) | Auto-delete scans older than N days |
| `MAX_SCAN_ROWS` | No | `0` (off) | Cap total stored scans |

---

## 📄 License

MIT — see [LICENSE](LICENSE)
