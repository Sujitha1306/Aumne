@echo off
TITLE Job Portal System - Master Launcher

:: Step 1: Start the Backend
echo [1/2] Launching FastAPI Backend...
:: Using 'start' to open a new terminal window for the backend process
:: 'cmd /k' keeps the window open even if the process crashes for debugging
start "Job Portal - API Server" cmd /k "call env\Scripts\activate.bat && cd backend && python main.py"

:: Step 2: Start the Frontend
echo [2/2] Launching React Frontend...
:: Navigates to the frontend directory and triggers the npm start script
start "Job Portal - UI Terminal" cmd /k "cd frontend && npm start"

echo.
echo -----------------------------------------------------------
echo Status: Both servers are initiating in separate windows.
echo - Backend: http://localhost:8000/docs (Swagger UI)
echo - Frontend: http://localhost:3000 (or default port)
echo -----------------------------------------------------------
pause
