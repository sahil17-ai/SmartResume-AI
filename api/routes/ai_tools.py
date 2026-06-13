"""
AI Tools Routes — Bullet Optimizer, Cover Letter, Interview Prep
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.genai_service import (
    optimize_bullet_points,
    generate_cover_letter,
    generate_interview_questions,
)

router = APIRouter()


# ── Bullet Optimizer ────────────────────────────────────────────

class BulletRequest(BaseModel):
    bullets: str
    job_description: Optional[str] = ""

@router.post("/optimize-bullets")
def optimize_bullets(body: BulletRequest):
    if not body.bullets.strip():
        raise HTTPException(status_code=400, detail="Bullets text is required")
    try:
        result = optimize_bullet_points(body.bullets, body.job_description or "")
        return {"optimized": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


# ── Cover Letter Generator ───────────────────────────────────────

class CoverLetterRequest(BaseModel):
    resume_data: Dict[str, Any] = {}
    job_description: str
    company_name: Optional[str] = ""
    job_title: Optional[str] = ""

@router.post("/cover-letter")
def cover_letter(body: CoverLetterRequest):
    if not body.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required")
    try:
        result = generate_cover_letter(
            body.resume_data,
            body.job_description,
            body.company_name or "",
            body.job_title or ""
        )
        return {"cover_letter": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


# ── Interview Prep ───────────────────────────────────────────────

class InterviewRequest(BaseModel):
    resume_data: Dict[str, Any] = {}
    job_description: Optional[str] = ""

@router.post("/interview-prep")
def interview_prep(body: InterviewRequest):
    try:
        result = generate_interview_questions(
            body.resume_data,
            body.job_description or ""
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
