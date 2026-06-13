"""
AI Selection Predictor
Rule-based scoring (70%) + ML model (30%) hybrid.
Domain-aware: Tech / Finance / HR / Marketing
"""

import re, os, pickle
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional

_MODEL = None

def _get_model():
    global _MODEL
    if _MODEL is None:
        model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
        if os.path.exists(model_path):
            with open(model_path, "rb") as f:
                _MODEL = pickle.load(f)
    return _MODEL

DOMAIN_SKILLS = {
    "tech": {
        "high": {"python": 10, "react": 9, "node.js": 8, "docker": 10, "kubernetes": 10,
            "aws": 10, "tensorflow": 9, "pytorch": 9, "sql": 7, "postgresql": 8,
            "mongodb": 7, "redis": 8, "golang": 9, "typescript": 8, "graphql": 7,
            "fastapi": 8, "django": 7, "flask": 6, "spark": 9, "kafka": 9,
            "elasticsearch": 8, "ci/cd": 8, "microservices": 9, "system design": 8},
        "medium": {"javascript": 6, "java": 6, "c++": 6, "html": 3, "css": 3,
            "mysql": 5, "sqlite": 4, "git": 5, "linux": 6, "rest api": 5,
            "pandas": 6, "numpy": 5, "matplotlib": 4, "scikit-learn": 7},
    },
    "finance": {
        "high": {"financial modeling": 10, "excel": 9, "vba": 8, "sql": 8, "bloomberg": 9,
            "valuation": 10, "dcf": 9, "python": 8, "tableau": 7, "power bi": 8,
            "ifrs": 9, "gaap": 9, "risk management": 9, "derivatives": 8, "cfa": 10},
        "medium": {"accounting": 6, "quickbooks": 5, "sap": 6, "budgeting": 5,
            "forecasting": 5, "audit": 6, "tax": 5, "pivot tables": 4},
    },
    "hr": {
        "high": {"recruitment": 10, "talent acquisition": 10, "hris": 9, "workday": 9,
            "payroll": 8, "performance management": 9, "onboarding": 8, "shrm": 9,
            "employment law": 9, "compensation": 8, "succession planning": 8},
        "medium": {"bamboohr": 6, "linkedin recruiter": 6, "ats": 6, "training": 5,
            "employee relations": 5, "diversity": 5, "engagement": 4},
    },
    "marketing": {
        "high": {"seo": 10, "google analytics": 9, "sem": 9, "social media": 8,
            "content strategy": 9, "hubspot": 8, "salesforce": 8, "email marketing": 8,
            "ppc": 9, "brand management": 9, "marketing automation": 9, "a/b testing": 8},
        "medium": {"canva": 5, "photoshop": 6, "copywriting": 6, "wordpress": 5,
            "mailchimp": 5, "hootsuite": 4, "facebook ads": 7},
    },
}

@dataclass
class PredictionResult:
    overall_score: float
    breakdown: List[Dict]
    suggestions: List[Dict]
    grade: str
    interpretation: str
    ml_score: Optional[float] = None
    selection_probability: Optional[float] = None
    domain: str = "tech"

def compute_skill_score(skills_data: dict, domain: str = "tech") -> Tuple[float, List[str], List[str]]:
    high = DOMAIN_SKILLS.get(domain, DOMAIN_SKILLS["tech"])["high"]
    medium = DOMAIN_SKILLS.get(domain, DOMAIN_SKILLS["tech"])["medium"]
    all_skills = " ".join(str(v) for v in skills_data.values()).lower()
    matched_high = [(k, v) for k, v in high.items() if k in all_skills]
    matched_medium = [(k, v) for k, v in medium.items() if k in all_skills]
    raw_score = sum(v for _, v in matched_high) + sum(v * 0.5 for _, v in matched_medium)
    normalized = min(100, (raw_score / 60) * 100)
    return normalized, [k for k, _ in matched_high], [k for k, _ in matched_medium]

def compute_project_score(projects: list) -> float:
    if not projects: return 0
    score = 0
    for p in projects:
        score += 15
        if p.get("link"): score += 8
        desc = p.get("description", "")
        if len(desc) > 150: score += 10
        if any(w in desc.lower() for w in ["million", "thousand", "users", "%", "reduced", "improved", "increased"]): score += 12
    return min(100, score)

