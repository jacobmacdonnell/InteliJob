# InteliJob: All-in-One Setup Guide (Windows & Mac)

This guide will help you set up both the backend (Python) and frontend (Node.js/React) for InteliJob on **Windows** and **Mac**.

---

## 1. Prerequisites

- **Python 3.10 or 3.11** (not 3.13!)
- **Node.js 16+** (for frontend)
- **Git** (recommended)

---

## 2. Backend Setup (FastAPI + spaCy)

### **A. Windows**

Open **Command Prompt** or **PowerShell**:

```bat
REM --- Backend Setup (Windows) ---
cd backend

REM (1) Create virtual environment with Python 3.10 or 3.11
python -m venv venv

REM (2) Activate the environment
venv\Scripts\activate

REM (3) Upgrade pip (optional but recommended)
pip install --upgrade pip

REM (4) Install dependencies
pip install -r requirements.txt

REM (5) Download spaCy English model (if not auto-installed)
python -m spacy download en_core_web_sm

REM (6) Add your RapidAPI key to .env (edit as needed)
echo RAPIDAPI_KEY=your_actual_key_here > .env

REM (7) Start the backend server
python start.py
```

---

### **B. Mac/Linux**

Open **Terminal**:

```bash
# --- Backend Setup (Mac/Linux) ---
cd backend

# (1) Create virtual environment with Python 3.10 or 3.11
python3 -m venv venv

# (2) Activate the environment
source venv/bin/activate

# (3) Upgrade pip (optional but recommended)
pip install --upgrade pip

# (4) Install dependencies
pip install -r requirements.txt

# (5) Download spaCy English model (if not auto-installed)
python -m spacy download en_core_web_sm

# (6) Add your RapidAPI key to .env (edit as needed)
echo "RAPIDAPI_KEY=your_actual_key_here" > .env

# (7) Start the backend server
python start.py
```

---

## 3. Frontend Setup (React/Vite)

### **A. Windows, Mac, or Linux**

Open a **new terminal** in the project root (not backend):

```bash
# --- Frontend Setup ---
# (1) Install Node.js dependencies
npm install

# (2) Start the frontend dev server
npm run dev
```

- The frontend will run at: [http://localhost:5173](http://localhost:5173)
- The backend will run at: [http://localhost:8000](http://localhost:8000)

---

## 4. Test Everything

- Visit [http://localhost:5173](http://localhost:5173) in your browser.
- Try searching for a job title (e.g., "Software Engineer").
- If you see live job data, your RapidAPI key is working!

---

## 5. Troubleshooting

- If you see errors about missing dependencies, double-check your Python version and virtual environment.
- If you see "RAPIDAPI_KEY not configured", make sure your `.env` file is in the `backend` folder and contains your key.
- For spaCy errors, run: `python -m spacy download en_core_web_sm`

---

## 6. Notes

- You can use any terminal (Command Prompt, PowerShell, Git Bash, Terminal, iTerm, etc.)
- For production, see the deployment guides in the `docs/` folder.

---

**Happy coding! 🚀** 