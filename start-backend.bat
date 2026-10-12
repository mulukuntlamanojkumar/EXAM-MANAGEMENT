@echo off
title Spring Boot Backend - Exam Management System
color 0B

echo ================================================
echo   Spring Boot 3 Backend - Exam Management
echo ================================================
echo.
echo [*] Backend API  : http://localhost:8080/api
echo [*] Health check : http://localhost:8080/api/public/health
echo.
echo [!] Make sure MongoDB is running first (start-mongodb.bat)
echo.

REM Change to backend directory
cd /d "%~dp0backend"

REM Check Maven is available
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 'mvn' command not found. Is Maven installed and on your PATH?
    echo.
    echo Download Maven from: https://maven.apache.org/download.cgi
    echo.
    pause
    exit /b 1
)

echo [*] Starting Spring Boot with Maven...
echo [*] Press Ctrl+C to stop the backend
echo.

mvn spring-boot:run

echo.
echo [*] Backend stopped.
pause
