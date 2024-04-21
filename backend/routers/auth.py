from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas, crud, models
from database import get_db
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

@router.post("/signup", response_model=schemas.TokenResponse, status_code=201)
def signup(request: schemas.SignupRequest, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, request.email):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pw = hash_password(request.password)
    user = crud.create_user(db, request.email, hashed_pw, request.role)
    
    if request.role == "seeker":
        if not request.full_name:
            raise HTTPException(status_code=400, detail="full_name is required for seeker")
        crud.create_or_update_profile(db, user.id, {"full_name": request.full_name})
    elif request.role == "company":
        if not request.company_name:
            raise HTTPException(status_code=400, detail="company_name is required for company")
        # Auto-verify on signup — verification happens via profile review, not email
        crud.create_company(db, user.id, {"company_name": request.company_name, "verified": True})
    else:
        raise HTTPException(status_code=400, detail="Invalid role")

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@router.post("/login", response_model=schemas.TokenResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, request.email)
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": str(current_user.created_at) if current_user.created_at else None,
    }
    if current_user.role == "seeker":
        prof = crud.get_profile(db, current_user.id)
        data["profile"] = {
            "full_name": prof.full_name if prof else "",
            "phone": prof.phone if prof else None,
            "photo_url": prof.photo_url if prof else None,
            "resume_url": prof.resume_url if prof else None,
            "linkedin_url": prof.linkedin_url if prof else None,
            "availability": prof.availability if prof else None,
            "is_fresher": prof.is_fresher if prof else True,
        } if prof else None
    elif current_user.role == "company":
        company = crud.get_company_by_user(db, current_user.id)
        data["company"] = {
            "id": company.id,
            "company_name": company.company_name,
            "website": company.website,
            "linkedin_url": company.linkedin_url,
            "logo_url": company.logo_url,
            "founded_year": company.founded_year,
            "verified": company.verified,
        } if company else None
    return data
