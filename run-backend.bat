@echo off
title Solar Field Desk - FastAPI Backend
echo ========================================================
echo Starting Solar Field Desk Backend on http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0backend"

REM Try python first, fallback to Python 3.12 path if needed
python -m uvicorn app.main:app --reload --port 8000
if %errorlevel% neq 0 (
    echo.
    echo Trying with Python 3.12...
    "C:\Users\Admin\AppData\Local\Programs\Python\Python312\python.exe" -m uvicorn app.main:app --reload --port 8000
)
pause

