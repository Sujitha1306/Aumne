"""Fix expired jobs and add more seed data."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from datetime import datetime, timedelta
from database import SessionLocal
import models

db = SessionLocal()

# Fix expired DevOps job deadline
expired = db.query(models.Job).filter(models.Job.title == "DevOps Engineer").first()
if expired:
    expired.deadline = datetime.utcnow() + timedelta(days=60)
    db.commit()
    print(f"Fixed deadline for: {expired.title}")

# Add fresh sample jobs if less than 5
existing = db.query(models.Job).count()
if existing < 5:
    company = db.query(models.Company).first()
    if not company:
        print("No company found. Run seed.py first.")
        db.close()
        sys.exit(1)

    new_jobs = [
        {
            "title": "Full Stack Developer",
            "type": "job",
            "work_mode": "remote",
            "employment_type": "full_time",
            "stipend": 80000,
            "deadline": datetime.utcnow() + timedelta(days=50),
            "openings": 2,
            "description": "We are looking for a Full Stack Developer comfortable with both React and Python backends. You will own features end-to-end, from database schema design to pixel-perfect UI implementation. Great opportunity to grow with a funded startup.",
            "who_can_apply": "Any experience level",
            "availability_required": "immediate",
            "is_active": True,
            "skills": ["React", "Python", "FastAPI", "PostgreSQL"],
            "perks": ["Stock Options", "Remote Work Option", "Health Insurance"],
        },
        {
            "title": "Data Science Intern",
            "type": "internship",
            "work_mode": "remote",
            "employment_type": "part_time",
            "stipend": 18000,
            "duration": "6 months",
            "deadline": datetime.utcnow() + timedelta(days=40),
            "openings": 4,
            "description": "Exciting internship for aspiring Data Scientists. You will work on real datasets, build predictive models, and present insights to senior leadership. Knowledge of Python and basic statistics is required. Prior ML project experience is a big plus.",
            "who_can_apply": "Freshers only",
            "availability_required": "immediate",
            "is_active": True,
            "skills": ["Python", "Pandas", "ML", "Data Visualization"],
            "perks": ["Certificate of Completion", "Letter of Recommendation", "Pre-Placement Offer (PPO)"],
        },
        {
            "title": "Product Manager",
            "type": "job",
            "work_mode": "hybrid",
            "employment_type": "full_time",
            "stipend": 90000,
            "deadline": datetime.utcnow() + timedelta(days=35),
            "openings": 1,
            "description": "Lead product strategy, write detailed PRDs, coordinate with engineering and design, and drive metrics-driven feature launches. You should have experience with agile methodologies and strong analytical skills.",
            "who_can_apply": "1-2 years experience",
            "availability_required": "within_1_month",
            "is_active": True,
            "skills": ["Product Strategy", "Agile", "Analytics", "Roadmapping"],
            "perks": ["Health Insurance", "Stock Options", "Flexible Work Hours"],
        },
    ]

    for job_data in new_jobs:
        skills = job_data.pop("skills")
        perks = job_data.pop("perks")
        # Skip if title already exists
        exists = db.query(models.Job).filter(
            models.Job.company_id == company.id,
            models.Job.title == job_data["title"],
            models.Job.type == job_data["type"]
        ).first()
        if exists:
            print(f"  [SKIP] Already exists: {job_data['title']}")
            continue
        job = models.Job(company_id=company.id, **job_data)
        db.add(job)
        db.commit()
        db.refresh(job)
        for s in skills:
            db.add(models.JobSkill(job_id=job.id, skill_name=s))
        for p in perks:
            db.add(models.JobPerk(job_id=job.id, perk_name=p))
        db.commit()
        print(f"  [JOB] Added: {job.title} ({job.type})")

print("\n[DONE] Fix complete!")
db.close()
