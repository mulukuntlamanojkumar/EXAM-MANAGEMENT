@echo off
title React Frontend - Exam Management System
color 0E

echo ================================================
echo   React + Vite Frontend - Exam Management
echo ================================================
echo.
echo [*] Frontend URL : http://localhost:5173
echo.
echo [!] Make sure the Backend is running first (start-backend.bat)
echo.

REM Change to frontend directory
cd /d "%~dp0frontend"

REM Check Node.js / npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    REM Try the default nodejs path
    if exist "%USERPROFILE%\nodejs\npm.cmd" (
        SET PATH=%USERPROFILE%\nodejs;%PATH%
    ) else (
        echo [ERROR] 'npm' command not found. Is Node.js installed?
        echo.
        echo Download Node.js 20 LTS from: https://nodejs.org
        echo.
        pause
        exit /b 1
    )
)

REM Install dependencies if node_modules is missing
if not exist "node_modules" (
    echo [*] node_modules not found. Installing dependencies...
    echo.
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo.
)

echo [*] Starting Vite dev server...
echo [*] Press Ctrl+C to stop the frontend
echo.

npm run dev

echo.
echo [*] Frontend stopped.
pause
