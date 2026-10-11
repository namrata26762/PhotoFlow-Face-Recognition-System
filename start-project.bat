@echo off
title PhotoFlow Launcher
color 0A

echo ===================================================
echo        📸 PhotoFlow — AI Face Recognition
echo         BCA Final Year Project Launcher
echo ===================================================
echo.

echo [1/3] Checking MongoDB service...
net start MongoDB >nul 2>&1
echo [OK] MongoDB is ready.
echo.

echo [2/3] Starting PhotoFlow Backend (Port 5000)...
start "PhotoFlow Backend API" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 3 /nobreak >nul

echo [3/3] Starting PhotoFlow Frontend (Port 5173)...
start "PhotoFlow Frontend React" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ===================================================
echo  Opening PhotoFlow in your default browser...
echo  URL: http://localhost:5173
echo ===================================================
start http://localhost:5173

echo.
echo Both servers are now running!
echo Keep the terminal windows open while using the app.
echo.
pause
