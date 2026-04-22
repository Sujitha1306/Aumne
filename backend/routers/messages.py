from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import schemas, crud, models
from database import get_db
from auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.MessageResponse, status_code=201)
def send_message(msg_in: schemas.MessageCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Both companies and seekers can send messages."""
    if current_user.role == "company":
        company = crud.get_company_by_user(db, current_user.id)
        if not company:
            raise HTTPException(status_code=403, detail="Company profile required")
        job = crud.get_job(db, msg_in.job_id)
        if not job or job.company_id != company.id:
            raise HTTPException(status_code=403, detail="You do not own this job posting")
        sender_role = "company"
        company_id = company.id
        user_id = msg_in.user_id
    else:
        # Seeker replying — must have applied to this job
        if not crud.check_duplicate_application(db, msg_in.job_id, current_user.id):
            raise HTTPException(status_code=400, detail="You have not applied to this job")
        job = crud.get_job(db, msg_in.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        company = crud.get_company(db, job.company_id)
        if not company:
            raise HTTPException(status_code=400, detail="Company not found")
        sender_role = "seeker"
        company_id = company.id
        user_id = current_user.id

    msg = crud.create_message(db, company_id, user_id, msg_in.job_id, sender_role, msg_in.body)
    return msg

@router.get("/inbox", response_model=List[schemas.MessageResponse])
def get_user_inbox(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "seeker":
        raise HTTPException(status_code=403, detail="Only seekers have an inbox")
    return crud.get_inbox(db, current_user.id)

@router.get("/company-inbox", response_model=List[schemas.MessageResponse])
def get_company_inbox(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Only companies have a company inbox")
    company = crud.get_company_by_user(db, current_user.id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return crud.get_company_inbox(db, company.id)

@router.get("/thread/{job_id}/{user_id}", response_model=List[schemas.MessageResponse])
def get_message_thread(job_id: int, user_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "seeker" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role == "company":
        company = crud.get_company_by_user(db, current_user.id)
        job = crud.get_job(db, job_id)
        if not job or not company or job.company_id != company.id:
            raise HTTPException(status_code=403, detail="Not authorized")

    return crud.get_thread(db, job_id, user_id)
