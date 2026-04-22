from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'seeker' or 'company'
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    company = relationship("Company", back_populates="user", uselist=False)
    applications = relationship("Application", back_populates="user")
    messages = relationship("Message", back_populates="user")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    photo_url = Column(String)
    resume_url = Column(String)
    linkedin_url = Column(String)
    availability = Column(String) # 'immediate', 'within_1_month', 'negotiable'
    is_fresher = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String, nullable=False)
    website = Column(String)
    linkedin_url = Column(String)
    logo_url = Column(String)
    founded_year = Column(Integer)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="company")
    jobs = relationship("Job", back_populates="company")
    messages = relationship("Message", back_populates="company")

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False) # 'job' or 'internship'
    work_mode = Column(String) # 'remote', 'hybrid', 'onsite'
    employment_type = Column(String) # 'full_time', 'part_time'
    duration = Column(String)
    stipend = Column(Integer)
    deadline = Column(DateTime, nullable=False)
    openings = Column(Integer, default=1)
    description = Column(Text, nullable=False)
    who_can_apply = Column(String)
    availability_required = Column(String)
    interview_start = Column(DateTime)
    additional_info = Column(Text)
    required_fields = Column(Text, default="[]")  # JSON array e.g. ["phone", "linkedin_url"]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('company_id', 'title', 'type', name='uq_company_title_type'),)

    company = relationship("Company", back_populates="jobs")
    skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    perks = relationship("JobPerk", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job")
    messages = relationship("Message", back_populates="job")

class JobSkill(Base):
    __tablename__ = "job_skills"
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    skill_name = Column(String, nullable=False)

    job = relationship("Job", back_populates="skills")

class JobPerk(Base):
    __tablename__ = "job_perks"
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    perk_name = Column(String, nullable=False)

    job = relationship("Job", back_populates="perks")

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default='under_review') # 'under_review', 'shortlisted', 'rejected', 'hired'
    applied_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('job_id', 'user_id', name='uq_job_user'),)

    job = relationship("Job", back_populates="applications")
    user = relationship("User", back_populates="applications")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    sender_role = Column(String, nullable=False) # 'company' or 'seeker'
    body = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)  # True once recipient opens the thread
    
    company = relationship("Company", back_populates="messages")
    user = relationship("User", back_populates="messages")
    job = relationship("Job", back_populates="messages")
