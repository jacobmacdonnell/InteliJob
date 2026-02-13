@echo off
title InteliJob - Cert Research Tool
echo.
echo  ========================================
echo   InteliJob v3 - Cert Research Tool
echo  ========================================
echo.

cd /d "%~dp0"

:: Start backend
echo  Starting backend...
start "InteliJob Backend" /min cmd /c "cd backend && ..\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000"

:: Wait for backend to be ready
timeout /t 3 /nobreak >nul

:: Start frontend
echo  Starting frontend...
start "InteliJob Frontend" /min cmd /c "npm run dev"

:: Wait for vite to spin up
timeout /t 2 /nobreak >nul

:: Open browser
echo  Opening browser...
start http://localhost:5173

echo.
echo  App is running at: http://localhost:5173
echo  Press any key to stop everything...
echo.
pause >nul

:: Kill both servers
echo  Shutting down...
taskkill /fi "WINDOWTITLE eq InteliJob Backend*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq InteliJob Frontend*" /f >nul 2>&1
echo  Done.
timeout /t 2 /nobreak >nul
