from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from services.predictor import predict_selection

router = APIRouter()

class ResumeData(BaseModel):
    form_data: Dict[str, Any]

@router.post("/score")
def get_prediction(body: ResumeData):
    result = predict_selection(body.form_data)
    return {
        "overall_score": result.overall_score,
        "grade": result.grade,
        "interpretation": result.interpretation,
        "breakdown": result.breakdown,
        "suggestions": result.suggestions,
        "ml_score": result.ml_score,
        "selection_probability": result.selection_probability,
        "domain": result.domain,
    }
