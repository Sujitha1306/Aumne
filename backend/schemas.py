from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    role: str # 'seeker' or 'company'
    full_name: Optional[str] = None
    company_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    availability: Optional[str] = None
    is_fresher: bool
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CompanyResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    logo_url: Optional[str] = None
    founded_year: Optional[int] = None
    verified: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class JobCreate(BaseModel):
    title: str
    type: str # 'job' or 'internship'
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    duration: Optional[str] = None
    stipend: Optional[int] = None
    deadline: datetime
    openings: int = 1
    description: str
    who_can_apply: Optional[str] = None
    availability_required: Optional[str] = None
    interview_start: Optional[datetime] = None
    additional_info: Optional[str] = None
    skills: List[str] = []
    perks: List[str] = []

class JobResponse(BaseModel):
    id: int
    company_id: int
    title: str
    type: str
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    duration: Optional[str] = None
    stipend: Optional[int] = None
    deadline: datetime
    openings: int
    description: str
    who_can_apply: Optional[str] = None
    availability_required: Optional[str] = None
    interview_start: Optional[datetime] = None
    additional_info: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    # Computed / Relational fields
    skills: List[str] = []
    perks: List[str] = []
    applicant_count: int = 0
    company_name: str = ""
    company_logo: Optional[str] = None
    posted_ago: str = ""
    model_config = ConfigDict(from_attributes=True)

class ApplicationCreate(BaseModel):
    pass # Empty, as user details come from JWT profile

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    user_id: int
    status: str
    applied_at: datetime
    job_title: str = ""
    company_name: str = ""
    model_config = ConfigDict(from_attributes=True)

class MessageCreate(BaseModel):
    user_id: int
    job_id: int
    body: str

class MessageResponse(BaseModel):
    id: int
    company_id: int
    user_id: int
    job_id: int
    sender_role: str
    body: str
    sent_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ApplicationStatusUpdate(BaseModel):
    status: str  # 'under_review' | 'shortlisted' | 'rejected' | 'hired'
