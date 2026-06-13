"""
PDF & Resume Parser Routes — Upload PDF → Auto-fill form data
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
import pdfplumber
import io
from services.genai_service import parse_resume_pdf_text

router = APIRouter()

@router.post("/pdf")
async def parse_pdf(file: UploadFile = File(...)):
    """
    Upload a resume PDF → returns JSON form_data to auto-fill the builder.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        contents = await file.read()
        text = ""
        
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF. Make sure it's not a scanned image.")
        
        parsed = parse_resume_pdf_text(text)
        
        if not parsed:
            raise HTTPException(status_code=500, detail="AI could not parse the resume. Please try a different PDF.")
        
        return {
            "success": True,
            "form_data": parsed,
            "message": "Resume parsed successfully! Review and edit the filled data."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing PDF: {str(e)}")
