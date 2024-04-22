@echo off
echo ============================================
echo   Job Portal - Starting Application Servers
echo ============================================
echo.

echo Starting FastAPI Backend...
start cmd /k "call env\Scripts\activate.bat && cd backend && uvicorn main:app --reload"

echo Starting React Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both terminal windows have been launched.
echo Backend API available at: http://localhost:8000
echo Frontend available at: http://localhost:5173
echo.