def compute_education_score(education: list) -> Tuple[float, float]:
    if not education: return 0, 0
    edu = education[0]
    cgpa_str = edu.get("cgpa", "")
    numbers = re.findall(r"[\d.]+", cgpa_str)
    if not numbers: return 30, 0
    cgpa = float(numbers[0])
    if "%" in cgpa_str and cgpa > 10: cgpa = cgpa / 10
    if cgpa >= 9.0: return 98, cgpa
    if cgpa >= 8.5: return 90, cgpa
    if cgpa >= 8.0: return 80, cgpa
    if cgpa >= 7.5: return 70, cgpa
    if cgpa >= 7.0: return 58, cgpa
    if cgpa >= 6.0: return 42, cgpa
    return 25, cgpa

def compute_experience_score(experience: list) -> float:
    if not experience: return 0
    score = 0
    for exp in experience:
        score += 20
        desc = exp.get("description", "")
        if len(desc) > 200: score += 15
        if any(w in desc.lower() for w in ["%", "million", "improved", "led", "built", "designed", "scaled"]): score += 15
        duration = exp.get("duration", "")
        if "present" in duration.lower() or "current" in duration.lower(): score += 10
    return min(100, score)

def compute_completeness_score(personal: dict) -> float:
    fields = ["name", "email", "phone", "location", "linkedin", "github", "summary"]
    filled = sum(1 for f in fields if personal.get(f, "").strip())
    return round((filled / len(fields)) * 100)

def compute_cert_score(certifications: list) -> float:
    return min(100, len(certifications) * 22 + 10)

def generate_suggestions(scores: dict, skills_matched: list, form_data: dict, domain: str = "tech") -> List[Dict]:
    suggestions = []
    personal = form_data.get("personal", {})
    projects = form_data.get("projects", [])
    experience = form_data.get("experience", [])
    certifications = form_data.get("certifications", [])
    high = DOMAIN_SKILLS.get(domain, DOMAIN_SKILLS["tech"])["high"]

    if scores["skills"] < 70:
        top_missing = [k for k in high if k not in [s.lower() for s in skills_matched]][:4]
        suggestions.append({"text": f"Add in-demand {domain} skills: {', '.join(top_missing)}", "impact": "+15%", "priority": "high", "category": "skills"})

    if domain == "tech":
        if "docker" not in " ".join(skills_matched).lower():
            suggestions.append({"text": "Add Docker & containerization to skills", "impact": "+8%", "priority": "high", "category": "skills"})
        if not any(c in " ".join(skills_matched).lower() for c in ["aws", "gcp", "azure", "cloud"]):
            suggestions.append({"text": "Add cloud platform certification (AWS/GCP/Azure)", "impact": "+10%", "priority": "high", "category": "skills"})
    elif domain == "finance":
        if "cfa" not in " ".join(skills_matched).lower():
            suggestions.append({"text": "Pursue CFA certification for significant career boost", "impact": "+12%", "priority": "high", "category": "skills"})
    elif domain == "marketing":
        if "google analytics" not in " ".join(skills_matched).lower():
            suggestions.append({"text": "Add Google Analytics certification", "impact": "+10%", "priority": "high", "category": "skills"})

    if len(projects) < 3:
        suggestions.append({"text": f"Add {3 - len(projects)} more projects with links", "impact": "+12%", "priority": "high", "category": "projects"})

    for p in projects:
        if not p.get("link"):
            suggestions.append({"text": "Add GitHub/live links to all projects", "impact": "+8%", "priority": "medium", "category": "projects"})
            break

    if not personal.get("linkedin"):
        suggestions.append({"text": "Add LinkedIn profile URL", "impact": "+5%", "priority": "medium", "category": "profile"})
    if not personal.get("github") and domain == "tech":
        suggestions.append({"text": "Add GitHub profile URL", "impact": "+5%", "priority": "medium", "category": "profile"})
    if not personal.get("summary") or len(personal.get("summary", "")) < 100:
        suggestions.append({"text": "Write a compelling 3-4 sentence professional summary", "impact": "+7%", "priority": "medium", "category": "profile"})

    if not experience:
        suggestions.append({"text": "Add internship or work experience (even personal projects count)", "impact": "+20%", "priority": "high", "category": "experience"})
    elif any(not e.get("description") or len(e.get("description", "")) < 100 for e in experience):
        suggestions.append({"text": "Expand experience with quantified achievements (numbers, %)", "impact": "+12%", "priority": "high", "category": "experience"})

    if len(certifications) == 0:
        suggestions.append({"text": "Add industry certifications (AWS, Google, Coursera, etc.)", "impact": "+10%", "priority": "medium", "category": "certifications"})

    return sorted(suggestions, key=lambda x: {"high": 0, "medium": 1, "low": 2}[x["priority"]])[:8]

