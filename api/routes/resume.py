from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from models.database import get_db, Resume, User
from routes.auth import get_current_user

router = APIRouter()

class ResumeCreate(BaseModel):
    title: str = "My Resume"
    template_id: str = "fresher"
    form_data: Dict[str, Any] = {}
    style_data: Dict[str, Any] = {}

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[str] = None
    form_data: Optional[Dict[str, Any]] = None
    style_data: Optional[Dict[str, Any]] = None

@router.post("/create")
def create_resume(
    body: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_resume = Resume(
        user_id=current_user.id,
        title=body.title,
        template_id=body.template_id,
        form_data=body.form_data,
        style_data=body.style_data
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    return {"id": new_resume.id, "message": "Resume created successfully"}

@router.get("/")
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    # Serialize cleanly
    return [
        {
            "id": r.id,
            "title": r.title,
            "template_id": r.template_id,
            "updated_at": r.updated_at
        }
        for r in resumes
    ]

@router.get("/{resume_id}")
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {
        "id": resume.id,
        "title": resume.title,
        "template_id": resume.template_id,
        "form_data": resume.form_data,
        "style_data": resume.style_data,
        "updated_at": resume.updated_at
    }

@router.put("/{resume_id}")
def update_resume(
    resume_id: int,
    body: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if body.title is not None:
        resume.title = body.title
    if body.template_id is not None:
        resume.template_id = body.template_id
    if body.form_data is not None:
        resume.form_data = body.form_data
    if body.style_data is not None:
        resume.style_data = body.style_data

    db.commit()
    return {"message": "Resume updated"}

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted"}

