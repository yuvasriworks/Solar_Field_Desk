import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.config import settings

router = APIRouter(prefix="/upload", tags=["File Uploads"])

@router.post("/image")
def upload_image(file: UploadFile = File(...)):
    allowed_extensions = [".jpg", ".jpeg", ".png", ".webp", ".heic"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Please upload JPG, PNG, or WebP.",
        )

    # Unique file name
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "file_url": f"/uploads/{unique_filename}",
        "filename": unique_filename,
    }

