"""
Seed script: Run once from the backend/ directory to populate sample jobs.
Also auto-verifies all existing companies.

Usage:
  cd backend
  python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ── 1. Auto-verify all existing companies ─────────────────────────────────────
unverified = db.query(models.Company).filter(models.Company.verified == False).all()
for c in unverified:
    c.verified = True
    print(f"  [OK] Verified company: {c.company_name}")
db.commit()

# ── 2. Seed a demo company if none exist ──────────────────────────────────────
demo_company = db.query(models.Company).first()

if not demo_company:
    from auth import hash_password
    demo_user = models.User(email="demo@techcorp.com", password_hash=hash_password("demo1234"), role="company")
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)
    demo_company = models.Company(user_id=demo_user.id, company_name="TechCorp Solutions", website="https://techcorp.example.com", verified=True)
    db.add(demo_company)
    db.commit()
    db.refresh(demo_company)
    print(f"  [COMPANY] Created demo company: TechCorp Solutions (login: demo@techcorp.com / demo1234)")

# ── 3. Seed sample jobs ───────────────────────────────────────────────────────
existing_jobs = db.query(models.Job).count()
if existing_jobs == 0:
    sample_jobs = [
        {
            "title": "Frontend Developer",
            "type": "job",
            "work_mode": "remote",
            "employment_type": "full_time",
            "stipend": 60000,
            "deadline": datetime.utcnow() + timedelta(days=60),
            "openings": 3,
            "description": "We are looking for a passionate Frontend Developer to join our growing team. You will work on building responsive and performant web applications using React and modern JavaScript. Day-to-day responsibilities include implementing UI designs, writing clean code, code reviews, and collaborating with backend engineers.",
            "who_can_apply": "1-2 years experience",
            "availability_required": "immediate",
            "is_active": True,
            "skills": ["React", "JavaScript", "CSS", "TypeScript"],
            "perks": ["Health Insurance", "Remote Work Option", "Learning Budget"],
        },
        {
            "title": "Backend Engineer",
            "type": "job",
            "work_mode": "hybrid",
            "employment_type": "full_time",
            "stipend": 75000,
            "deadline": datetime.utcnow() + timedelta(days=45),
            "openings": 2,
            "description": "Join our backend team to design and build scalable APIs powering millions of users. You will work with Python, FastAPI, PostgreSQL, and Redis. Strong problem-solving skills and knowledge of distributed systems is a plus.",
            "who_can_apply": "Any experience level",
            "availability_required": "within_1_month",
            "is_active": True,
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "perks": ["Health Insurance", "Stock Options", "Flexible Work Hours"],
        },
        {
            "title": "UI/UX Designer",
            "type": "job",
            "work_mode": "onsite",
            "employment_type": "full_time",
            "stipend": 55000,
            "deadline": datetime.utcnow() + timedelta(days=30),
            "openings": 1,
            "description": "We are hiring a UI/UX Designer to create intuitive and beautiful user experiences. You will conduct user research, create wireframes and prototypes in Figma, and work closely with developers to bring designs to life.",
            "who_can_apply": "Freshers only",
            "availability_required": "negotiable",
            "is_active": True,
            "skills": ["Figma", "User Research", "Wireframing", "Prototyping"],
            "perks": ["Free Meals / Snacks", "Learning Budget", "Certificate of Completion"],
        },
        {
            "title": "Python ML Intern",
            "type": "internship",
            "work_mode": "remote",
            "employment_type": "part_time",
            "stipend": 15000,
            "duration": "3 months",
            "deadline": datetime.utcnow() + timedelta(days=20),
            "openings": 5,
            "description": "Exciting opportunity for students passionate about Machine Learning! You will work alongside senior ML engineers to build and evaluate models, clean datasets, and learn about real-world ML deployment. Perfect for final-year students or recent graduates.",
            "who_can_apply": "Freshers only",
            "availability_required": "immediate",
            "is_active": True,
            "skills": ["Python", "NumPy", "Pandas", "scikit-learn"],
            "perks": ["Certificate of Completion", "Letter of Recommendation", "Pre-Placement Offer (PPO)"],
        },
        {
            "title": "React Frontend Intern",
            "type": "internship",
            "work_mode": "hybrid",
            "employment_type": "part_time",
            "stipend": 12000,
            "duration": "2 months",
            "deadline": datetime.utcnow() + timedelta(days=25),
            "openings": 3,
            "description": "We are looking for enthusiastic React interns to help build our next-generation web platform. You will learn real-world development practices, participate in sprints, and ship features that real users will use. This is a paid internship with a PPO opportunity.",
            "who_can_apply": "Freshers only",
            "availability_required": "immediate",
            "is_active": True,
            "skills": ["React", "JavaScript", "HTML", "CSS"],
            "perks": ["Pre-Placement Offer (PPO)", "Certificate of Completion", "Remote Work Option"],
        },
    ]

    for job_data in sample_jobs:
        skills = job_data.pop("skills")
        perks = job_data.pop("perks")
        job = models.Job(company_id=demo_company.id, **job_data)
        db.add(job)
        db.commit()
        db.refresh(job)
        for s in skills:
            db.add(models.JobSkill(job_id=job.id, skill_name=s))
        for p in perks:
            db.add(models.JobPerk(job_id=job.id, perk_name=p))
        db.commit()
        print(f"  [JOB] Seeded: {job.title} ({job.type})")
else:
    print(f"  [INFO] {existing_jobs} jobs already exist -- skipping seed.")

db.close()
print("\n[DONE] Seed complete!")

