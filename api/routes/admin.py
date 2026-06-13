from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from routes.auth import verify_token, hash_password, create_token
from sqlalchemy.orm import Session
from models.database import get_db, User, Resume
import os

router = APIRouter()
security = HTTPBearer(auto_error=False)

# Admin credentials from env (default for dev)
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@smartresume.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    email = verify_token(credentials.credentials)
    if email != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")
    return email

@router.post("/login")
def admin_login(body: dict):
    email = body.get("email", "")
    password = body.get("password", "")
    if email != ADMIN_EMAIL or password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    token = create_token(email)
    return {"token": token, "email": email, "role": "admin"}

@router.get("/stats")
def get_stats(admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).all()
    total_resumes = db.query(Resume).count()
    return {
        "total_users": len(users),
        "total_resumes": total_resumes,
        "users": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "created_at": u.created_at,
                "resume_count": db.query(Resume).filter(Resume.user_id == u.id).count(),
            }
            for u in users
        ]
    }

@router.delete("/users/{email}")
def delete_user(email: str, admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if email == ADMIN_EMAIL:
        raise HTTPException(status_code=400, detail="Cannot delete admin")
    db.delete(user)
    db.commit()
    return {"message": f"User {email} deleted"}

@router.post("/users/{email}/reset-password")
def reset_password(email: str, body: dict, admin=Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_password = body.get("password", "")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user.password_hash = hash_password(new_password)
    db.commit()
    return {"message": f"Password reset for {email}"}

