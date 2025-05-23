# InteliJob - Quick Start 🚀

Get your InteliJob running in 3 steps!

## 🎯 Prerequisites

- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **RapidAPI key** (optional, for live data)

## ⚡ Quick Setup

### 1. Start Backend
```bash
cd backend
python start.py  # Automated setup + server start
```

### 2. Start Frontend (new terminal)
```bash
cd ..
npm run dev
```

### 3. Open Application
Visit: **http://localhost:5173**

## ✅ Verify Setup

Run the end-to-end test:
```bash
python test_e2e.py
```

Should show: **5/5 tests passed** ✅

## 🔑 Add Live Data (Optional)

1. Get free API key: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch/
2. Create `backend/.env`:
   ```
   RAPIDAPI_KEY=your_actual_key_here
   ```
3. Restart backend server

## 📖 Full Documentation

For comprehensive guides, troubleshooting, and deployment:

👉 **[Complete Documentation](./docs/README.md)**

- **[Setup & Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)**
- **[Backend API Guide](./docs/BACKEND_GUIDE.md)**
- **[Project Status](./docs/SETUP_COMPLETE.md)**

## 🎉 That's It!

Your InteliJob should now be running with:
- ✅ **FastAPI backend** with spaCy NLP (Port 8000)
- ✅ **React frontend** with Chakra UI (Port 5173)
- ✅ **Live job analysis** (with API key)
- ✅ **Full test coverage** 