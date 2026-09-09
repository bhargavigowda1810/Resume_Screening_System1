from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel

from app.services.text_extractor import extract_text
from app.services.resume_parser import parse_resume
from app.services.embedding_service import generate_embedding


app = FastAPI(
    title="Resume Screening AI Service",
    description="AI/NLP service for resume processing and matching",
    version="1.0.0"
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Resume Screening AI Service is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ============================================================
# EXTRACT TEXT
# ============================================================

@app.post("/extract-text")
async def extract_resume_text(file: UploadFile = File(...)):

    allowed_extensions = {".pdf", ".docx", ".txt"}

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File name is missing."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only PDF, DOCX and TXT are allowed."
        )

    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)

    safe_filename = Path(file.filename).name
    file_path = upload_dir / safe_filename

    try:

        contents = await file.read()
        file_path.write_bytes(contents)

        extracted_text = extract_text(str(file_path))

        return {
            "fileName": file.filename,
            "fileType": file.content_type,
            "extractedText": extracted_text
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Text extraction failed: {str(e)}"
        )

    finally:

        if file_path.exists():
            file_path.unlink()


# ============================================================
# PARSE RESUME
# ============================================================

@app.post("/parse-resume")
async def parse_resume_endpoint(file: UploadFile = File(...)):

    allowed_extensions = {".pdf", ".docx", ".txt"}

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File name is missing."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only PDF, DOCX and TXT are allowed."
        )

    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)

    safe_filename = Path(file.filename).name
    file_path = upload_dir / safe_filename

    try:

        # =====================================================
        # STEP 1: READ UPLOADED FILE
        # =====================================================

        contents = await file.read()
        file_path.write_bytes(contents)

        # =====================================================
        # STEP 2: EXTRACT TEXT
        # =====================================================

        extracted_text = extract_text(str(file_path))

        if not extracted_text or not extracted_text.strip():

            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the resume."
            )

        # =====================================================
        # STEP 3: PARSE RESUME
        # =====================================================

        parsed_resume = parse_resume(extracted_text)

        # =====================================================
        # STEP 4: GENERATE RESUME EMBEDDING
        # =====================================================

        embedding = generate_embedding(extracted_text)

        # =====================================================
        # STEP 5: VALIDATE RESUME EMBEDDING
        # =====================================================

        if len(embedding) != 384:

            raise HTTPException(
                status_code=500,
                detail=f"Invalid embedding size: {len(embedding)}"
            )

        # =====================================================
        # STEP 6: RETURN COMPLETE RESPONSE
        # =====================================================

        return {
            "fileName": file.filename,
            "fileType": file.content_type,
            "extractedText": extracted_text,
            "parsedResume": parsed_resume,
            "embedding": embedding
        }

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Resume parsing failed: {str(e)}"
        )

    finally:

        if file_path.exists():
            file_path.unlink()


# ============================================================
# JOB EMBEDDING REQUEST MODEL
# ============================================================

class JobEmbeddingRequest(BaseModel):
    text: str


# ============================================================
# GENERATE JOB EMBEDDING
# ============================================================

@app.post("/generate-embedding")
async def generate_text_embedding(
    request: JobEmbeddingRequest
):

    try:

        # =====================================================
        # STEP 1: VALIDATE TEXT
        # =====================================================

        if not request.text or not request.text.strip():

            raise HTTPException(
                status_code=400,
                detail="Text cannot be empty."
            )

        # =====================================================
        # STEP 2: GENERATE EMBEDDING
        # =====================================================

        embedding = generate_embedding(
            request.text
        )

        # =====================================================
        # STEP 3: VALIDATE EMBEDDING SIZE
        # =====================================================

        if len(embedding) != 384:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Invalid embedding size: "
                    f"{len(embedding)}"
                )
            )

        # =====================================================
        # STEP 4: RETURN EMBEDDING
        # =====================================================

        return {
            "embedding": embedding,
            "embeddingSize": len(embedding)
        }

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Embedding generation failed: {str(e)}"
        )