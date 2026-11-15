from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel

from app.services.text_extractor import extract_text
from app.services.resume_parser import parse_resume
from app.services.embedding_service import (
    generate_embedding,
    compare_parsed_resume,
    calculate_weighted_score
)
from app.services.profile_autofill_service import extract_profile_with_llm
from app.services.chat_service import generate_chat_response
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any, List

app = FastAPI(
    title="Resume Screening AI Service",
    description="AI/NLP service for resume processing and matching",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
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
# LLM PROFILE AUTOFILL
# ============================================================

@app.post("/profile-autofill")
async def profile_autofill_endpoint(file: UploadFile = File(...)):
    import tempfile

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

    temp_path = None

    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        # Use a unique temporary filename to avoid upload collisions.
        with tempfile.NamedTemporaryFile(
            suffix=extension,
            dir=upload_dir,
            delete=False
        ) as temp_file:
            temp_file.write(contents)
            temp_path = Path(temp_file.name)

        extracted_text = extract_text(str(temp_path))

        if not extracted_text or not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the resume."
            )

        profile = await extract_profile_with_llm(extracted_text)

        return {
            "fileName": Path(file.filename).name,
            "profile": profile.model_dump()
        }

    except HTTPException:
        raise

    except TimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail=str(exc)
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc)
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc)
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Profile autofill failed."
        ) from exc

    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink()

# ============================================================
# JOB EMBEDDING REQUEST MODEL
# ============================================================

class JobEmbeddingRequest(BaseModel):
    text: str

class ResumeMatchingRequest(BaseModel):
    parsed_resume: Dict[str, Any]
    requirements: List[str]
    job_description: str
# ============================================================
# CHAT REQUEST MODEL
# ============================================================

from typing import Optional, Dict, Any, List
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

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
    
# ============================================================
# AI CHATBOT
# ============================================================

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):

    try:

        if not request.message or not request.message.strip():
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty."
            )

        response = await generate_chat_response(
    request.message.strip(),
    request.context or {}
)

        return {
            "reply": response
        }

    except HTTPException:
        raise

    except TimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail=str(exc)
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc)
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc)
        ) from exc

# ============================================================
# RESUME JOB MATCHING
# ============================================================

@app.post("/match-resume")
async def match_resume_endpoint(
    request: ResumeMatchingRequest
):

    try:

        if not request.parsed_resume:
            raise HTTPException(
                status_code=400,
                detail="Parsed resume cannot be empty."
            )

        if not request.requirements:
            raise HTTPException(
                status_code=400,
                detail="Job requirements cannot be empty."
            )

        if not request.job_description.strip():
            raise HTTPException(
                status_code=400,
                detail="Job description cannot be empty."
            )

        # STEP 1: Compare resume with job requirements

        matching_results = compare_parsed_resume(
            request.parsed_resume,
            request.requirements,
            request.job_description
        )

        # STEP 2: Calculate weighted score

        score = calculate_weighted_score(
            matching_results
        )

        # STEP 3: Return matching results

        return {
            "matchingResults": matching_results,
            "score": score
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Resume matching failed: {str(exc)}"
        ) from exc
