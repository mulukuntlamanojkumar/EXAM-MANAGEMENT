@echo off
title MongoDB - Exam Management System
color 0A

echo ================================================
echo   MongoDB 7.0 - Exam Management System
echo ================================================
echo.

SET MONGO_HOME=%USERPROFILE%\mongodb
SET MONGO_BIN=%MONGO_HOME%\bin
SET MONGO_DATA=%MONGO_HOME%\data
SET MONGO_LOG=%MONGO_HOME%\logs

REM Create directories if they don't exist
if not exist "%MONGO_DATA%" mkdir "%MONGO_DATA%"
if not exist "%MONGO_LOG%" mkdir "%MONGO_LOG%"

echo [*] MongoDB binary : %MONGO_BIN%\mongod.exe
echo [*] Data directory : %MONGO_DATA%
echo [*] Port           : 27017
echo.

if not exist "%MONGO_BIN%\mongod.exe" (
    echo [ERROR] mongod.exe not found at %MONGO_BIN%\mongod.exe
    echo.
    echo Please download MongoDB 7.0 from:
    echo   https://www.mongodb.com/try/download/community
    echo.
    pause
    exit /b 1
)

echo [*] Starting MongoDB...
echo [*] Press Ctrl+C to stop MongoDB
echo.

"%MONGO_BIN%\mongod.exe" --dbpath "%MONGO_DATA%" --port 27017 --bind_ip 127.0.0.1 --logpath "%MONGO_LOG%\mongod.log" --logappend

echo.
echo [*] MongoDB stopped.
pause