def predict_selection(form_data: dict) -> PredictionResult:
    domain = form_data.get("domain", "tech").lower()
    skills_data = form_data.get("skills", {})
    education = form_data.get("education", [])
    experience = form_data.get("experience", [])
    projects = form_data.get("projects", [])
    certifications = form_data.get("certifications", [])
    personal = form_data.get("personal", {})

    skill_score, matched_skills, medium_skills = compute_skill_score(skills_data, domain)
    project_score = compute_project_score(projects)
    edu_score, cgpa = compute_education_score(education)
    exp_score = compute_experience_score(experience)
    completeness = compute_completeness_score(personal)
    cert_score = compute_cert_score(certifications)

    scores = {"skills": skill_score, "projects": project_score, "education": edu_score,
              "experience": exp_score, "completeness": completeness, "certifications": cert_score}
    weights = {"skills": 0.25, "projects": 0.22, "education": 0.15, "experience": 0.22, "completeness": 0.08, "certifications": 0.08}
    rule_score = round(sum(scores[k] * weights[k] for k in scores))

    ml_score = None
    selection_probability = None
    model = _get_model()
    if model is not None:
        features = np.array([[skill_score, project_score, edu_score, exp_score, completeness, cert_score]])
        proba = model.predict_proba(features)[0]
        selection_probability = round(proba[1] * 100, 1)
        ml_score = round(selection_probability)
        overall = round(rule_score * 0.70 + ml_score * 0.30)
    else:
        overall = rule_score

    overall = max(0, min(100, overall))

    breakdown = [
        {"label": "Skills", "score": round(skill_score), "color": "#6c63ff", "weight": "25%", "detail": f"{len(matched_skills)} high-demand skills matched"},
        {"label": "Projects", "score": round(project_score), "color": "#00e5a0", "weight": "22%", "detail": f"{len(projects)} projects listed"},
        {"label": "Education", "score": round(edu_score), "color": "#f59e0b", "weight": "15%", "detail": f"CGPA: {cgpa:.1f}" if cgpa else "Not provided"},
        {"label": "Experience", "score": round(exp_score), "color": "#ec4899", "weight": "22%", "detail": f"{len(experience)} positions"},
        {"label": "Profile", "score": round(completeness), "color": "#06b6d4", "weight": "8%", "detail": "Profile completeness"},
        {"label": "Certifications", "score": round(cert_score), "color": "#8b5cf6", "weight": "8%", "detail": f"{len(certifications)} certs"},
    ]

    if overall >= 85: grade, interpretation = "A+", "Exceptional profile. You're in the top 5% of applicants."
    elif overall >= 75: grade, interpretation = "A", "Strong profile. High probability of interview calls."
    elif overall >= 65: grade, interpretation = "B+", "Good profile. A few improvements can make a big difference."
    elif overall >= 55: grade, interpretation = "B", "Average profile. Focus on the high-priority suggestions."
    elif overall >= 40: grade, interpretation = "C", "Below average. Significant improvements needed."
    else: grade, interpretation = "D", "Weak profile. Follow all suggestions to rebuild your resume."

    suggestions = generate_suggestions(scores, matched_skills, form_data, domain)

    return PredictionResult(overall_score=overall, breakdown=breakdown, suggestions=suggestions,
        grade=grade, interpretation=interpretation, ml_score=ml_score,
        selection_probability=selection_probability, domain=domain)
