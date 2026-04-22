import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from database import SessionLocal
import models
db = SessionLocal()
jobs = db.query(models.Job).all()
for j in jobs:
    print(j.id, j.title, j.type, j.is_active, j.deadline)
db.close()
