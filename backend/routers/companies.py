from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil
import schemas, crud, models
from database import get_db
from auth import require_company

router = APIRouter()

@router.get("/profile", response_model=schemas.CompanyResponse)
def get_company_profile(current_user: models.User = Depends(require_company), db: Session = Depends(get_db)):
    company = crud.get_company_by_user(db, current_user.id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return company

@router.put("/profile", response_model=schemas.CompanyResponse)
def update_company_profile(profile_data: dict, current_user: models.User = Depends(require_company), db: Session = Depends(get_db)):
    company = crud.get_company_by_user(db, current_user.id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
        
    allowed_keys = {"company_name", "website", "linkedin_url", "founded_year"}
    update_data = {k: v for k, v in profile_data.items() if k in allowed_keys}
    return crud.update_company(db, company.id, update_data)

@router.post("/logo")
def upload_logo(file: UploadFile = File(...), current_user: models.User = Depends(require_company), db: Session = Depends(get_db)):
    company = crud.get_company_by_user(db, current_user.id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/company_{current_user.id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    crud.update_company(db, company.id, {"logo_url": f"/{file_path}"})
    return {"message": "Logo uploaded successfully", "logo_url": f"/{file_path}"}

@router.get("/{id}", response_model=schemas.CompanyResponse)
def get_company_public(id: int, db: Session = Depends(get_db)):
    company = crud.get_company(db, id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
