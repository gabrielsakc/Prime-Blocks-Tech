@echo off
echo Starting Prime Blocks Tech EPS Calculator...
echo.
echo 1. Launching development server...
start /b npm run dev
timeout /t 3 /nobreak > nul
echo 2. Opening application in browser...
start http://localhost:5173
echo.
echo Calculator ready! Do not close this window while using the app.
pause
