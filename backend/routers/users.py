from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import schemas, crud, models
from database import get_db
from auth import require_seeker

router = APIRouter()

@router.get("/profile", response_model=schemas.UserProfileResponse)
def get_user_profile(current_user: models.User = Depends(require_seeker), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/profile", response_model=schemas.UserProfileResponse)
def update_user_profile(profile_data: dict, current_user: models.User = Depends(require_seeker), db: Session = Depends(get_db)):
    # Validate keys in dictionary to only allow specific ones, ignoring the rest
    allowed_keys = {"full_name", "phone", "availability", "is_fresher", "linkedin_url"}
    update_data = {k: v for k, v in profile_data.items() if k in allowed_keys}
    return crud.create_or_update_profile(db, current_user.id, update_data)

@router.post("/resume")
def upload_resume(file: UploadFile = File(...), current_user: models.User = Depends(require_seeker), db: Session = Depends(get_db)):
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{current_user.id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    crud.create_or_update_profile(db, current_user.id, {"resume_url": f"/{file_path}"})
    return {"message": "Resume uploaded successfully", "resume_url": f"/{file_path}"}

@router.get("/applications", response_model=List[schemas.ApplicationResponse])
def get_my_applications(current_user: models.User = Depends(require_seeker), db: Session = Depends(get_db)):
    applications = crud.get_user_applications(db, current_user.id)
    result = []
    for app in applications:
        r = schemas.ApplicationResponse.model_validate(app)
        r.job_title = app.job.title
        r.company_name = app.job.company.company_name
        result.append(r)
    return result

@router.delete("/applications/{app_id}", status_code=204)
def delete_my_application(app_id: int, current_user: models.User = Depends(require_seeker), db: Session = Depends(get_db)):
    deleted = crud.delete_application(db, app_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Application not found or not yours")
