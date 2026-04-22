from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import schemas, crud, models
from database import get_db
from auth import require_company, require_seeker, get_current_user_optional

import json

router = APIRouter()

def serialize_job(job: models.Job) -> dict:
    try:
        req_fields = json.loads(job.required_fields or "[]")
    except Exception:
        req_fields = []
    job_dict = {
        "id": job.id, "company_id": job.company_id, "title": job.title, "type": job.type, 
        "work_mode": job.work_mode, "employment_type": job.employment_type, "duration": job.duration,
        "stipend": job.stipend, "deadline": job.deadline, "openings": job.openings,
        "description": job.description, "who_can_apply": job.who_can_apply, 
        "availability_required": job.availability_required, "interview_start": job.interview_start,
        "additional_info": job.additional_info, "is_active": job.is_active, "created_at": job.created_at,
        "skills": [s.skill_name for s in job.skills],
        "perks": [p.perk_name for p in job.perks],
        "applicant_count": len(job.applications),
        "company_name": job.company.company_name if job.company else "",
        "company_logo": job.company.logo_url if job.company else None,
        "company_website": job.company.website if job.company else None,
        "company_linkedin_url": job.company.linkedin_url if job.company else None,
        "posted_ago": f"{(datetime.utcnow() - job.created_at).days} days ago" if job.created_at else "Recently",
        "required_fields": req_fields,
    }
    return job_dict

@router.post("/", response_model=schemas.JobResponse, status_code=201)
def create_new_job(job_in: schemas.JobCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_company)):
    company = crud.get_company_by_user(db, current_user.id)
    if not company or not company.verified:
        raise HTTPException(status_code=403, detail="Company not verified or not found")
        
    if crud.check_duplicate_posting(db, company.id, job_in.title, "job"):
        raise HTTPException(status_code=409, detail="Duplicate posting for this title and type exists")
        
    job_data = job_in.dict(exclude={"skills", "perks", "required_fields"})
    job_data["type"] = "job"
    job_data["required_fields"] = json.dumps(job_in.required_fields)
    
    job = crud.create_job(db, company.id, job_data, job_in.skills, job_in.perks)
    return serialize_job(job)

@router.get("/", response_model=List[schemas.JobResponse])
def list_jobs(work_mode: Optional[str] = None, min_stipend: Optional[int] = None, skills: Optional[str] = None, search: Optional[str] = None, company_id: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(get_current_user_optional)):
    cid = None
    active_only = True
    if company_id == "me" and current_user and current_user.role == "company":
        company = crud.get_company_by_user(db, current_user.id)
        if company:
            cid = company.id
            active_only = False  # Company can see all their postings
    jobs = crud.get_jobs(db, type_filter="job", work_mode=work_mode, min_stipend=min_stipend, skills=skills, search=search, company_id=cid, skip=skip, limit=limit, active_only=active_only)
    return [serialize_job(j) for j in jobs]

@router.get("/{id}", response_model=schemas.JobResponse)
def get_job_detail(id: int, db: Session = Depends(get_db)):
    job = crud.get_job(db, id)
    if not job or job.type != "job":
        raise HTTPException(status_code=404, detail="Job not found")
    return serialize_job(job)

@router.post("/{id}/apply", status_code=201)
def apply_for_job(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_seeker)):
    profile = current_user.profile
    if not profile or not profile.resume_url:
        raise HTTPException(status_code=400, detail="Complete your profile first")
        
    job = crud.get_job(db, id)
    if not job or job.type != "job":
        raise HTTPException(status_code=404, detail="Job not found")
        
    if datetime.utcnow() > job.deadline:
        raise HTTPException(status_code=422, detail="Application deadline has passed")
        
    if crud.check_duplicate_application(db, job.id, current_user.id):
        raise HTTPException(status_code=409, detail="You have already applied to this job")
        
    crud.create_application(db, job.id, current_user.id)
    return {"message": "Applied successfully"}

@router.get("/{id}/applicants")
def list_job_applicants(id: int, status: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(require_company)):
    job = crud.get_job(db, id)
    if not job or job.type != "job":
        raise HTTPException(status_code=404, detail="Job not found")
        
    company = crud.get_company_by_user(db, current_user.id)
    if not company or job.company_id != company.id:
        raise HTTPException(status_code=403, detail="You do not own this job")
        
    applicants = crud.get_job_applicants(db, job.id, status_filter=status)
    result = []
    for app in applicants:
        prof = app.user.profile
        result.append({
            "application_id": app.id,
            "status": app.status,
            "applied_at": app.applied_at,
            "user_id": app.user.id,
            "email": app.user.email,
            "full_name": prof.full_name if prof else "",
            "phone": prof.phone if prof else "",
            "resume_url": prof.resume_url if prof else "",
            "linkedin_url": prof.linkedin_url if prof else "",
            "photo_url": prof.photo_url if prof else "",
            "availability": prof.availability if prof else "",
            "is_fresher": prof.is_fresher if prof else True,
        })
    return result

@router.patch("/applications/{app_id}/status")
def update_application_status(app_id: int, body: schemas.ApplicationStatusUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(require_company)):
    app = crud.get_application_by_id(db, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    company = crud.get_company_by_user(db, current_user.id)
    if not company or app.job.company_id != company.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    updated = crud.update_application_status(db, app_id, body.status)
    return {"application_id": updated.id, "status": updated.status}
