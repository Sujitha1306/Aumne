# Job Portal System

A full-stack job application portal built with FastAPI, SQLite, React, and Tailwind v4. Designed around a "Trick Logic" application engine that inherently rejects duplicates and enforces deadline constraints at both the application and database layer.

## Architecture Structure

- **`backend/`**: FastAPI Server and SQLite/Alembic database config. Exposed at `http://localhost:8000`.
- **`frontend/`**: React JS Frontend with Tailwind v4 styling. Exposed at `http://localhost:5173`.
- **`job_sdk/`**: Automatically generated OpenAPI Python SDK for programmatic job queries.
- **`setupdev.bat`**: Windows batch script for setting up the environment.
- **`runapplication.bat`**: Windows batch script to initialize both servers simultaneously.

## Prerequisites

- **Python 3.10+** (Required for the `match` patterns and robust typing)
- **Node.js 18+** (Required for React frontend compilation)
- **openapi-generator-cli** (Requires Java - automatically downloads during Phase 4 generation)

## Zero-Start Setup Instructions

This repository is designed to initialize entirely via Windows batch scripts.

1. Ensure `python` and `npm` are in your PATH environment variables.
2. Open a PowerShell or Command Prompt terminal at the project root (`C:\Users\...\Aumne`).
3. Run the automated setup sequence:
```cmd
setupdev.bat
```
*(This creates the Python virtual environment, installs backend dependencies via `requirements.txt`, applies Alembic DB schemas, and executes `npm install` for the React layer.)*

## Running the Architecture

To start the Job Portal, invoke the unified run script:

```cmd
runapplication.bat
```

This will launch two separate detached `cmd` windows:
1. **FastAPI Engine**: Running `uvicorn main:app --reload` on port `8000`.
2. **React UI**: Running `vite` on port `5173` pointing to `http://localhost:5173`.

> **Note**: Both processes must be allowed through Windows firewall if prompted. The backend is safely configured to accept CORS from `localhost:5173`.

## The "Trick Logic" Validation UX

The backend endpoints reject invalid applications based on real-time rules:
- **`404 Not Found`**: Job ID does not exist in the DB.
- **`409 Conflict`**: An applicant under the exact same name has already applied. (Caught via an ORM query, backed by a DB-level UniqueConstraint).
- **`422 Unprocessable Entity`**: The absolute server timestamp has passed the `job.deadline`.
- **`201 Created`**: Verification successful. 

The React Frontend will natively catch these errors with direct feedback on the Applicant Form component.

## SDK Interaction

The project automatically bundles a generated Python SDK. Check the sample scripts in tests to initialize an automated client utilizing models like `JobResponse` and `ApplicationCreate`.
