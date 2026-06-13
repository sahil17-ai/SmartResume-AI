import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import resume, predict, jd_match, auth, admin
from routes import ai_tools, parser as pdf_parser
import uvicorn
from dotenv import load_dotenv
import os
load_dotenv()

from models.database import create_tables

app = FastAPI(title="SmartResume AI API", version="1.0.0")

@app.on_event("startup")
def on_startup():
    create_tables()


DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "https://smartresume-clean.vercel.app",
]
EXTRA_ORIGINS = [o.strip().rstrip("/") for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
ALLOWED_ORIGINS = list(dict.fromkeys(DEFAULT_ORIGINS + EXTRA_ORIGINS))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(predict.router, prefix="/api/predict", tags=["predict"])
app.include_router(jd_match.router, prefix="/api/jd", tags=["jd"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(ai_tools.router, prefix="/api/ai", tags=["ai"])
app.include_router(pdf_parser.router, prefix="/api/parser", tags=["parser"])


@app.get("/")
def root():
    return {"status": "SmartResume AI API running", "version": "1.0.0"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
