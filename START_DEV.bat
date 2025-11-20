@echo off
echo Starting VoxBridge Development Servers...
echo.
echo [1/2] Starting TTS Server on port 3002...
start "TTS Server" cmd /k "node server-local.js"
timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite Dev Server on port 3000...
start "Vite Dev" cmd /k "npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo   TTS Server:  http://localhost:3002
echo   Frontend:    http://localhost:3000
echo ========================================
echo.
echo Press any key to exit (servers will keep running)...
pause >nul
