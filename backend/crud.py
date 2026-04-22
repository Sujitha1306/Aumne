from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import models, schemas

# Auth & Users
def create_user(db: Session, email: str, password_hash: str, role: str) -> models.User:
    db_user = models.User(email=email, password_hash=password_hash, role=role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

# Profile
def create_or_update_profile(db: Session, user_id: int, profile_data: dict) -> models.UserProfile:
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
    if db_profile:
        for key, value in profile_data.items():
            setattr(db_profile, key, value)
    else:
        db_profile = models.UserProfile(user_id=user_id, **profile_data)
        db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def get_profile(db: Session, user_id: int) -> Optional[models.UserProfile]:
    return db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()

# Company
def create_company(db: Session, user_id: int, company_data: dict) -> models.Company:
    db_company = models.Company(user_id=user_id, **company_data)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def get_company_by_user(db: Session, user_id: int) -> Optional[models.Company]:
    return db.query(models.Company).filter(models.Company.user_id == user_id).first()

def get_company(db: Session, company_id: int) -> Optional[models.Company]:
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def update_company(db: Session, company_id: int, company_data: dict) -> Optional[models.Company]:
    db_company = get_company(db, company_id)
    if db_company:
        for key, value in company_data.items():
            setattr(db_company, key, value)
        db.commit()
        db.refresh(db_company)
    return db_company

# Jobs
def create_job(db: Session, company_id: int, job_data: dict, skills: List[str], perks: List[str]) -> models.Job:
    db_job = models.Job(company_id=company_id, **job_data)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    for skill in skills:
        db.add(models.JobSkill(job_id=db_job.id, skill_name=skill))
    for perk in perks:
        db.add(models.JobPerk(job_id=db_job.id, perk_name=perk))
    db.commit()
    return db_job

def get_jobs(db: Session, type_filter: str, work_mode: Optional[str] = None, min_stipend: Optional[int] = None, skills: Optional[str] = None, search: Optional[str] = None, company_id: Optional[int] = None, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[models.Job]:
    query = db.query(models.Job).filter(models.Job.type == type_filter)
    if active_only:
        query = query.filter(models.Job.is_active == True)
    if company_id:
        query = query.filter(models.Job.company_id == company_id)
    if work_mode:
        query = query.filter(models.Job.work_mode == work_mode)
    if min_stipend:
        query = query.filter(models.Job.stipend >= min_stipend)
    if search:
        query = query.filter(models.Job.title.ilike(f"%{search}%"))
    if skills:
        skill_list = [s.strip() for s in skills.split(',')]
        query = query.join(models.JobSkill).filter(models.JobSkill.skill_name.in_(skill_list))

    return query.offset(skip).limit(limit).all()

def get_job(db: Session, job_id: int) -> Optional[models.Job]:
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def check_duplicate_posting(db: Session, company_id: int, title: str, job_type: str) -> bool:
    count = db.query(models.Job).filter(models.Job.company_id == company_id, models.Job.title == title, models.Job.type == job_type).count()
    return count > 0

# Applications
def create_application(db: Session, job_id: int, user_id: int) -> models.Application:
    db_app = models.Application(job_id=job_id, user_id=user_id)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def check_duplicate_application(db: Session, job_id: int, user_id: int) -> bool:
    return db.query(models.Application).filter(models.Application.job_id == job_id, models.Application.user_id == user_id).count() > 0

def get_user_applications(db: Session, user_id: int) -> List[models.Application]:
    return db.query(models.Application).filter(models.Application.user_id == user_id).all()

def get_job_applicants(db: Session, job_id: int, status_filter: Optional[str] = None) -> List[models.Application]:
    query = db.query(models.Application).filter(models.Application.job_id == job_id)
    if status_filter:
        query = query.filter(models.Application.status == status_filter)
    return query.all()

def get_application_by_id(db: Session, app_id: int) -> Optional[models.Application]:
    return db.query(models.Application).filter(models.Application.id == app_id).first()

def update_application_status(db: Session, app_id: int, status: str) -> Optional[models.Application]:
    app = db.query(models.Application).filter(models.Application.id == app_id).first()
    if app:
        app.status = status
        db.commit()
        db.refresh(app)
    return app

def delete_application(db: Session, app_id: int, user_id: int) -> bool:
    app = db.query(models.Application).filter(
        models.Application.id == app_id,
        models.Application.user_id == user_id
    ).first()
    if not app:
        return False
    db.delete(app)
    db.commit()
    return True

# Messages
def create_message(db: Session, company_id: int, user_id: int, job_id: int, sender_role: str, body: str) -> models.Message:
    db_msg = models.Message(company_id=company_id, user_id=user_id, job_id=job_id, sender_role=sender_role, body=body)
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def get_inbox(db: Session, user_id: int) -> List[models.Message]:
    return db.query(models.Message).filter(models.Message.user_id == user_id).order_by(models.Message.sent_at.desc()).all()

def get_company_inbox(db: Session, company_id: int) -> List[models.Message]:
    """All messages across all jobs owned by this company, newest first."""
    return db.query(models.Message).filter(models.Message.company_id == company_id).order_by(models.Message.sent_at.desc()).all()

def get_thread(db: Session, job_id: int, user_id: int) -> List[models.Message]:
    return db.query(models.Message).filter(models.Message.job_id == job_id, models.Message.user_id == user_id).order_by(models.Message.sent_at.asc()).all()
