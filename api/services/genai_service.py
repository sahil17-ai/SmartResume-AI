"""
Gemini AI Service — handles all generative AI calls for SmartResume.
"""
import os
import json
import time
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAMES = ["gemini-flash-latest", "gemini-1.5-flash"]
models = [genai.GenerativeModel(name) for name in MODEL_NAMES]

def _ask(prompt: str) -> str:
    """Send a prompt to Gemini and return the text response."""
    if not GEMINI_API_KEY:
        raise RuntimeError("Missing GEMINI_API_KEY in backend/.env")
    
    last_error = None
    for model in models:
        for attempt in range(2):
            try:
                try:
                    response = model.generate_content(prompt, request_options={"timeout": 30})
                except TypeError:
                    # Backward compatibility for older SDKs that may not accept request_options.
                    response = model.generate_content(prompt)

                text = getattr(response, "text", None)
                if text and text.strip():
                    return text.strip()
                last_error = RuntimeError("Empty response from Gemini")
            except Exception as e:
                last_error = e
            time.sleep(0.5 * (attempt + 1))

    raise RuntimeError(f"AI generation failed after retry/fallback: {str(last_error)}")


def optimize_bullet_points(bullets: str, job_description: str = "") -> str:
    """
    Takes raw bullet points and optionally a JD, returns ATS-optimized professional bullets.
    """
    jd_context = f"\n\nJob Description:\n{job_description}" if job_description else ""
    
    prompt = f"""You are an expert resume writer and ATS optimization specialist.

Transform these raw bullet points into highly professional, ATS-optimized resume bullets.
Rules:
- Start each bullet with a strong action verb (Developed, Architected, Led, Optimized, Built, etc.)
- Add quantifiable metrics where reasonable (%, numbers, time saved, users, etc.)
- Keep each bullet under 2 lines
- Use relevant technical keywords naturally
- Do NOT make up false information — only enhance what's given
- Return ONLY the bullet points, one per line, starting with •{jd_context}

Raw input:
{bullets}

Optimized bullets:"""
    
    return _ask(prompt)


def generate_cover_letter(resume_data: dict, job_description: str, company_name: str = "", job_title: str = "") -> str:
    """
    Generate a personalized cover letter based on resume data and JD.
    """
    personal = resume_data.get("personal", {})
    skills = resume_data.get("skills", {})
    experience = resume_data.get("experience", [])
    projects = resume_data.get("projects", [])
    
    skills_text = ", ".join([v for v in skills.values() if v]) if skills else ""
    exp_text = " | ".join([f"{e.get('role')} at {e.get('company')}" for e in experience if e.get("role")]) if experience else ""
    proj_text = " | ".join([p.get("title", "") for p in projects if p.get("title")]) if projects else ""
    
    prompt = f"""You are a professional cover letter writer.

Write a compelling, personalized cover letter for this candidate.

Candidate Info:
- Name: {personal.get('name', 'Applicant')}
- Title: {personal.get('title', '')}
- Summary: {personal.get('summary', '')}
- Skills: {skills_text}
- Experience: {exp_text}
- Projects: {proj_text}

Job Details:
- Company: {company_name or 'the company'}
- Role: {job_title or 'the position'}
- Job Description: {job_description}

Rules:
- Write 3-4 paragraphs
- Be enthusiastic but professional
- Highlight specific skills that match the JD
- Show understanding of the company/role
- End with a strong call to action
- Do NOT use clichés like "I am writing to express my interest"
- Format: Just the letter text, no headers needed

Cover Letter:"""
    
    return _ask(prompt)


def generate_interview_questions(resume_data: dict, job_description: str = "") -> dict:
    """
    Generate likely interview questions and model answers based on resume + JD.
    """
    personal = resume_data.get("personal", {})
    skills = resume_data.get("skills", {})
    experience = resume_data.get("experience", [])
    projects = resume_data.get("projects", [])
    
    resume_summary = f"""
Name: {personal.get('name', '')} | Role: {personal.get('title', '')}
Skills: {', '.join([v for v in skills.values() if v])}
Experience: {' | '.join([f"{e.get('role')} at {e.get('company')}" for e in experience if e.get('role')])}
Projects: {' | '.join([p.get('title', '') for p in projects if p.get('title')])}
Summary: {personal.get('summary', '')}
"""
    
    jd_section = f"\nJob Description:\n{job_description}" if job_description else ""
    
    prompt = f"""You are an expert interview coach.

Based on this candidate's resume and the job description, generate 8 interview questions with model answers.

Resume Summary:{resume_summary}{jd_section}

Generate exactly 8 questions in this JSON format:
[
  {{
    "type": "HR/Technical/Behavioral",
    "question": "Question text",
    "tip": "Brief tip on how to answer",
    "sample_answer": "A strong 2-3 sentence sample answer referencing their specific experience"
  }}
]

Include a mix: 3 Technical, 3 HR/Behavioral, 2 Project-specific.
Return ONLY the JSON array, no other text."""
    
    raw = _ask(prompt)
    # Clean and parse JSON
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    
    try:
        questions = json.loads(raw)
    except Exception:
        questions = [{"type": "General", "question": raw, "tip": "", "sample_answer": ""}]
    
    return {"questions": questions, "candidate_name": personal.get("name", "Candidate")}


def parse_resume_pdf_text(text: str) -> dict:
    """
    Given extracted PDF text, use Gemini to parse it into our formData JSON format.
    """
    prompt = f"""You are a resume parser. Extract all information from this resume text and return it as JSON matching EXACTLY this structure:

{{
  "personal": {{
    "name": "", "title": "", "email": "", "phone": "", "location": "",
    "linkedin": "", "github": "", "summary": ""
  }},
  "education": [
    {{"degree": "", "college": "", "year": "", "cgpa": "", "relevant_courses": ""}}
  ],
  "experience": [
    {{"company": "", "role": "", "duration": "", "location": "", "description": ""}}
  ],
  "skills": {{
    "languages": "", "frameworks": "", "databases": "", "cloud": "", "ml_tools": "", "tools": ""
  }},
  "projects": [
    {{"title": "", "tech": "", "link": "", "description": ""}}
  ],
  "certifications": [
    {{"name": "", "issuer": "", "year": "", "link": ""}}
  ],
  "achievements": {{"items": ""}},
  "internships": [
    {{"company": "", "role": "", "duration": "", "stipend": "", "description": ""}}
  ]
}}

Resume Text:
{text[:4000]}

Rules:
- Fill ALL fields you can find. Leave empty string for missing fields.
- For arrays, include all items found.
- Return ONLY the JSON object, no other text."""
    
    raw = _ask(prompt)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    
    try:
        return json.loads(raw)
    except Exception:
        return {}
