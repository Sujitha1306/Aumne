@echo off
echo ============================================
echo   Job Portal - Development Environment Setup
echo ============================================
echo.

REM Step 1: Create virtual environment
echo [1/4] Creating Python virtual environment...
python -m venv env
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment. Ensure Python 3.10+ is installed.
    exit /b 1
)

REM Step 2: Activate and install dependencies
echo [2/4] Installing Python dependencies...
call env\Scripts\activate.bat
pip install -r backend\requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies.
    exit /b 1
)

REM Step 3: Run Alembic migrations
echo [3/4] Running database migrations...
cd backend
alembic upgrade head
if errorlevel 1 (
    echo ERROR: Failed to run database migrations.
    cd ..
    exit /b 1
)
cd ..

REM Step 4: Install Frontend dependencies
echo [4/4] Installing Frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies.
    cd ..
    exit /b 1
)
cd ..

echo.
echo ============================================
echo   Setup finished successfully!
echo   Run 'runapplication.bat' to start the app.
echo ============================================
