<<<<<<< HEAD
<<<<<<< HEAD
# SmartResume AI 🚀
### Industry-Level SaaS Resume Builder with AI Selection Predictor

---

## 📁 Project Structure

```
smartresume/
├── frontend/               ← React App (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      ← Animated hero, features, CTA
│   │   │   ├── TemplateSelect.jsx   ← 6 templates with filter
│   │   │   ├── ResumeBuilder.jsx    ← Main editor (form + preview + AI)
│   │   │   └── Dashboard.jsx        ← Saved resumes
│   │   ├── components/
│   │   │   ├── AIPredictor.jsx      ← Score predictor with animated chart
│   │   │   ├── JDMatcher.jsx        ← Job description keyword match
│   │   │   ├── ResumePreview.jsx    ← Live resume preview
│   │   │   └── Customizer.jsx       ← Font, color, layout controls
│   │   ├── App.jsx                  ← Router
│   │   └── index.css                ← Design system, animations
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── backend/                ← Python FastAPI
│   ├── main.py             ← App entry, CORS, routes
│   ├── routes/
│   │   ├── resume.py       ← CRUD for resumes
│   │   ├── predict.py      ← AI score endpoint
│   │   ├── jd_match.py     ← JD keyword analysis
│   │   └── auth.py         ← Register/Login
│   ├── services/
│   │   └── predictor.py    ← ML scoring engine
│   ├── models/
│   │   └── database.py     ← SQLAlchemy models
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml      ← Run everything together
```

---

## ⚡ LOCAL SETUP (Step by Step)

### Prerequisites — Install these first:

| Tool | Download Link | Why Needed |
|------|--------------|------------|
| Node.js 20+ | https://nodejs.org | Run React frontend |
| Python 3.11+ | https://python.org | Run FastAPI backend |
| Git | https://git-scm.com | Version control |

---

### STEP 1 — Download / Clone the project

```bash
# If you got it as a zip, extract it anywhere (e.g., Desktop)
# Then open terminal and go to that folder:

cd Desktop/smartresume
```

---

### STEP 2 — Setup Frontend (React)

```bash
# Go into frontend folder
cd frontend

# Install all packages (only first time)
npm install

# Start the frontend development server
npm run dev
```

✅ You'll see:
```
  VITE v5.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser — you'll see the landing page! 🎉

---

### STEP 3 — Setup Backend (Python FastAPI)

Open a **new terminal window** (keep frontend running in the first one)

```bash
# Go into backend folder
cd Desktop/smartresume/backend

# Create a virtual environment (recommended, only first time)
python -m venv venv

# Activate it:
# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

# Install Python packages (only first time)
pip install -r requirements.txt

# Start the backend server
python main.py
```

✅ You'll see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

Backend API is live at **http://localhost:8000**
API docs auto-generated at **http://localhost:8000/docs**

---

### STEP 4 — Test Everything Works

Open browser:
- Frontend: http://localhost:5173 → Landing page with animations ✅
- Backend: http://localhost:8000 → `{"status": "SmartResume AI API running"}` ✅
- API Docs: http://localhost:8000/docs → Interactive Swagger UI ✅

---

## 🌐 HOSTING — Deploy Online (Free Options)

### Option A: Render (Recommended — Easiest Free Hosting)

**Frontend on Render:**
1. Push code to GitHub (see Git section below)
2. Go to https://render.com → Sign up free
3. Click "New +" → "Static Site"
4. Connect your GitHub repo
5. Settings:
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
6. Click Deploy → Get URL like `https://smartresume-ai.onrender.com`

**Backend on Render:**
1. Click "New +" → "Web Service"
2. Connect same GitHub repo
3. Settings:
   - Root directory: `backend`
   - Runtime: Python 3
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy → Get URL like `https://smartresume-api.onrender.com`

---

### Option B: Vercel (Frontend) + Railway (Backend)

**Frontend → Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Inside frontend folder
cd frontend
vercel

# Follow prompts → deployed in 60 seconds
# You get URL: https://smartresume-ai.vercel.app
```

**Backend → Railway:**
1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select your repo, choose `/backend` folder
4. Railway auto-detects Python and deploys ✅

---

### Option C: Docker (Best for Production)

```bash
# Make sure Docker Desktop is installed from docker.com
# From the root smartresume/ folder:

docker-compose up --build

# Wait 2-3 minutes for build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
```

---

## 📤 Push to GitHub (Required for Render/Vercel)

```bash
# 1. Create account at github.com
# 2. Create new repository named "smartresume-ai"
# 3. Run these commands from smartresume/ folder:

git init
git add .
git commit -m "Initial commit - SmartResume AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smartresume-ai.git
git push -u origin main
```

---

## 🚀 Features Built

| Feature | Location | Status |
|---------|----------|--------|
| Animated Landing Page | LandingPage.jsx | ✅ |
| 6 Resume Templates | TemplateSelect.jsx | ✅ |
| Smart Form (sections) | ResumeBuilder.jsx | ✅ |
| Live Preview | ResumePreview.jsx | ✅ |
| Font/Color Customizer | Customizer.jsx | ✅ |
| AI Score Predictor | AIPredictor.jsx + predictor.py | ✅ |
| JD Keyword Matcher | JDMatcher.jsx + jd_match.py | ✅ |
| Save to LocalStorage | ResumeBuilder.jsx | ✅ |
| REST API (FastAPI) | backend/routes/ | ✅ |
| Docker Deploy | docker-compose.yml | ✅ |

---

## 🔧 Common Issues & Fixes

**"npm not found"**
→ Install Node.js from https://nodejs.org and restart terminal

**"pip not found"**
→ Use `pip3` instead of `pip` on Mac/Linux

**"Port 5173 already in use"**
→ Run `npm run dev -- --port 3001` to use different port

**"Module not found" in Python**
→ Make sure venv is activated before running pip install

**Frontend can't connect to backend**
→ Make sure backend is running on port 8000
→ Check vite.config.js proxy settings

---

## 🔮 Next Features to Add

1. **PDF Export** — Add `reportlab` or `weasyprint` to generate downloadable PDF
2. **User Login** — JWT auth is already in auth.py, just connect frontend
3. **Save Resumes to DB** — SQLAlchemy models are ready in models/database.py
4. **Claude AI Integration** — Use Anthropic API for smarter JD rewriting
5. **Resume Score History** — Track score improvements over time
6. **Email sharing** — Send resume link via email
7. **Multiple language support** — Hindi, Marathi resume templates

---

## 💡 Tech Stack Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite | Fast, modern, component-based |
| Styling | Pure CSS (custom) | No heavy UI library, full control |
| Backend | FastAPI (Python) | Fast, auto-docs, async |
| Database | SQLite → PostgreSQL | Simple to start, scales to production |
| ML/AI | scikit-learn + custom scoring | Your existing Python/ML knowledge |
| Deployment | Docker + Nginx | Industry standard |
| Hosting | Render / Vercel / Railway | Free tier available |

---

Built with ❤️ — SmartResume AI
=======
# smartresume-final
>>>>>>> 44cc9801b6f6dd8f954e040f22eaf872dcb3c4b0
=======
# SmartResume-AI
>>>>>>> ef550792f7a296f65afaca245bc49580815d9e40
