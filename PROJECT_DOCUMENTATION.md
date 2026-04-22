# Aumne — Job Portal Application
### Complete Project Documentation

> **Version:** 1.0.0 — April 2026  
> **Repository:** [github.com/Sujitha1306/Aumne](https://github.com/Sujitha1306/Aumne)  
> **Branch:** `main` | **Commits:** 19 total

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [Frontend Pages & Components](#7-frontend-pages--components)
8. [Feature Log — All Updates](#8-feature-log--all-updates)
9. [Authentication & Security](#9-authentication--security)
10. [Development Setup](#10-development-setup)
11. [Git Commit History](#11-git-commit-history)

---

## 1. Project Overview

**Aumne** is a full-stack Job Portal application connecting **Job Seekers** with **Companies**. Built with a FastAPI backend and a React (Vite) frontend, it supports the complete hiring lifecycle: job discovery, applications, applicant management, real-time messaging, and status tracking.

### Who uses it?

| User Type | What they can do |
|-----------|-----------------|
| **Job Seeker** | Browse jobs & internships, apply, track applications, chat with companies |
| **Company** | Post jobs/internships, manage applicants, message candidates, update status |
| **Guest** | Browse listing cards — must log in to see full details or apply |

### Core Principles
- **Role separation** — company and seeker accounts are fully isolated
- **No duplicate applications** — one application per user per job enforced at DB + UI
- **Profile-first applications** — resume required; optional fields shown inline at apply time
- **Real-time badge notifications** — unread message count for both roles in the navbar

---

## 2. Technology Stack

### Backend

| Category | Technology | Version |
|----------|-----------|---------|
| Web framework | **FastAPI** | 0.111.0 |
| ASGI server | **Uvicorn** | 0.29.0 |
| ORM | **SQLAlchemy** | 2.0.30 |
| DB migrations | **Alembic** | 1.13.1 |
| Data validation | **Pydantic v2** | 2.7.1 |
| Authentication | **python-jose (JWT)** | 3.3.0 |
| Password hashing | **passlib (bcrypt)** | 1.7.4 |
| File uploads | **python-multipart** | 0.0.9 |
| Testing | **pytest + httpx** | 8.2.0 / 0.27.0 |
| Env management | **python-dotenv** | 1.0.1 |
| Database | **SQLite** | (file: job_portal.db) |

### Frontend

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | **React** | 18+ |
| Build tool | **Vite** | Latest |
| Routing | **React Router v6** | Latest |
| HTTP client | **Axios** | Latest |
| Icon library | **Lucide React** | Latest |
| Styling | **Tailwind CSS** | v3 |
| Language | **JavaScript (JSX)** | ES2022 |

### DevOps & Tooling

| Tool | Purpose |
|------|---------|
| **Git + GitHub** | Version control at Sujitha1306/Aumne |
| master_launcher.bat | Launches both backend + frontend in separate windows |
| setupdev.bat | One-click dev environment setup |
| runapplication.bat | Alternative launcher script |
| **Auto-generated Python SDK** (job_sdk/) | SDK for programmatic API access |
| openapi.json | Auto-generated OpenAPI spec from FastAPI |

---

## 3. System Architecture

```
BROWSER (React Vite — localhost:5173)
  Seeker Pages | Company Pages | Public Pages
        |
        | Axios HTTP + JWT Bearer Token
        v
FastAPI — localhost:8000
  /auth  /jobs  /internships  /users  /companies  /messages
        |
        | SQLAlchemy ORM
        v
  SQLite (job_portal.db)
  /uploads/ — resume and logo files
```

### Request Flow

```
Browser
  -> Axios (with JWT Bearer token)
  -> FastAPI Router
  -> Dependency Injection (get_current_user / require_seeker / require_company)
  -> CRUD function
  -> SQLAlchemy
  -> SQLite
  -> Pydantic response model
  -> JSON
  -> Browser
```

---

## 4. Project Structure

```
Aumne/
├── backend/
│   ├── main.py                    # FastAPI app, router registration, static files
│   ├── models.py                  # SQLAlchemy ORM models (8 tables)
│   ├── schemas.py                 # Pydantic request/response models
│   ├── crud.py                    # All database operations
│   ├── auth.py                    # JWT creation, password hashing, dependencies
│   ├── database.py                # SQLAlchemy engine + session factory
│   ├── routers/
│   │   ├── auth.py                # POST /auth/signup, /auth/login, GET /auth/me
│   │   ├── jobs.py                # CRUD /jobs + application logic
│   │   ├── internships.py         # CRUD /internships (shares serialize_job)
│   │   ├── users.py               # Seeker profile, resume, applications, DELETE app
│   │   ├── companies.py           # Company profile, logo
│   │   └── messages.py            # Inbox, company inbox, threads, unread count
│   ├── migrate_required_fields.py # SQLite migration: required_fields column
│   ├── migrate_message_read.py    # SQLite migration: is_read column
│   ├── seed.py                    # Sample data seeder
│   ├── requirements.txt
│   └── job_portal.db              # SQLite database file
│
├── frontend/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                # Router + route definitions
│       ├── api/
│       │   ├── client.js          # Axios instance with base URL + auth interceptor
│       │   └── jobs.js            # All API call functions
│       ├── contexts/
│       │   └── AuthContext.jsx    # Global auth state
│       ├── components/
│       │   ├── Navbar.jsx         # Sticky navbar with badge
│       │   ├── ApplyModal.jsx     # Inline-editable apply modal
│       │   └── Toast.jsx          # Toast notification system
│       └── pages/
│           ├── LandingPage.jsx
│           ├── AuthPages.jsx      # Login (role picker) + Signup
│           ├── JobsPage.jsx       # Jobs + Internships listing
│           ├── JobDetailPage.jsx  # Full job detail + apply flow
│           ├── SeekerDashboard.jsx# Profile, Applications (tabbed)
│           ├── CompanyDashboard.jsx# Post jobs, manage applicants
│           └── InboxPage.jsx      # Seeker messaging inbox
│
├── master_launcher.bat
├── setupdev.bat
├── runapplication.bat
├── job_sdk/                       # Auto-generated Python SDK
└── .gitignore
```

---

## 5. Database Schema

### Table: users
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto increment |
| email | VARCHAR UNIQUE | Login identifier |
| password_hash | VARCHAR | bcrypt hash |
| role | VARCHAR | 'seeker' or 'company' |
| created_at | DATETIME | Auto timestamp |

### Table: user_profiles
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| user_id | FK users | One-to-one |
| full_name | VARCHAR | Seeker's name |
| phone | VARCHAR | Optional |
| photo_url | VARCHAR | Profile photo path |
| resume_url | VARCHAR | Uploaded resume path |
| linkedin_url | VARCHAR | Optional |
| availability | VARCHAR | immediate / within_1_month / negotiable |
| is_fresher | BOOLEAN | True = fresher, False = experienced |

### Table: companies
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| user_id | FK users | One-to-one |
| company_name | VARCHAR | Required |
| website | VARCHAR | External website URL |
| linkedin_url | VARCHAR | Company LinkedIn |
| logo_url | VARCHAR | Uploaded logo path |
| founded_year | INTEGER | Optional |
| verified | BOOLEAN | Auto-verified on signup |

### Table: jobs
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| company_id | FK companies | |
| type | VARCHAR | 'job' or 'internship' |
| title | VARCHAR | Job title |
| work_mode | VARCHAR | remote / on_site / hybrid |
| employment_type | VARCHAR | full_time / part_time / contract |
| duration | VARCHAR | For internships |
| stipend | INTEGER | Monthly (INR) |
| deadline | DATETIME | Application deadline |
| openings | INTEGER | Number of positions |
| description | TEXT | Full job description |
| who_can_apply | TEXT | Eligibility criteria |
| availability_required | VARCHAR | Required availability |
| interview_start | DATETIME | Interview schedule |
| additional_info | TEXT | Extra info for seekers |
| required_fields | TEXT (JSON) | e.g. ["phone","linkedin_url"] — added Phase 6 |
| is_active | BOOLEAN | Soft-delete flag |
| created_at | DATETIME | Post timestamp |

### Table: job_skills / job_perks
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| job_id | FK jobs | |
| skill_name / perk_name | VARCHAR | One row per tag |

### Table: applications
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| job_id | FK jobs | |
| user_id | FK users | |
| status | VARCHAR | under_review / shortlisted / hired / rejected |
| applied_at | DATETIME | Submission timestamp |
| UNIQUE(job_id, user_id) | Constraint | Prevents duplicates at DB level |

### Table: messages
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| company_id | FK companies | |
| user_id | FK users | |
| job_id | FK jobs | Context job |
| sender_role | VARCHAR | 'company' or 'seeker' |
| body | TEXT | Message text |
| sent_at | DATETIME | Send timestamp |
| is_read | BOOLEAN | False until recipient opens thread — added Phase 10 |

---

## 6. API Reference

### Auth — /auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/signup | None | Register seeker or company |
| POST | /auth/login | None | Get JWT token |
| GET | /auth/me | Any | Get current user + profile/company |

### Jobs — /jobs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /jobs/ | Optional | List all active jobs |
| POST | /jobs/ | Company | Create job posting |
| GET | /jobs/{id} | Optional | Get job detail |
| POST | /jobs/{id}/apply | Seeker | Submit application |
| GET | /jobs/{id}/applicants | Company | List applicants |

### Internships — /internships
Same as /jobs — shares serialize_job logic.

### Users — /users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /users/profile | Seeker | Get own profile |
| PUT | /users/profile | Seeker | Update profile fields |
| POST | /users/resume | Seeker | Upload resume file |
| GET | /users/applications | Seeker | List my applications |
| DELETE | /users/applications/{id} | Seeker | Withdraw application |

### Companies — /companies

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /companies/profile | Company | Get own company |
| PUT | /companies/profile | Company | Update company info |
| POST | /companies/logo | Company | Upload logo |
| GET | /companies/{id} | Optional | Get public company profile |

### Messages — /messages

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /messages/ | Any | Send a message |
| GET | /messages/inbox | Seeker | Seeker inbox |
| GET | /messages/company-inbox | Company | All company messages |
| GET | /messages/unread-count | Any | Badge count (is_read=False) |
| GET | /messages/thread/{job_id}/{user_id} | Any | Thread + marks as read |

---

## 7. Frontend Pages & Components

### Pages

#### LandingPage.jsx
Public marketing page. Hero section, features, CTA. Visible to guests.

#### AuthPages.jsx
- **Signup:** Role picker (Seeker / Company) then role-specific form
- **Login:** Role picker step first, then login form. Mismatch guard prevents company logging in as seeker and vice versa.

#### JobsPage.jsx
Lists jobs and internships with search and filter. Guests see cards; full detail requires login.

#### JobDetailPage.jsx
- Full description, skills, perks, who can apply, additional info sections
- Company sidebar: website + LinkedIn external links
- Apply button states: Login / Companies cannot apply / Already Applied / Closed / Apply Now
- Checks existing applications on page load

#### SeekerDashboard.jsx
Three sections:
1. Profile — edit all fields, upload photo and resume
2. My Applications — two tabs:
   - In Progress: under_review applications with Continue and Delete buttons
   - All Applications: full history table with status badges
3. Resume management

#### CompanyDashboard.jsx
Multiple views:
1. Overview — stats + recent applicants
2. Post Job — 3-step wizard with required fields selector in Step 3
3. My Postings — list of jobs
4. Applicant management — status updates + messaging

#### InboxPage.jsx
Seeker message inbox grouped by job thread. Full conversation view with reply.

### Components

#### Navbar.jsx
- Seeker: Home, Jobs, Internships, Mail badge, My Applications, Avatar menu
- Company: Post Job, My Postings, Mail badge, Avatar menu
- Badge: polls /messages/unread-count every 30s; red dot with count
- Badge drops to 0 when thread is opened

#### ApplyModal.jsx
- Read-only: Name, Resume status
- Editable: Phone, LinkedIn, Availability, Experience — live inputs
- Save Changes calls PUT /users/profile inline
- Required fields (from job.required_fields) marked with asterisk; blocks submit if missing
- Confirm Apply activates only when all required fields filled

#### Toast.jsx
Global toast notifications (success / error). Used across messaging, profile save, apply.

---

## 8. Feature Log — All Updates

### Phase 1 — Foundation (Commits: a62fcb0, 9582f4b, bc90b0c)
- Project init, README
- SQLAlchemy models: 8 tables (users, user_profiles, companies, jobs, job_skills, job_perks, applications, messages)
- Alembic migration setup
- Pydantic schemas, seed data

### Phase 2 — Backend API (Commits: 47f0192, 3811ee2, 896f634)
- JWT authentication (signup, login, /auth/me)
- Jobs and Internships CRUD with business logic (deadline check, duplicate prevention)
- Users, Companies, Messages routers complete

### Phase 3 — Frontend (Commits: 49b792c, 80d3b61, 5a9e165)
- React + Vite setup, Axios client, AuthContext, React Router v6
- All seeker pages: Jobs, Internships, Apply, Profile, Inbox
- Full company portal: Dashboard, Post Job wizard, Applicants, Messaging

### Phase 4 — Testing and SDK (Commits: ccc171e, 90ddaed)
- Unit tests: auth, jobs, apply logic (pytest + httpx)
- Auto-generated Python SDK (job_sdk/)
- Automation scripts: master_launcher.bat, setupdev.bat

### Phase 5 — Repository Cleanup (Commits: f220824, cd8e7b1, 0b96b3e)
- README updated with full setup instructions
- Reference docs excluded from git via .gitignore
- Backend scripts, OpenAPI spec committed

### Phase 6 — Six Major Enhancements (Commit: 24c8e6d)

| Feature | What changed |
|---------|-------------|
| F1: Company external links | View Full Profile opens company.website externally; LinkedIn button below — only shows if set |
| F2: Additional info | Job detail page renders additional_info in amber section if provided |
| F3: In Progress applications | SeekerDashboard tabbed: In Progress (under_review) with Continue + Delete; All Applications table |
| F4: Apply modal full profile | Shows all 6 profile fields with checkmark/warning icons |
| F5: Company required fields | Step 3 checkbox grid: Phone, LinkedIn, Availability, Experience. Stored as JSON. Modal validates and blocks if missing |
| F6: Role-aware login | Login has 2-card role picker. Mismatch guard: blocks company from logging in via seeker flow |

Backend changes: models.py (required_fields column), schemas.py, crud.py (delete_application), routers/jobs.py (serialize_job extended), routers/internships.py, routers/users.py (DELETE endpoint)
DB migration: migrate_required_fields.py

### Phase 7 — Inline Profile Editing in Apply Modal (Commit: bfff471)
- ApplyModal fully rewritten with live editable fields
- Users edit Phone, LinkedIn, Availability, Experience directly in modal
- Save Changes calls PUT /users/profile without leaving page
- Shows Saved confirmation; re-validates required fields after save
- Resume missing shows inline Upload now link

### Phase 8 — Duplicate Application Prevention (Commit: 4d3a0da)
- JobDetailPage fetches user's applications on page load
- If already applied: Apply Now replaced with green Already Applied badge
- After successful submit: immediately swaps button without page reload
- Backend 409 guard already existed; this adds the UI layer

### Phase 9 — Company Message Badge (Commit: 6b2645e)
- Backend: GET /messages/company-inbox endpoint (company only)
- CRUD: get_company_inbox() function
- Navbar: polls company inbox; red badge on Mail icon for seeker replies

### Phase 10 — Accurate Unread Count (Commit: 37931c0)
- Root cause: previous badge counted all recent messages regardless of read state
- Added is_read boolean column to messages table (default False)
- mark_thread_read() marks opposite-role messages as read when thread opened
- get_thread() calls mark_thread_read() automatically
- New GET /messages/unread-count endpoint: uses actual is_read=False rows
- Navbar uses getUnreadCount(); polls every 30s
- Badge correctly drops to 0 once messages are viewed

---

## 9. Authentication & Security

### JWT Flow
```
POST /auth/login
  -> verify email + password (bcrypt)
  -> create JWT { sub: email, role: seeker|company, exp: 30 days }
  -> return { access_token, token_type, role }

Frontend:
  -> stores token in AuthContext + localStorage
  -> Axios attaches as: Authorization: Bearer <token>

FastAPI:
  -> get_current_user() decodes + validates JWT on every protected request
```

### Role Guards

| Guard | Routes | Behaviour |
|-------|--------|-----------|
| get_current_user | General | Validates JWT, returns user |
| require_seeker | Profile, applications | 403 if role != seeker |
| require_company | Job posting, applicants | 403 if role != company |
| get_current_user_optional | Listings | Returns None if no token |

### Security Features
- Passwords hashed with bcrypt (passlib) — never stored plain
- Role mismatch on login shows error, no token issued
- Company cannot access seeker routes (backend enforced)
- Duplicate applications blocked at DB UNIQUE constraint level
- Message threads only accessible to parties in the conversation

---

## 10. Development Setup

### Quick Start
```
.\master_launcher.bat
```
Opens backend (port 8000) and frontend (port 5173) in separate windows.

### Manual Backend Setup
```bash
cd backend
python -m venv ../env
..\env\Scripts\activate       # Windows
source ../env/bin/activate    # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Manual Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment
```
backend/.env
SECRET_KEY=your-secret-key-here
```

### Seed Database
```bash
cd backend
python seed.py
```

### API Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 11. Git Commit History

| Hash | Type | Description |
|------|------|-------------|
| 37931c0 | fix | Accurate unread message badge using is_read tracking |
| 6b2645e | feat | Company message badge in navbar |
| 4d3a0da | feat | Prevent duplicate applications with Already Applied badge |
| bfff471 | feat | Inline profile editing in apply modal |
| 24c8e6d | feat | Implement 6 job portal enhancements |
| 0b96b3e | feat | Add backend utility scripts, OpenAPI spec, frontend scaffold |
| cd8e7b1 | chore | Exclude reference-only docs from version control |
| f220824 | docs | Update README with full setup instructions and API reference |
| 90ddaed | feat | Auto-generated Python SDK and automation batch scripts |
| 5a9e165 | feat | Company portal: dashboard, post job, applicants, messaging |
| 80d3b61 | feat | Seeker pages: jobs, internships, apply, profile, inbox |
| 49b792c | feat | React setup, AuthContext, Axios API layer, routing |
| ccc171e | test | Add unit tests for auth, jobs, apply logic |
| 896f634 | feat | Users, companies, messages routers: backend complete |
| 3811ee2 | feat | Jobs and internships CRUD endpoints with business logic |
| 47f0192 | feat | JWT authentication, signup and login endpoints |
| bc90b0c | feat | Pydantic schemas, requirements, seed data |
| 9582f4b | feat | SQLAlchemy models and Alembic migration setup |
| a62fcb0 | init | Project setup and README |

---

*Document generated: April 22, 2026*
*Total commits: 19 | Active branch: main | Repo: Sujitha1306/Aumne*
