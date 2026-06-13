from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List
import re

router = APIRouter()

STOP_WORDS = {
    "the","a","an","in","at","for","and","or","with","to","of","as","is","are",
    "be","this","that","will","you","we","our","your","have","has","can","must",
    "required","experience","years","strong","good","ability","knowledge","using",
    "work","team","looking","seeking","candidate","role","position","opportunity",
    "join","please","apply","minimum","preferred","plus","bonus","including","etc",
    "com","www","http","via","per","within","across","about","who","what","how",
    "when","where","why","which","they","them","their","from","into","over","under"
}

class JDMatchRequest(BaseModel):
    job_description: str
    form_data: Dict[str, Any]

def extract_keywords(text: str) -> List[str]:
    words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.\-]{1,}\b', text)
    keywords = []
    text_lower = text.lower()

    # Extract multi-word phrases first
    phrases = [
        "machine learning", "deep learning", "natural language processing",
        "computer vision", "data science", "full stack", "front end", "back end",
        "system design", "object oriented", "test driven", "ci/cd", "rest api",
        "graphql api", "sql server", "big data", "cloud computing", "agile scrum",
        "node.js", "next.js", "vue.js", "react native", "spring boot",
    ]
    for phrase in phrases:
        if phrase in text_lower:
            keywords.append(phrase)

    # Single word keywords
    for w in words:
        wl = w.lower()
        if wl not in STOP_WORDS and len(wl) > 2 and wl not in keywords:
            keywords.append(wl)

    return list(dict.fromkeys(keywords))  # deduplicate preserving order

@router.post("/match")
def match_jd(body: JDMatchRequest):
    jd_keywords = extract_keywords(body.job_description)
    resume_text = str(body.form_data).lower()

    matched = [k for k in jd_keywords if k in resume_text]
    missing = [k for k in jd_keywords if k not in resume_text]

    match_pct = round((len(matched) / max(len(jd_keywords), 1)) * 100)
    match_pct = min(95, match_pct)

    # Categorize missing keywords
    tech_missing = []
    soft_missing = []
    soft_words = {"communication","leadership","teamwork","collaboration","problem","solving","analytical","creative","proactive","detail"}

    for k in missing:
        if any(c in k for c in ["+", "#", "."]) or k[0].isupper():
            tech_missing.append(k)
        elif k in soft_words:
            soft_missing.append(k)
        else:
            tech_missing.append(k)

    return {
        "match_percentage": match_pct,
        "total_keywords": len(jd_keywords),
        "matched_count": len(matched),
        "missing_count": len(missing),
        "matched_keywords": matched[:20],
        "missing_keywords": missing[:15],
        "tech_missing": tech_missing[:10],
        "soft_missing": soft_missing[:5],
        "recommendation": (
            "Excellent match! Your resume aligns well with this role." if match_pct >= 75
            else "Good foundation. Add the missing keywords to boost ATS pass rate by 30-40%." if match_pct >= 50
            else "Low match. Tailor your skills section and summary to match the job description."
        )
    }
