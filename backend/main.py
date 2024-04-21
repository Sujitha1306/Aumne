from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routers import auth, jobs, internships, users, companies, messages
import os

Base.metadata.create_all(bind=engine)  # Creates tables if not exist

app = FastAPI(title="Job Portal API", version="2.0.0")

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(internships.router, prefix="/internships", tags=["Internships"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(companies.router, prefix="/companies", tags=["Companies"])
app.include_router(messages.router, prefix="/messages", tags=["Messages"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
